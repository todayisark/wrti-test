/**
 * 数据加载器
 * 从 JSON 文件加载所有测试数据
 */

import charactersData from '../data/characters.json';
import questionsData from '../data/questions.json';
import storyTemplatesData from '../data/story-templates.json';

import type { ParentCharacterCard, QuizQuestion, StoryTemplate, CharacterCode } from '../types';

/**
 * 人格卡片数据（Record 类型，按 code 索引）
 */
export const CHARACTER_CARDS = charactersData as Record<CharacterCode, ParentCharacterCard>;

/**
 * 题目数据数组（24 道题）
 */
export const QUESTIONS = questionsData as QuizQuestion[];

/**
 * 小剧场句子池
 */
export const STORY_TEMPLATES = storyTemplatesData as StoryTemplate;
