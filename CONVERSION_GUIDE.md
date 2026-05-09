# 📘 Exam to JSON Conversion Guide

This guide provides a standardized workflow for converting raw 9th-grade English entrance exams (Word, PDF, or Plain Text) into the **ExamDefinition** JSON format used by our system.

---

## 1. Core Structure Overview

The hierarchy of an exam follows this path:
**Exam** → **Sections** → **Components (Questions/Passages)**

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
| `wordBank` | An array of words for "Fill in the blank" type sections. | No |
| `components` | An array of individual question objects. | Yes |

---

## 3. Question Type Mapping

### A. Multiple Choice (MCQ)
**Use for**: Phonetics, Grammar, Vocabulary choice.
- **Rule**: `options` must be an array of strings.
- **Rule**: `correctAnswers` must contain the exact string(s) matching the correct option.

```json
{
  "id": "q1",
  "type": "mcq",
  "content": "Choose the word that has the underlined part pronounced differently:",
  "options": ["cat", "hat", "mate", "bat"],
  "correctAnswers": ["mate"]
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
  "correctAnswers": ["interesting"]
}
```

### C. Cloze Test (Traditional)
**Use for**: Passages with numbered blanks where options are listed below the text.
- **Logic**: Use `[id]` markers (e.g., `[21]`) in `passageContent`. The system will render these as `(21) _______`.
- **Blanks**: Each blank will be rendered as a compact MCQ question below the passage.

```json
{
  "id": "q3",
  "type": "cloze",
  "passageContent": "London is the [21] city in the UK. Many people [22] it every year.",
  "blanks": [
    { 
      "id": "21", 
      "type": "select", 
      "options": ["largest", "larger", "large", "most large"], 
      "correctAnswers": ["largest"],
      "explanation": "Superlative form is required here."
    },
    { 
      "id": "22", 
      "type": "select", 
      "options": ["visit", "visits", "visiting", "visited"], 
      "correctAnswers": ["visit"],
      "explanation": "Present simple for a general fact with plural subject."
    }
  ],
  "explanation": "This passage is about London's geography and tourism."
}
```

### D. Essay / Writing
**Use for**: Paragraph writing, Letter writing.

```json
{
  "id": "q4",
  "type": "essay",
  "promptText": "Write a paragraph (100-150 words) about your favorite hobby.",
  "minWords": 100,
  "maxWords": 150,
  "rubric": "Structure (2pts), Grammar (3pts), Content (5pts)"
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
4. **Validation**: Ensure every `[id]` in a Cloze passage has a corresponding definition in the `blanks` array.
