import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TEST_USER = {
  username: `testuser_${Date.now()}`,
  password: 'testpassword123',
  full_name: 'Playwright Test User',
};

const TEST_EXAM = {
  title: `Playwright Test Exam ${Date.now()}`,
  content: {
    questions: [
      {
        id: 'q1',
        part: 'A',
        type: 'single',
        pointValue: 1,
        content: 'What is 2+2?',
        options: ['3', '4', '5'],
        correctAnswers: ['4']
      },
      {
        id: 'q2',
        part: 'D',
        type: 'writing',
        pointValue: 2,
        content: 'Write a test sentence.',
        rubric: 'Check grammar'
      }
    ]
  }
};

let examId = '';
let attemptId = '';
let userId = '';

test.describe.serial('API Integration Flow', () => {
  
  test('1. Register', async ({ request }) => {
    const res = await request.post('/api/v1/auth/register', {
      data: TEST_USER
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    // In our app, register logs you in, but let's just make sure it returns ok
    // If it returns a redirect or similar, we just verify ok status
    expect(data.error).toBeUndefined();
  });

  test('2. Login', async ({ request }) => {
    const res = await request.post('/api/v1/auth/login', {
      data: {
        username: TEST_USER.username,
        password: TEST_USER.password
      }
    });
    expect(res.ok()).toBeTruthy();
    
    // Check cookie
    const headers = res.headers();
    const setCookie = headers['set-cookie'] || '';
    expect(setCookie).toContain('session_user_id=');
    
    // Extract userId to use in teardown and manual DB operations
    const match = setCookie.match(/session_user_id=([^;]+)/);
    expect(match).not.toBeNull();
    if (match) {
      userId = match[1];
    }
  });

  test('3. Upload Exam', async ({ request }) => {
    const res = await request.post('/api/v1/admin/upload-exam', {
      data: TEST_EXAM
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.examId).toBeDefined();
    examId = data.examId;
  });

  test('4. Save Draft', async ({ request }) => {
    expect(examId).toBeTruthy();
    expect(userId).toBeTruthy();

    // Normally, the frontend creates the draft attempt via Server Component on /exam/[id].
    // Since we are bypassing the UI, we'll manually insert a draft attempt to simulate that.
    const { data: attempt, error } = await supabase
      .from('exam_attempts')
      .insert({
        user_id: userId,
        exam_id: examId,
        status: 'draft',
        answers: {}
      })
      .select('id')
      .single();
    
    expect(error).toBeNull();
    expect(attempt).toBeTruthy();
    attemptId = attempt!.id;

    // Test the save-draft API
    const res = await request.post('/api/v1/attempts/save-draft', {
      headers: {
        'Cookie': `session_user_id=${userId}`
      },
      data: {
        attemptId,
        answers: {
          q1: '4',
          q2: 'This is a test sentence.'
        }
      }
    });
    const data = await res.json();
    if (!res.ok()) {
      console.error('Save Draft failed with:', data);
    }
    expect(res.ok()).toBeTruthy();
    expect(data.success).toBe(true);
  });

  test('5. Submit Exam', async ({ request }) => {
    expect(attemptId).toBeTruthy();

    // Use a longer timeout for this specific test block since the Gemini API might take a few seconds
    test.setTimeout(30000);

    const res = await request.post('/api/v1/attempts/submit', {
      headers: {
        'Cookie': `session_user_id=${userId}`
      },
      data: {
        attemptId,
        answers: {
          q1: '4',
          q2: 'This is a perfect test sentence.'
        }
      }
    });
    
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    
    // Verify response
    expect(data.success).toBe(true);
    expect(data.redirect).toContain('/result');

    // Verify DB update
    const { data: dbAttempt } = await supabase
      .from('exam_attempts')
      .select('status, score, feedback')
      .eq('id', attemptId)
      .single();

    expect(dbAttempt?.status).toBe('completed');
    expect(dbAttempt?.score).toBeDefined();
    expect(dbAttempt?.feedback).toBeDefined();
    
    const parsedFeedback = typeof dbAttempt?.feedback === 'string' 
      ? JSON.parse(dbAttempt.feedback) 
      : dbAttempt?.feedback;

    console.log('Parsed Feedback:', parsedFeedback);
    
    // Check that Gemini populated the feedback for q2
    expect(parsedFeedback?.q2).toBeDefined();
    expect(parsedFeedback?.q2?.score).toBeDefined();
  });

  test.afterAll(async () => {
    // Teardown: Clean up the database
    // ON DELETE CASCADE on exam_attempts means deleting user/exam will remove the attempts automatically.
    if (userId) {
      await supabase.from('users').delete().eq('id', userId);
    }
    if (examId) {
      await supabase.from('exams').delete().eq('id', examId);
    }
  });

});
