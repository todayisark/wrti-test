/**
 * 结果计算模块
 * 整合计分和小剧场生成，返回完整的测试结果
 */

import { QUESTIONS, CHARACTER_CARDS, CHILD_PROFILES } from '../constants';
import { calculateScores, getFinalCharacters } from './scoring';
import { generateStory } from './story';
import type { QuizResult, QuizOption, WendyCode, IreneCode, ChildCombinationKey } from '../types';

/**
 * 根据选项 ID 数组查找对应的选项对象
 * @param optionIds 用户选择的选项 ID 数组（如 ['q1_a', 'q2_b', ...]）
 * @returns 选项对象数组
 */
const findOptionsByIds = (optionIds: string[]): QuizOption[] => {
  const options: QuizOption[] = [];

  for (const optionId of optionIds) {
    // 遍历所有题目，找到包含该选项的题目
    for (const question of QUESTIONS) {
      const option = question.options.find((opt) => opt.id === optionId);
      if (option) {
        options.push(option);
        break; // 找到后跳出内层循环
      }
    }
  }

  return options;
};

/**
 * 验证答案的完整性
 * @param optionIds 用户选择的选项 ID 数组
 * @returns 验证结果 { valid: boolean, message?: string }
 */
export const validateAnswers = (optionIds: string[]): { valid: boolean; message?: string } => {
  // 1. 检查数量（应该有 24 个答案）
  if (optionIds.length !== 24) {
    return {
      valid: false,
      message: `答案数量不正确，期望 24 个，实际收到 ${optionIds.length} 个`,
    };
  }

  // 2. 检查是否有重复答案
  const uniqueIds = new Set(optionIds);
  if (uniqueIds.size !== optionIds.length) {
    return {
      valid: false,
      message: '检测到重复的答案',
    };
  }

  // 3. 检查每个选项 ID 是否有效
  const validOptions = findOptionsByIds(optionIds);
  if (validOptions.length !== optionIds.length) {
    return {
      valid: false,
      message: '存在无效的选项 ID',
    };
  }

  return { valid: true };
};

/**
 * 计算测试结果
 * @param optionIds 用户选择的选项 ID 数组（24 个）
 * @returns 完整的测试结果
 */
export const calculateResult = (optionIds: string[]): QuizResult => {
  // 1. 验证答案
  const validation = validateAnswers(optionIds);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  // 2. 获取选项对象
  const selectedOptions = findOptionsByIds(optionIds);

  // 3. 计算分数
  const scoreMap = calculateScores(selectedOptions);

  // 4. 确定最终人格
  const [wendyCode, ireneCode] = getFinalCharacters(scoreMap);

  // 5. 获取人格卡片信息
  const wendyCard = CHARACTER_CARDS[wendyCode];
  const ireneCard = CHARACTER_CARDS[ireneCode];

  // 6. 生成小剧场
  const story = generateStory(wendyCode, ireneCode);

  // 7. 获取孩子人格信息
  const childKey: ChildCombinationKey = `${wendyCode}_${ireneCode}`;
  const childProfile = CHILD_PROFILES[childKey];

  if (!childProfile) {
    throw new Error(`未找到孩子人格组合：${childKey}`);
  }

  // 8. 生成结果标题和摘要
  const resultTitle = `你是「${wendyCard.name} × ${ireneCard.name}」的孩子`;
  const resultSummary = `${childProfile.emoji} ${childProfile.label}`;

  // 9. 构建返回结果
  const result: QuizResult = {
    wendyType: wendyCard,
    ireneType: ireneCard,
    childProfile,
    resultTitle,
    resultSummary,
    story,
  };

  return result;
};

/**
 * 获取人格卡片信息（不需要答题，直接查询）
 * @param wendyCode Wendy 人格代码
 * @param ireneCode Irene 人格代码
 * @returns 人格卡片对
 */
export const getCharacterCards = (wendyCode: WendyCode, ireneCode: IreneCode) => {
  return {
    wendy: CHARACTER_CARDS[wendyCode],
    irene: CHARACTER_CARDS[ireneCode],
  };
};

/**
 * 重新生成小剧场（基于已有结果）
 * @param wendyCode Wendy 人格代码
 * @param ireneCode Irene 人格代码
 * @returns 新的小剧场文本
 */
export const regenerateStory = (wendyCode: WendyCode, ireneCode: IreneCode): string => {
  return generateStory(wendyCode, ireneCode);
};
