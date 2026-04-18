/**
 * 小剧场生成模块
 * 使用人格组合键直接读取完整故事
 */

import { STORY_TEMPLATES } from '../constants';
import type { WendyCode, IreneCode, ChildCombinationKey } from '../types';
import type { Locale } from '@/i18n/config';
import storyTemplatesEnUS from '../data/story-templates.en-US.json';

const STORY_TEMPLATES_EN_US = storyTemplatesEnUS as Record<string, string>;

const getStoryTemplatesByLocale = (locale: Locale = 'zh-CN') => {
  return locale === 'en-US' ? STORY_TEMPLATES_EN_US : STORY_TEMPLATES;
};

/**
 * 生成完整的小剧场文本
 * @param wendyCode Wendy 人格类型
 * @param ireneCode Irene 人格类型
 * @returns 生成的小剧场文本
 */
export const generateStory = (
  wendyCode: WendyCode,
  ireneCode: IreneCode,
  locale: Locale = 'zh-CN',
): string => {
  const storyKey: ChildCombinationKey = `${wendyCode}_${ireneCode}`;
  const templates = getStoryTemplatesByLocale(locale);
  return templates[storyKey] || '这个人格组合的故事还在创作中。';
};
