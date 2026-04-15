/**
 * Schema 验证辅助函数
 */

import type { QuizAnswerRequest } from './submit';

/**
 * 将答案数组转换为选项 ID 数组
 * @param answers 答案数组（包含 questionId 和 optionId）
 * @returns 选项 ID 数组
 */
export const answersToOptionIds = (answers: QuizAnswerRequest[]): string[] => {
  return answers.map((answer) => answer.optionId);
};

/**
 * 验证答案数组是否包含所有必需的题目
 * @param answers 答案数组
 * @param expectedQuestionIds 期望的题目 ID 列表
 * @returns 验证结果
 */
export const validateQuestionIds = (
  answers: QuizAnswerRequest[],
  expectedQuestionIds: string[],
): { valid: boolean; message?: string } => {
  const answerQuestionIds = answers.map((a) => a.questionId);
  const answerSet = new Set(answerQuestionIds);

  // 检查是否有重复
  if (answerSet.size !== answers.length) {
    return {
      valid: false,
      message: '存在重复的题目 ID',
    };
  }

  // 检查是否包含所有必需的题目
  const missingQuestions = expectedQuestionIds.filter((id) => !answerSet.has(id));

  if (missingQuestions.length > 0) {
    return {
      valid: false,
      message: `缺少以下题目的答案: ${missingQuestions.join(', ')}`,
    };
  }

  return { valid: true };
};
