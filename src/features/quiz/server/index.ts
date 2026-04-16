/**
 * Quiz 功能服务端逻辑统一导出
 */

// 计分相关
export {
  createEmptyScoreMap,
  applyOptionScore,
  calculateScores,
  getTopWendyCharacter,
  getTopIreneCharacter,
  getFinalCharacters,
} from './scoring';

// 小剧场生成
export { generateStory, generateMultipleStories, previewTemplates } from './story';

// 结果计算
export {
  validateAnswers,
  calculateResult,
  calculateResultWithLocale,
  getCharacterCards,
  regenerateStory,
} from './result';
