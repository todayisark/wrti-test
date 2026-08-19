/**
 * 测试提交 API
 * POST /api/quiz/submit
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { QuizSubmitSimpleSchema } from '@/features/quiz/schemas';
import { calculateResultWithLocale } from '@/features/quiz/server';

/**
 * 提交测试答案并获取结果
 */
export const POST = async (request: Request) => {
  try {
    // 1. 解析请求体
    const body = await request.json();

    // 2. 使用 Zod Schema 验证
    const validated = QuizSubmitSimpleSchema.parse(body);

    // 3. 调用业务逻辑计算结果
    const result = calculateResultWithLocale(
      validated.optionIds,
      validated.userUUID,
      validated.locale || 'zh-CN',
    );

    // 4. 返回成功响应
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    // 处理 Zod 验证错误
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '请求参数错误',
          details: error.issues,
        },
        { status: 400 },
      );
    }

    // 处理业务逻辑错误
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 },
      );
    }

    // 处理未知错误
    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误',
      },
      { status: 500 },
    );
  }
};
