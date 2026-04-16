/**
 * 测试提交 API
 * POST /api/quiz/submit
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { QuizSubmitSimpleSchema } from '@/features/quiz/schemas';
import { calculateResultWithLocale } from '@/features/quiz/server';
import { createClient } from '@/lib/supabase/server';

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

    // 3.2 保证 user_uuid 一定是合法 UUID（兼容旧版本本地缓存）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const userUUID =
      validated.userUUID && uuidRegex.test(validated.userUUID)
        ? validated.userUUID
        : crypto.randomUUID();

    // 3.5 保存结果到数据库
    const supabase = await createClient();
    const { error: insertError } = await supabase.from('quiz_results').insert({
      user_uuid: userUUID,
      selected_options: validated.optionIds,
      scores: result.scores,
    });

    if (insertError) {
      console.error('数据库插入错误:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: '结果保存失败，请稍后重试',
        },
        { status: 500 },
      );
    }

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
