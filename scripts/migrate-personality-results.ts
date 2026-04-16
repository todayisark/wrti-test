/**
 * 迁移脚本：计算现有数据的最终人格结果并保存到数据库
 * 运行：npx ts-node scripts/migrate-personality-results.ts
 */

import { createClient } from '@supabase/supabase-js';
import {
  calculateScores,
  getFinalCharactersWithTiebreak,
} from '../src/features/quiz/server/scoring';
import { QUESTIONS } from '../src/features/quiz/constants';
import type { QuizOption } from '../src/features/quiz/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('缺少环境变量: NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// 根据选项 ID 找到对应的选项对象
function findOptionsByIds(optionIds: string[]): QuizOption[] {
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
}

// 主迁移函数
async function migratePersonalityResults() {
  console.log('开始迁移数据...\n');

  try {
    // 1. 获取所有没有 personality_result 的记录
    const { data: records, error: fetchError } = await supabase
      .from('quiz_results')
      .select('id, selected_options, scores')
      .is('personality_result', null);

    if (fetchError) {
      console.error('获取数据错误:', fetchError);
      process.exit(1);
    }

    const total = records?.length || 0;
    console.log(`找到 ${total} 条需要迁移的记录\n`);

    if (total === 0) {
      console.log('✓ 没有需要迁移的记录');
      process.exit(0);
    }

    // 2. 逐条处理
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < records!.length; i++) {
      const record = records![i];
      try {
        const optionIds = record.selected_options || [];

        // 跳过数据不完整的记录
        if (!Array.isArray(optionIds) || optionIds.length !== 24) {
          console.log(`[${i + 1}/${total}] 记录 ${record.id}: 答案数不正确，跳过`);
          skipCount++;
          continue;
        }

        // 计算人格结果
        const selectedOptions = findOptionsByIds(optionIds);

        // 检查是否所有选项都找到了
        if (selectedOptions.length !== 24) {
          console.log(`[${i + 1}/${total}] 记录 ${record.id}: 存在无效的选项 ID，跳过`);
          skipCount++;
          continue;
        }

        const scoreMap = calculateScores(selectedOptions);
        const [wendyCode, ireneCode] = getFinalCharactersWithTiebreak(scoreMap, selectedOptions);
        const personalityResult = `${wendyCode}_${ireneCode}`;

        // 更新数据库
        const { error: updateError } = await supabase
          .from('quiz_results')
          .update({ personality_result: personalityResult })
          .eq('id', record.id);

        if (updateError) {
          console.error(`[${i + 1}/${total}] 记录 ${record.id}: 更新失败 -`, updateError.message);
          errorCount++;
        } else {
          console.log(`[${i + 1}/${total}] ✓ 记录 ${record.id}: ${personalityResult}`);
          successCount++;
        }
      } catch (err) {
        console.error(
          `[${i + 1}/${total}] 记录 ${record.id}: 异常 -`,
          err instanceof Error ? err.message : String(err),
        );
        errorCount++;
      }
    }

    console.log(`\n迁移完成！\n成功: ${successCount}, 跳过: ${skipCount}, 失败: ${errorCount}\n`);
    process.exit(errorCount > 0 ? 1 : 0);
  } catch (err) {
    console.error('迁移失败:', err);
    process.exit(1);
  }
}

// 运行迁移
migratePersonalityResults();
