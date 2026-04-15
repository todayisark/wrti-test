/**
 * 计分逻辑模块
 * 处理答题计分和分数统计
 */

import type { QuizOption, ScoreMap, CharacterCode, WendyCode, IreneCode } from '../types';

/**
 * 初始化空的分数表
 * 所有人格分数初始化为 0
 */
export const createEmptyScoreMap = (): ScoreMap => {
  const wendy: Record<string, number> = {};
  const irene: Record<string, number> = {};

  // Wendy 组（W1-W4）
  for (let i = 1; i <= 4; i++) {
    wendy[`W${i}`] = 0;
  }

  // Irene 组（I1-I4）
  for (let i = 1; i <= 4; i++) {
    irene[`I${i}`] = 0;
  }

  return { wendy, irene } as ScoreMap;
};

/**
 * 应用单个选项的计分规则
 * @param scoreMap 当前分数表
 * @param option 用户选择的选项
 * @returns 更新后的分数表
 */
export const applyOptionScore = (scoreMap: ScoreMap, option: QuizOption): ScoreMap => {
  const updatedScoreMap = {
    wendy: { ...scoreMap.wendy },
    irene: { ...scoreMap.irene },
  };

  // 遍历该选项的所有计分规则
  for (const rule of option.scoreRules) {
    const code = rule.code;
    // 判断是 Wendy 还是 Irene
    if (code.startsWith('W')) {
      updatedScoreMap.wendy[code as WendyCode] += rule.score;
    } else {
      updatedScoreMap.irene[code as IreneCode] += rule.score;
    }
  }

  return updatedScoreMap;
};

/**
 * 批量应用多个选项的计分
 * @param options 用户选择的所有选项
 * @returns 最终分数表
 */
export const calculateScores = (options: QuizOption[]): ScoreMap => {
  let scoreMap = createEmptyScoreMap();

  for (const option of options) {
    scoreMap = applyOptionScore(scoreMap, option);
  }

  return scoreMap;
};

/**
 * 从 Wendy 组中找出得分最高的人格
 * 平局时选择序号小的人格（W1 > W2 > W3 > W4）
 * @param scoreMap 分数表
 * @returns Wendy 人格 code
 */
export const getTopWendyCharacter = (scoreMap: ScoreMap): WendyCode => {
  const wendyCodes: WendyCode[] = ['W1', 'W2', 'W3', 'W4'];

  let topCharacter: WendyCode = 'W1';
  let maxScore = scoreMap.wendy['W1'];

  // 从 W2 开始遍历（W1 已经作为初始值）
  for (let i = 1; i < wendyCodes.length; i++) {
    const code = wendyCodes[i];
    const score = scoreMap.wendy[code];

    // 只有严格大于才更新（保证平局时选序号小的）
    if (score > maxScore) {
      maxScore = score;
      topCharacter = code;
    }
  }

  return topCharacter;
};

/**
 * 从 Irene 组中找出得分最高的人格
 * 平局时选择序号小的人格（I1 > I2 > I3 > I4）
 * @param scoreMap 分数表
 * @returns Irene 人格 code
 */
export const getTopIreneCharacter = (scoreMap: ScoreMap): IreneCode => {
  const ireneCodes: IreneCode[] = ['I1', 'I2', 'I3', 'I4'];

  let topCharacter: IreneCode = 'I1';
  let maxScore = scoreMap.irene['I1'];

  // 从 I2 开始遍历（I1 已经作为初始值）
  for (let i = 1; i < ireneCodes.length; i++) {
    const code = ireneCodes[i];
    const score = scoreMap.irene[code];

    // 只有严格大于才更新（保证平局时选序号小的）
    if (score > maxScore) {
      maxScore = score;
      topCharacter = code;
    }
  }

  return topCharacter;
};

/**
 * 获取最终人格组合
 * @param scoreMap 分数表
 * @returns [Wendy人格, Irene人格]
 */
export const getFinalCharacters = (scoreMap: ScoreMap): [WendyCode, IreneCode] => {
  const wendyCharacter = getTopWendyCharacter(scoreMap);
  const ireneCharacter = getTopIreneCharacter(scoreMap);

  return [wendyCharacter, ireneCharacter];
};
