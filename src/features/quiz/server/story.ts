/**
 * 小剧场生成模块
 * 使用句子池随机生成个性化小剧场
 */

import { STORY_TEMPLATES } from '../constants';
import type { CharacterCode, WendyCode, IreneCode } from '../types';

/**
 * 从数组中随机选择一个元素
 */
const randomPick = <T>(array: T[]): T => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

/**
 * 生成完整的小剧场文本
 * @param wendyCode Wendy 人格类型
 * @param ireneCode Irene 人格类型
 * @returns 生成的小剧场文本
 */
export const generateStory = (wendyCode: WendyCode, ireneCode: IreneCode): string => {
  // 1. 随机选择开场
  const opening = randomPick(STORY_TEMPLATES.opening);
  
  // 2. 根据 Wendy 人格选择对应的行为描述
  const wendyActions = STORY_TEMPLATES.wendyActions[wendyCode];
  const wendyAction = randomPick(wendyActions);
  
  // 3. 根据 Irene 人格选择对应的行为描述
  const ireneActions = STORY_TEMPLATES.ireneActions[ireneCode];
  const ireneAction = randomPick(ireneActions);
  
  // 4. 随机选择孩子的反应
  const childReaction = randomPick(STORY_TEMPLATES.childReactions);
  
  // 5. 随机选择结尾
  const ending = randomPick(STORY_TEMPLATES.endings);
  
  // 6. 组合成完整文本（用换行符分隔段落）
  return [
    opening,
    wendyAction,
    ireneAction,
    childReaction,
    ending
  ].join('\n\n');
};

/**
 * 批量生成多个小剧场（用于展示不同可能性）
 * @param wendyCode Wendy 人格类型
 * @param ireneCode Irene 人格类型
 * @param count 生成数量
 * @returns 生成的小剧场数组
 */
export const generateMultipleStories = (
  wendyCode: WendyCode,
  ireneCode: IreneCode,
  count: number = 3
): string[] => {
  const stories: string[] = [];
  
  for (let i = 0; i < count; i++) {
    stories.push(generateStory(wendyCode, ireneCode));
  }
  
  return stories;
};

/**
 * 预览句子池内容（开发/调试用）
 * @param wendyCode Wendy 人格类型
 * @param ireneCode Irene 人格类型
 * @returns 该人格组合可用的所有句子片段
 */
export const previewTemplates = (wendyCode: WendyCode, ireneCode: IreneCode) => {
  return {
    opening: STORY_TEMPLATES.opening,
    wendyActions: STORY_TEMPLATES.wendyActions[wendyCode],
    ireneActions: STORY_TEMPLATES.ireneActions[ireneCode],
    childReactions: STORY_TEMPLATES.childReactions,
    endings: STORY_TEMPLATES.endings
  };
};
