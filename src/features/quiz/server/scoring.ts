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
 * 从选项中获取某个问题某个人格的得分（用于平分处理）
 */
const getScoreInQuestion = (
  questionId: string,
  code: CharacterCode,
  options: QuizOption[],
): number => {
  const option = options.find((opt) => opt.id.toLowerCase().startsWith(questionId.toLowerCase()));
  if (!option) return 0;
  const rule = option.scoreRules.find((r) => r.code === code);
  return rule?.score ?? 0;
};

/**
 * 从 Wendy 组中找出得分最高的人格（带锚题平分处理）
 * 平局时按锚题顺序：Q1 → Q5 → Q10 → Q2 → Q7 → Q12 → Q3 → Q6 → Q9 → Q4 → Q8 → Q11
 */
export const getTopWendyCharacterWithTiebreak = (
  scoreMap: ScoreMap,
  selectedOptions: QuizOption[],
): WendyCode => {
  const wendyCodes: WendyCode[] = ['W1', 'W2', 'W3', 'W4'];

  let maxScore = -1;
  for (const code of wendyCodes) {
    if (scoreMap.wendy[code] > maxScore) {
      maxScore = scoreMap.wendy[code];
    }
  }

  const topCharacters = wendyCodes.filter((code) => scoreMap.wendy[code] === maxScore);

  if (topCharacters.length === 1) {
    return topCharacters[0];
  }

  // 按锚题顺序平分：W1(Q1,Q5,Q10) / W2(Q3,Q8,Q11) / W3(Q4,Q6,Q9) / W4(Q2,Q7,Q12)
  const tiebreakQuestions = [
    'q1',
    'q5',
    'q10',
    'q2',
    'q7',
    'q12',
    'q3',
    'q6',
    'q9',
    'q4',
    'q8',
    'q11',
  ];

  for (const qId of tiebreakQuestions) {
    const scores: Record<WendyCode, number> = { W1: 0, W2: 0, W3: 0, W4: 0 };

    for (const code of topCharacters) {
      scores[code] = getScoreInQuestion(qId, code, selectedOptions);
    }

    const maxTiebreak = Math.max(...topCharacters.map((code) => scores[code]));
    if (maxTiebreak > 0) {
      const winners = topCharacters.filter((code) => scores[code] === maxTiebreak);
      if (winners.length === 1) {
        return winners[0];
      }
    }
  }

  return topCharacters[0];
};

/**
 * 从 Irene 组中找出得分最高的人格（带锚题平分处理）
 * 平局时按锚题顺序：Q13 → Q16 → Q24 → Q14 → Q18 → Q23 → Q17 → Q20 → Q21 → Q15 → Q19 → Q22
 */
export const getTopIreneCharacterWithTiebreak = (
  scoreMap: ScoreMap,
  selectedOptions: QuizOption[],
): IreneCode => {
  const ireneCodes: IreneCode[] = ['I1', 'I2', 'I3', 'I4'];

  let maxScore = -1;
  for (const code of ireneCodes) {
    if (scoreMap.irene[code] > maxScore) {
      maxScore = scoreMap.irene[code];
    }
  }

  const topCharacters = ireneCodes.filter((code) => scoreMap.irene[code] === maxScore);

  if (topCharacters.length === 1) {
    return topCharacters[0];
  }

  // 按锚题顺序平分：I1(Q13,Q16,Q24) / I2(Q14,Q18,Q23) / I3(Q17,Q20,Q21) / I4(Q15,Q19,Q22)
  const tiebreakQuestions = [
    'q13',
    'q16',
    'q24',
    'q14',
    'q18',
    'q23',
    'q17',
    'q20',
    'q21',
    'q15',
    'q19',
    'q22',
  ];

  for (const qId of tiebreakQuestions) {
    const scores: Record<IreneCode, number> = { I1: 0, I2: 0, I3: 0, I4: 0 };

    for (const code of topCharacters) {
      scores[code] = getScoreInQuestion(qId, code, selectedOptions);
    }

    const maxTiebreak = Math.max(...topCharacters.map((code) => scores[code]));
    if (maxTiebreak > 0) {
      const winners = topCharacters.filter((code) => scores[code] === maxTiebreak);
      if (winners.length === 1) {
        return winners[0];
      }
    }
  }

  return topCharacters[0];
};

/**
 * 获取最终人格组合（带锚题平分处理）
 */
export const getFinalCharactersWithTiebreak = (
  scoreMap: ScoreMap,
  selectedOptions: QuizOption[],
): [WendyCode, IreneCode] => {
  const wendyCharacter = getTopWendyCharacterWithTiebreak(scoreMap, selectedOptions);
  const ireneCharacter = getTopIreneCharacterWithTiebreak(scoreMap, selectedOptions);
  return [wendyCharacter, ireneCharacter];
};
