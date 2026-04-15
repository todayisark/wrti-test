/**
 * 测试提交验证 Schema
 */

import { z } from 'zod';

/**
 * 单个答案的 Schema
 */
export const QuizAnswerSchema = z.object({
  questionId: z.string(),
  optionId: z.string(),
});

/**
 * 测试提交请求 Schema
 * 必须包含全部 24 道题的答案
 */
export const QuizSubmitSchema = z.object({
  answers: z.array(QuizAnswerSchema).length(24, { message: '必须回答全部 24 道题' }),
});

/**
 * 简化版：直接提交选项 ID 数组
 * 用于直接对接后端计算逻辑
 */
export const QuizSubmitSimpleSchema = z.object({
  optionIds: z.array(z.string()).length(24, { message: '必须提供 24 个选项 ID' }),
});

/**
 * 从 Schema 推断的类型
 */
export type QuizAnswerRequest = z.infer<typeof QuizAnswerSchema>;
export type QuizSubmitRequest = z.infer<typeof QuizSubmitSchema>;
export type QuizSubmitSimpleRequest = z.infer<typeof QuizSubmitSimpleSchema>;
