const targetBands = [6, 6.5, 7, 7.5];

export function countEnglishWords(text: string) {
  return text.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g)?.length ?? 0;
}

export function isPrimarilyEnglish(text: string) {
  const latinLetters = text.match(/[A-Za-z]/g)?.length ?? 0;
  const cjkCharacters = text.match(/[\u3400-\u9FFF]/g)?.length ?? 0;
  const meaningfulCharacters = latinLetters + cjkCharacters;

  return latinLetters >= 80 && meaningfulCharacters > 0
    ? latinLetters / meaningfulCharacters >= 0.8
    : false;
}

export function isValidTargetBand(value: number) {
  return targetBands.includes(value);
}

type WritingSubmissionValidation =
  | {
      ok: true;
      data: {
        questionPrompt: string;
        essayText: string;
        targetBand: number;
        wordCount: number;
      };
    }
  | {
      ok: false;
      error: string;
    };

export function validateWritingSubmission(input: {
  questionPrompt: string;
  essayText: string;
  targetBand: number;
}): WritingSubmissionValidation {
  const questionPrompt = input.questionPrompt.trim();
  const essayText = input.essayText.trim();
  const wordCount = countEnglishWords(essayText);

  if (!questionPrompt) {
    return { error: "请先填写 Task 2 题目。", ok: false };
  }

  if (!essayText) {
    return { error: "请先填写你的英文作文。", ok: false };
  }

  if (!isValidTargetBand(input.targetBand)) {
    return { error: "请选择有效的目标分数。", ok: false };
  }

  if (!isPrimarilyEnglish(essayText)) {
    return { error: "请提交以英文为主的作文。", ok: false };
  }

  if (wordCount < 150) {
    return { error: "Task 2 作文最低允许 150 words。", ok: false };
  }

  return {
    data: {
      questionPrompt,
      essayText,
      targetBand: input.targetBand,
      wordCount,
    },
    ok: true,
  };
}
