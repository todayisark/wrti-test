/**
 * 人格分布统计 API（不去重）
 * GET /api/admin/personality-stats
 * 按提交次数统计 16 种人格类型数量和占比
 */

import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const PERSONALITY_TYPES = [
  'W1_I1',
  'W1_I2',
  'W1_I3',
  'W1_I4',
  'W2_I1',
  'W2_I2',
  'W2_I3',
  'W2_I4',
  'W3_I1',
  'W3_I2',
  'W3_I3',
  'W3_I4',
  'W4_I1',
  'W4_I2',
  'W4_I3',
  'W4_I4',
] as const;

type PersonalityType = (typeof PERSONALITY_TYPES)[number];

export const GET = async (request: Request) => {
  try {
    // 验证密钥（防止未授权访问）
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;

    if (authHeader !== expectedToken) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
    }

    // 使用 SERVICE_ROLE_KEY 创建无 RLS 限制的客户端
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: rows, error: fetchError } = await supabase
      .from('quiz_results')
      .select('personality_result')
      .not('personality_result', 'is', null);

    if (fetchError) {
      throw new Error(`获取统计数据失败: ${fetchError.message}`);
    }

    const counts: Record<PersonalityType, number> = {
      W1_I1: 0,
      W1_I2: 0,
      W1_I3: 0,
      W1_I4: 0,
      W2_I1: 0,
      W2_I2: 0,
      W2_I3: 0,
      W2_I4: 0,
      W3_I1: 0,
      W3_I2: 0,
      W3_I3: 0,
      W3_I4: 0,
      W4_I1: 0,
      W4_I2: 0,
      W4_I3: 0,
      W4_I4: 0,
    };

    for (const row of rows ?? []) {
      const result = row.personality_result as string;
      if (result in counts) {
        counts[result as PersonalityType] += 1;
      }
    }

    const totalSubmissions = (rows ?? []).length;

    const distribution = PERSONALITY_TYPES.map((type) => {
      const count = counts[type];
      const ratio =
        totalSubmissions > 0 ? Number(((count / totalSubmissions) * 100).toFixed(2)) : 0;

      return {
        personalityType: type,
        count,
        ratio,
      };
    }).sort((a, b) => b.count - a.count || a.personalityType.localeCompare(b.personalityType));

    return NextResponse.json({
      success: true,
      data: {
        totalSubmissions,
        distribution,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '未知错误';
    console.error('[人格分布统计失败]', errorMsg);

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 },
    );
  }
};
