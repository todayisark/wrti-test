/**
 * Quiz 功能服务端逻辑统一导出
 */

// 计分相关
export { createEmptyScoreMap, applyOptionScore, calculateScores } from './scoring';

// 小剧场生成
export { generateStory } from './story';

// 结果计算
export { calculateResultWithLocale } from './result';
