#!/usr/bin/env node

/**
 * 题库平衡检查脚本
 *
 * 用法:
 * node scripts/check-question-bank-balance.mjs
 * node scripts/check-question-bank-balance.mjs --samples 200000
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const WENDY_CODES = ['W1', 'W2', 'W3', 'W4'];
const IRENE_CODES = ['I1', 'I2', 'I3', 'I4'];
const PERSONALITY_TYPES = WENDY_CODES.flatMap((w) => IRENE_CODES.map((i) => `${w}_${i}`));

// 必须与 scoring.ts 中的锚题顺序保持一致
const WENDY_TIEBREAK_QUESTIONS = [
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
const IRENE_TIEBREAK_QUESTIONS = [
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

const cwd = process.cwd();
const defaultQuestionsPath = path.resolve(cwd, 'src/features/quiz/data/questions.json');
const defaultResultPath = path.resolve(cwd, 'docs/result.json');

const args = parseArgs(process.argv.slice(2));
const samples =
  Number.isFinite(args.samples) && args.samples > 0 ? Math.floor(args.samples) : 100000;

const questionsPath = args.questionsPath
  ? path.resolve(cwd, args.questionsPath)
  : defaultQuestionsPath;
const resultPath = args.resultPath ? path.resolve(cwd, args.resultPath) : defaultResultPath;

const questions = readJson(questionsPath);
validateQuestions(questions);

const ruleStats = calculateRuleStats(questions);
const simulation = runSimulation(questions, samples);
const resultStats = tryReadResultStats(resultPath);

printSummary({
  questionsCount: questions.length,
  optionsCount: questions.reduce((sum, q) => sum + q.options.length, 0),
  samples,
  ruleStats,
  simulation,
  resultStats,
});

function parseArgs(argv) {
  const parsed = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--samples') {
      parsed.samples = Number(argv[i + 1]);
      i += 1;
      continue;
    }

    if (token === '--questions') {
      parsed.questionsPath = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === '--result') {
      parsed.resultPath = argv[i + 1];
      i += 1;
      continue;
    }
  }

  return parsed;
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function validateQuestions(questionsData) {
  if (!Array.isArray(questionsData) || questionsData.length === 0) {
    throw new Error('questions.json 结构不正确: 必须是非空数组');
  }

  for (const question of questionsData) {
    if (!question.id || !Array.isArray(question.options) || question.options.length === 0) {
      throw new Error(`题目结构异常: ${JSON.stringify(question)}`);
    }
  }
}

function calculateRuleStats(questionsData) {
  const totalWeight = buildZeroMap();
  const ruleHits = buildZeroMap();

  for (const question of questionsData) {
    for (const option of question.options) {
      for (const rule of option.scoreRules || []) {
        if (!(rule.code in totalWeight)) continue;
        totalWeight[rule.code] += Number(rule.score || 0);
        ruleHits[rule.code] += 1;
      }
    }
  }

  return {
    totalWeight,
    ruleHits,
  };
}

function runSimulation(questionsData, n) {
  const typeCount = Object.fromEntries(PERSONALITY_TYPES.map((t) => [t, 0]));
  const wCount = Object.fromEntries(WENDY_CODES.map((code) => [code, 0]));
  const iCount = Object.fromEntries(IRENE_CODES.map((code) => [code, 0]));

  let wTieCount = 0;
  let iTieCount = 0;

  for (let k = 0; k < n; k += 1) {
    const selected = questionsData.map((question) => {
      const idx = Math.floor(Math.random() * question.options.length);
      return question.options[idx];
    });

    const scoreMap = calculateScores(selected);

    if (isTie(scoreMap.wendy, WENDY_CODES)) {
      wTieCount += 1;
    }

    if (isTie(scoreMap.irene, IRENE_CODES)) {
      iTieCount += 1;
    }

    const wendy = getTopCodeWithTiebreak(
      scoreMap.wendy,
      selected,
      WENDY_CODES,
      WENDY_TIEBREAK_QUESTIONS,
    );

    const irene = getTopCodeWithTiebreak(
      scoreMap.irene,
      selected,
      IRENE_CODES,
      IRENE_TIEBREAK_QUESTIONS,
    );

    const type = `${wendy}_${irene}`;

    typeCount[type] += 1;
    wCount[wendy] += 1;
    iCount[irene] += 1;
  }

  const typeDistribution = PERSONALITY_TYPES.map((type) => ({
    personalityType: type,
    count: typeCount[type],
    ratio: toPercent(typeCount[type], n),
  })).sort((a, b) => b.count - a.count || a.personalityType.localeCompare(b.personalityType));

  return {
    typeDistribution,
    wendyDistribution: mapDistribution(wCount, n),
    ireneDistribution: mapDistribution(iCount, n),
    tieRate: {
      wendy: toPercent(wTieCount, n),
      irene: toPercent(iTieCount, n),
    },
  };
}

function calculateScores(selectedOptions) {
  const scoreMap = {
    wendy: { W1: 0, W2: 0, W3: 0, W4: 0 },
    irene: { I1: 0, I2: 0, I3: 0, I4: 0 },
  };

  for (const option of selectedOptions) {
    for (const rule of option.scoreRules || []) {
      if (rule.code.startsWith('W')) {
        scoreMap.wendy[rule.code] += Number(rule.score || 0);
      } else if (rule.code.startsWith('I')) {
        scoreMap.irene[rule.code] += Number(rule.score || 0);
      }
    }
  }

  return scoreMap;
}

function isTie(groupScoreMap, codes) {
  let maxScore = -Infinity;
  for (const code of codes) {
    maxScore = Math.max(maxScore, groupScoreMap[code]);
  }

  let maxCount = 0;
  for (const code of codes) {
    if (groupScoreMap[code] === maxScore) {
      maxCount += 1;
    }
  }

  return maxCount > 1;
}

function getTopCodeWithTiebreak(groupScoreMap, selectedOptions, codes, questionOrder) {
  let maxScore = -Infinity;
  for (const code of codes) {
    maxScore = Math.max(maxScore, groupScoreMap[code]);
  }

  let topCodes = codes.filter((code) => groupScoreMap[code] === maxScore);
  if (topCodes.length === 1) {
    return topCodes[0];
  }

  for (const questionId of questionOrder) {
    const scoreByCode = Object.fromEntries(topCodes.map((code) => [code, 0]));

    for (const code of topCodes) {
      scoreByCode[code] = getScoreInQuestion(questionId, code, selectedOptions);
    }

    const best = Math.max(...topCodes.map((code) => scoreByCode[code]));
    if (best > 0) {
      const winners = topCodes.filter((code) => scoreByCode[code] === best);
      if (winners.length === 1) {
        return winners[0];
      }
      topCodes = winners;
    }
  }

  // 仍然无法打破平局时，沿用固定顺序兜底（与现有逻辑一致）
  return topCodes[0];
}

function getScoreInQuestion(questionId, code, selectedOptions) {
  const option = selectedOptions.find((opt) => String(opt.id).toLowerCase().startsWith(questionId));
  if (!option) return 0;
  const matchedRule = (option.scoreRules || []).find((rule) => rule.code === code);
  return matchedRule ? Number(matchedRule.score || 0) : 0;
}

function mapDistribution(countMap, total) {
  return Object.fromEntries(
    Object.entries(countMap).map(([code, count]) => [code, toPercent(count, total)]),
  );
}

function toPercent(value, total) {
  if (!total) return 0;
  return Number(((value / total) * 100).toFixed(2));
}

function buildZeroMap() {
  return {
    W1: 0,
    W2: 0,
    W3: 0,
    W4: 0,
    I1: 0,
    I2: 0,
    I3: 0,
    I4: 0,
  };
}

function tryReadResultStats(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const parsed = readJson(filePath);
    if (!parsed?.success || !parsed?.data?.distribution) {
      return null;
    }

    const distribution = parsed.data.distribution;
    const totalSubmissions = Number(parsed.data.totalSubmissions || 0);

    const realMap = Object.fromEntries(PERSONALITY_TYPES.map((type) => [type, 0]));
    for (const item of distribution) {
      if (item.personalityType in realMap) {
        realMap[item.personalityType] = Number(item.ratio || 0);
      }
    }

    return {
      totalSubmissions,
      typeRatioMap: realMap,
      generatedAt: parsed.data.generatedAt || null,
    };
  } catch {
    return null;
  }
}

function printSummary(payload) {
  const { questionsCount, optionsCount, samples, ruleStats, simulation, resultStats } = payload;

  console.log('\n=== 题库平衡检查报告 ===\n');
  console.log(`题目数: ${questionsCount}`);
  console.log(`选项总数: ${optionsCount}`);
  console.log(`蒙特卡洛样本: ${samples.toLocaleString()}`);

  console.log('\n[1] 题库规则覆盖与权重');
  printCodeTable(ruleStats.totalWeight, ruleStats.ruleHits);

  console.log('\n[2] 理论基线分布（随机作答 + 当前计分/平分规则）');
  console.log('W 边际分布(%)', simulation.wendyDistribution);
  console.log('I 边际分布(%)', simulation.ireneDistribution);
  console.log('平分触发率(%)', simulation.tieRate);

  console.log('\n16 型理论分布 Top 16:');
  for (const item of simulation.typeDistribution) {
    console.log(`${item.personalityType}: ${item.count} (${item.ratio}%)`);
  }

  if (resultStats) {
    console.log('\n[3] 与真实数据对比（如果有 docs/result.json）');
    if (resultStats.generatedAt) {
      console.log(`真实数据时间: ${resultStats.generatedAt}`);
    }
    console.log(`真实总提交数: ${resultStats.totalSubmissions}`);

    const baselineMap = Object.fromEntries(
      simulation.typeDistribution.map((item) => [item.personalityType, item.ratio]),
    );

    const delta = PERSONALITY_TYPES.map((type) => {
      const real = resultStats.typeRatioMap[type] ?? 0;
      const base = baselineMap[type] ?? 0;
      return {
        personalityType: type,
        real,
        baseline: base,
        diff: Number((real - base).toFixed(2)),
      };
    }).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

    console.log('真实 - 理论 偏差 Top 8:');
    for (const item of delta.slice(0, 8)) {
      const sign = item.diff >= 0 ? '+' : '';
      console.log(
        `${item.personalityType}: real ${item.real}% | baseline ${item.baseline}% | diff ${sign}${item.diff}%`,
      );
    }
  } else {
    console.log('\n[3] 未读取到真实数据对比文件，跳过偏差对比');
  }

  console.log('\n[4] 快速解读建议');
  const i1Base = simulation.ireneDistribution.I1;
  if (i1Base > 30) {
    console.log(`- I1 理论基线偏高 (${i1Base}%)，建议优先减少 I1 覆盖次数或权重。`);
  }

  const maxWeight = Math.max(...Object.values(ruleStats.totalWeight));
  const minWeight = Math.min(...Object.values(ruleStats.totalWeight));
  if (maxWeight - minWeight >= 4) {
    console.log(`- 代码总权重跨度为 ${maxWeight - minWeight}，建议把各 code 总权重压到更接近。`);
  }

  if (simulation.tieRate.wendy > 10 || simulation.tieRate.irene > 10) {
    console.log('- 平分触发率较高，锚题顺序会显著影响最终结果，可考虑改良平分策略。');
  }

  console.log('');
}

function printCodeTable(totalWeight, ruleHits) {
  const codes = [...WENDY_CODES, ...IRENE_CODES];
  console.log('Code | totalWeight | ruleHits');
  console.log('---- | ----------- | --------');
  for (const code of codes) {
    console.log(
      `${code}   | ${String(totalWeight[code]).padStart(11)} | ${String(ruleHits[code]).padStart(8)}`,
    );
  }
}
