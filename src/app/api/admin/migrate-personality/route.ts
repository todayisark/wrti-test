/**
 * 数据迁移 API
 * POST /api/admin/migrate-personality
 * 将现有的 quiz_results 记录计算 personality_result 并保存到数据库
 */

import { NextResponse } from 'next/server';
import { calculateScores, getFinalCharactersWithTiebreak } from '@/features/quiz/server/scoring';
import { QUESTIONS } from '@/features/quiz/constants';
import type { QuizOption } from '@/features/quiz/types';
import { createClient } from '@/lib/supabase/server';

export const POST = async (request: Request) => {
  try {
    // 验证密钥（防止未授权访问）
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;

    if (authHeader !== expectedToken) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
    }

    const supabase = await createClient();

    // 获取所有没有 personality_result 的记录
    const { data: records, error: fetchError } = await supabase
      .from('quiz_results')
      .select('id, selected_options, scores')
      .is('personality_result', null)
      .order('id', { ascending: true });

    if (fetchError) {
      throw new Error(`获取数据错误: ${fetchError.message}`);
    }

    const total = records?.length || 0;
    console.log(`[迁移开始] 找到 ${total} 条需要迁移的记录`);

    if (total === 0) {
      return NextResponse.json({
        success: true,
        message: '没有需要迁移的记录',
        stats: {
          总计: 0,
          成功: 0,
          跳过: 0,
          失败: 0,
        },
      });
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // 根据选项 ID 找到对应的选项对象
    const findOptionsByIds = (optionIds: string[]): QuizOption[] => {
      const options: QuizOption[] = [];
      for (const optionId of optionIds) {
        for (const question of QUESTIONS) {
          const option = question.options.find((opt) => opt.id === optionId);
          if (option) {
            options.push(option);
            break;
          }
        }
      }
      return options;
    };

    // 逐条处理
    for (let idx = 0; idx < records!.length; idx++) {
      const record = records![idx];
      try {
        const optionIds = record.selected_options || [];

        // 跳过数据不完整的记录
        if (!Array.isArray(optionIds) || optionIds.length !== 24) {
          console.log(`[${idx + 1}/${total}] 记录 ${record.id}: 答案数不正确，跳过`);
          skipCount++;
          continue;
        }

        // 查找所有选项
        const selectedOptions = findOptionsByIds(optionIds);
        if (selectedOptions.length !== 24) {
          console.log(`[${idx + 1}/${total}] 记录 ${record.id}: 存在无效的选项 ID，跳过`);
          skipCount++;
          continue;
        }

        // 计算人格结果
        const scoreMap = calculateScores(selectedOptions);
        const [wendyCode, ireneCode] = getFinalCharactersWithTiebreak(scoreMap, selectedOptions);
        const personalityResult = `${wendyCode}_${ireneCode}`;

        // 更新数据库
        const { error: updateError } = await supabase
          .from('quiz_results')
          .update({ personality_result: personalityResult })
          .eq('id', record.id);

        if (updateError) {
          const errorMsg = `记录 ${record.id}: ${updateError.message}`;
          console.error(`[${idx + 1}/${total}] ✗ ${errorMsg}`);
          errors.push(errorMsg);
          errorCount++;
        } else {
          console.log(`[${idx + 1}/${total}] ✓ 记录 ${record.id}: ${personalityResult}`);
          successCount++;
        }
      } catch (err) {
        const errorMsg = `记录 ${record.id}: ${err instanceof Error ? err.message : String(err)}`;
        console.error(`[${idx + 1}/${total}] ✗ ${errorMsg}`);
        errors.push(errorMsg);
        errorCount++;
      }
    }

    const result = {
      success: true,
      message: `迁移完成`,
      stats: {
        总计: total,
        成功: successCount,
        跳过: skipCount,
        失败: errorCount,
      },
      ...(errors.length > 0 && { errors }),
    };

    console.log(`[迁移完成] ${JSON.stringify(result.stats)}`);
    return NextResponse.json(result);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '未知错误';
    console.error('[迁移失败]', errorMsg);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 },
    );
  }
};
