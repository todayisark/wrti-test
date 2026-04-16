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
  locale: Locale = 'zh-CN',
  count: number = 3,
): string[] => {
  const story = generateStory(wendyCode, ireneCode, locale);
  return Array.from({ length: count }, () => story);
};

/**
 * 预览句子池内容（开发/调试用）
 * @param wendyCode Wendy 人格类型
 * @param ireneCode Irene 人格类型
 * @returns 该人格组合可用的所有句子片段
 */
export const previewTemplates = (
  wendyCode: WendyCode,
  ireneCode: IreneCode,
  locale: Locale = 'zh-CN',
) => {
  const storyKey: ChildCombinationKey = `${wendyCode}_${ireneCode}`;
  const templates = getStoryTemplatesByLocale(locale);
  return {
    key: storyKey,
    story: templates[storyKey] || '',
  };
};
