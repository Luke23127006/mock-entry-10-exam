# 📘 Exam to JSON Conversion Guide

This guide provides a standardized workflow for converting raw 9th-grade English entrance exams (Word, PDF, or Plain Text) into the **ExamDefinition** JSON format used by our system.

---

## 1. Core Structure Overview

The hierarchy of an exam follows this path:
**Exam** → **Sections** → **Components (Questions/Passages)**

### 💡 Text Formatting: Underlining
To underline specific parts of words or sentences (essential for phonetics or error identification), use the `__text__` syntax.
- Example: `play__ed__` renders as play<u>ed</u>.
- Example: `(A) __The__ children (B) __enjoy__...` renders as (A) <u>The</u> children (B) <u>enjoy</u>...

### Global Exam Object
```json
{
  "title": "Mock Entrance Exam - Grade 10 English",
  "sections": []
}
```

---

## 2. Section Definitions

Every exam must be split into logical sections (e.g., Phonetics, Vocabulary, Reading, Writing).

| Property | Description | Required |
| :--- | :--- | :--- |
| `title` | The name of the section (e.g., "Part A: Phonetics") | Yes |
| `instruction` | Guidance for the student (e.g., "Choose the word with different stress.") | No |
| `readingPassage` | A long block of text used for multiple questions. | No |

> [!TIP]
> **Pro Tip for Instructions**: When creating instructions for writing or transformation sections, remind students to **notice the first capital letter** at the beginning of the sentence and the **full stop** at the end.
| `wordBank` | An array of words for "Fill in the blank" type sections. | No |
| `components` | An array of individual question objects. | Yes |

---

### General Question Properties
All question types support these optional fields:
- `pointValue`: (Number) How many points the question is worth. Defaults to 1.
- `explanation`: (String) Pedagogical feedback shown in Review Mode.

---

## 3. Question Type Mapping

### A. Multiple Choice (MCQ)
**Use for**: Phonetics, Grammar, Vocabulary choice.
- **Rule**: `options` must be an array of strings.
- **Rule**: `correctAnswers` must contain the exact string(s) matching the correct option.
- **Visual Options**:
    - `variant`: Set to `"compact"` for horizontal alignment (good for cloze-style).
    - `layout`: 
        - `"4x1"` (Vertical - Default)
        - `"2x2"` (Grid)
        - `"1x4"` (Horizontal - Default for compact)

```json
{
  "id": "q1",
  "type": "mcq",
  "content": "Choose the word with different stress:",
  "options": ["teacher", "student", "advice", "parent"],
  "correctAnswers": ["advice"],
  "layout": "2x2"
}
```

### B. Short Input
**Use for**: Word formation (Verb forms), Transformation (sentence completion).
- **Prefix**: Use if the question starts with a fixed word (e.g., "He...").

```json
{
  "id": "q2",
  "type": "short_input",
  "content": "Supply the correct form of the word in brackets: INTEREST",
  "prefix": "This movie is very",
  "correctAnswers": ["interesting"],
  "pointValue": 0.5
}
```

### C. Short Writing
**Use for**: Factual short-answer questions (e.g., Reading Comprehension short answers).
- **Grading**: Graded by AI because there may be multiple valid ways to answer. Provide multiple variations in `correctAnswers` to serve as a reference for AI grading.

```json
{
  "id": "q26",
  "type": "short_writing",
  "content": "When and where was Thomas Edison born?",
  "pointValue": 0.4,
  "correctAnswers": [
    "He was born in 1847 in the United States.",
    "In 1847 in the United States."
  ]
}
```

### D. Reading Passage + Questions (Preferred Pattern)
**Use for**: Cloze tests or Reading Comprehension.
- **Logic**: Place the text in the section's `readingPassage` field. For cloze tests, provide a `wordBank` if applicable.
- **Placeholder**: Manually type `(21) _______` inside the reading passage text.
- **Question Labels**: Set the MCQ `content` to `(21)` to match the text.
- **Optimization**: Use `"variant": "compact"` and `"layout": "1x4"` for a professional paper-like look.

```json
{
  "title": "PART C. READING COMPREHENSION - Section I",
  "instruction": "Read the following paragraph and fill in each gap with a suitable word provided in the box.",
  "wordBank": ["however", "because", "which", "for", "into", "on"],
  "readingPassage": "The invention of the Internet has changed the way we communicate and share information. It was created (21) ______ people to exchange data easily...",
  "components": [
    {
      "id": "q21",
      "type": "mcq",
      "content": "(21)",
      "options": ["however", "because", "which", "for", "into", "on"],
      "correctAnswers": ["for"],
      "pointValue": 0.2,
      "variant": "compact",
      "layout": "1x4"
    }
  ]
}
```

### E. Essay / Writing
**Use for**: Paragraph writing, Letter writing.
- **Grading**: Graded by AI, which will evaluate the response semantically based on the prompt, `minWords`, `maxWords`, and any `explanation` or rubric provided.

```json
{
  "id": "q36",
  "type": "essay",
  "promptText": "Write a paragraph (100-120 words) about the benefits of doing housework for teenagers.",
  "minWords": 100,
  "maxWords": 120,
  "pointValue": 1,
  "explanation": "Doing housework brings many significant benefits for teenagers..."
}
```

---

## 4. Conversion Workflow (Step-by-Step)

### Step 1: Identify Sections
Scan the paper for bold headers like "PHONETICS", "READING COMPREHENSION", etc. Create a `Section` for each.

### Step 2: Extract Reading Passages
If a set of questions refers to a single long text, move that text to the section's `readingPassage` field instead of repeating it in every question.

### Step 3: Handle Numbering
Assign unique IDs (e.g., `s1_q1`, `s1_q2`). If the exam has 40 questions total, ensure the IDs are sequential and do not collide across sections.

### Step 4: Map Correct Answers & Explanations
Always extract the answer key.
- For `mcq`, ensure the answer exactly matches one of the options.
- For `short_input`, provide common variations if applicable (e.g., `["interesting", "INTERESTING"]`).
- **Explanation**: You can now add an optional `"explanation": "..."` field to any question object. This will be shown to students after they submit the exam to help them understand why an answer is correct.

---

## 5. Checklist for Developers (Automation)

If building a script to automate this:
1. **Regex for MCQ**: Look for patterns like `(A.)`, `(B.)` to split options.
2. **Cloze Detection**: Search for numbers in parentheses `(21)`, `(22)` and replace with `[21]`, `[22]`.
3. **Clean-up**: Strip out unnecessary Word formatting artifacts (like `\r\n` or double spaces).
5. **Grammar Reminders**: Ensure the `instruction` property for writing/reading sections explicitly reminds students to notice the first capital letter at the start of sentences and the full stop at the end.
