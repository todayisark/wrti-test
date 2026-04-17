#!/usr/bin/env node

/**
 * 题库平衡检查脚本
 *
 * 这个脚本的目标不是证明题库“统计学显著公平”，
 * 而是从工程角度快速观察当前题库在随机作答条件下会呈现怎样的结果分布。
 *
 * 它主要做四件事：
 * 1. 统计每个人格 code 在整套题里的总权重与出现次数。
 * 2. 用蒙特卡洛模拟估计随机作答时的理论结果分布。
 * 3. 统计 Wendy / Irene 两组各自的平分触发率。
 * 4. 如果存在真实提交数据，则对比真实分布与理论分布的偏差。
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

// 16 种最终人格组合键，后续用于初始化统计表和输出排序。
const PERSONALITY_TYPES = WENDY_CODES.flatMap((w) => IRENE_CODES.map((i) => `${w}_${i}`));

// 下面两组锚题顺序必须与正式业务代码中的 scoring.ts 完全一致。
// 否则脚本模拟出来的“理论分布”会和线上真实判定逻辑不一致。
//
// 这些题目顺序代表：当同组人格总分并列时，系统会按这个顺序逐题比较，
// 看并列人格在该题选中的选项里谁拿到更高分，从而打破平局。
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

// 默认读取当前工作目录下的题库与真实结果文件。
// 之所以使用 process.cwd()，是为了让脚本既能在项目根目录直接运行，
// 也能通过 npm script 的方式稳定找到正确路径。
const cwd = process.cwd();
const defaultQuestionsPath = path.resolve(cwd, 'src/features/quiz/data/questions.json');
const defaultResultPath = path.resolve(cwd, 'docs/result.json');

// 解析命令行参数，例如样本数、题库路径、结果文件路径。
const args = parseArgs(process.argv.slice(2));

// 样本数越大，模拟结果越稳定，但执行时间也越长。
// 默认 100000 对当前题库规模来说通常已经足够看出大趋势。
const samples =
  Number.isFinite(args.samples) && args.samples > 0 ? Math.floor(args.samples) : 100000;

const questionsPath = args.questionsPath
  ? path.resolve(cwd, args.questionsPath)
  : defaultQuestionsPath;
const resultPath = args.resultPath ? path.resolve(cwd, args.resultPath) : defaultResultPath;

// 读取题库并做基础结构校验，尽早暴露格式问题。
const questions = readJson(questionsPath);
validateQuestions(questions);

// ruleStats: 静态统计，不做模拟，只看题库本身配置。
// simulation: 动态统计，基于随机作答重复抽样。
// resultStats: 如果存在真实提交数据，则用于做偏差对比。
const ruleStats = calculateRuleStats(questions);
const simulation = runSimulation(questions, samples);
const resultStats = tryReadResultStats(resultPath);

// 统一打印最终报告。
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

  // 这里使用非常轻量的手写参数解析，原因是参数量很少，
  // 没必要为了这个脚本引入额外依赖。
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
  // 题库与结果文件都采用 JSON，因此统一用同步读取，
  // 脚本逻辑更直接，也足够满足命令行工具场景。
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function validateQuestions(questionsData) {
  // 这里只做最基础的结构校验：
  // - questions.json 必须是非空数组
  // - 每道题必须有 id
  // - 每道题必须有非空 options 数组
  // 更细粒度的字段检查由业务代码或数据维护阶段保证。
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
  // totalWeight: 每个人格 code 在整套题库中累积获得的总分值。
  // ruleHits: 每个人格 code 在多少条 scoreRule 中出现过。
  //
  // 这两个指标分别回答：
  // - 某人格“总共能吃到多少权重”
  // - 某人格“在多少个落点里出现”
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
  // typeCount: 16 种最终组合各出现多少次。
  // wCount / iCount: Wendy 和 Irene 两组各自的边际分布。
  const typeCount = Object.fromEntries(PERSONALITY_TYPES.map((t) => [t, 0]));
  const wCount = Object.fromEntries(WENDY_CODES.map((code) => [code, 0]));
  const iCount = Object.fromEntries(IRENE_CODES.map((code) => [code, 0]));

  // 记录“总分并列第一”的触发次数，用来估算平分机制介入频率。
  let wTieCount = 0;
  let iTieCount = 0;

  // 蒙特卡洛模拟：每一轮都对每道题均匀随机选一个选项。
  // 这相当于估计“如果用户随机作答，最终结果会怎么分布”。
  for (let k = 0; k < n; k += 1) {
    const selected = questionsData.map((question) => {
      const idx = Math.floor(Math.random() * question.options.length);
      return question.options[idx];
    });

    // 先按题库规则累积分数。
    const scoreMap = calculateScores(selected);

    // 这里的 tieRate 只统计“同组最高分是否并列”，
    // 不关心后续是否能被锚题顺利打破。
    if (isTie(scoreMap.wendy, WENDY_CODES)) {
      wTieCount += 1;
    }

    if (isTie(scoreMap.irene, IRENE_CODES)) {
      iTieCount += 1;
    }

    // 使用和正式业务一致的平分处理逻辑，得到最终人格组合。
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

    // 分别累计最终组合、W 边际、I 边际。
    typeCount[type] += 1;
    wCount[wendy] += 1;
    iCount[irene] += 1;
  }

  // 把 16 型结果转换成可排序的数组，便于按高到低观察头部集中度。
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
  // 这里直接在脚本中复刻最小计分逻辑，避免依赖应用代码。
  // 好处是脚本可以独立运行，不需要构建 TypeScript 或加载项目模块。
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
  // 判断逻辑非常直接：
  // 1. 先找出该组最大分
  // 2. 再看有多少人格拿到了这个最大分
  // 3. 如果超过 1 个，就视为发生平分
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
  // 先找出该组总分最高的候选人格集合。
  let maxScore = -Infinity;
  for (const code of codes) {
    maxScore = Math.max(maxScore, groupScoreMap[code]);
  }

  let topCodes = codes.filter((code) => groupScoreMap[code] === maxScore);
  if (topCodes.length === 1) {
    return topCodes[0];
  }

  // 如果并列，就按锚题顺序逐题缩小候选集合。
  // 某一题如果能让并列人格中只有一个得分更高，则直接返回。
  // 如果一题仍然并列，就继续看下一题。
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
  // 根据题号前缀找到该题实际被选中的 option，例如 q1_a、q1_b。
  const option = selectedOptions.find((opt) => String(opt.id).toLowerCase().startsWith(questionId));
  if (!option) return 0;

  // 再在该 option 的 scoreRules 中找到对应人格 code 的得分。
  const matchedRule = (option.scoreRules || []).find((rule) => rule.code === code);
  return matchedRule ? Number(matchedRule.score || 0) : 0;
}

function mapDistribution(countMap, total) {
  // 把计数结果统一转换成百分比对象，便于直接打印阅读。
  return Object.fromEntries(
    Object.entries(countMap).map(([code, count]) => [code, toPercent(count, total)]),
  );
}

function toPercent(value, total) {
  // 所有百分比都保留两位小数，报告可读性更稳定。
  if (!total) return 0;
  return Number(((value / total) * 100).toFixed(2));
}

function buildZeroMap() {
  // 统一生成 8 个 code 的零值对象，避免手写多处初始化逻辑。
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
  // 真实结果文件是可选项。
  // 如果不存在，脚本仍然可以只输出“理论基线分布”。
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

    // 初始化所有 16 型为 0，确保缺失项不会导致后续比较出错。
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

  // 报告输出分成四块：
  // [1] 静态权重覆盖
  // [2] 理论模拟分布
  // [3] 与真实数据的偏差
  // [4] 基于简单阈值的快速建议
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

    // diff = 真实占比 - 理论占比。
    // 绝对值越大，说明这个类型在真实用户中的表现越偏离“随机作答下的理论基线”。
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

  // 下面几条建议属于工程启发式规则，不是严格统计检验。
  // 目的是在日常调题时快速提醒明显问题。
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
  // 采用固定顺序输出，方便横向比较 8 个 code。
  const codes = [...WENDY_CODES, ...IRENE_CODES];
  console.log('Code | totalWeight | ruleHits');
  console.log('---- | ----------- | --------');
  for (const code of codes) {
    console.log(
      `${code}   | ${String(totalWeight[code]).padStart(11)} | ${String(ruleHits[code]).padStart(8)}`,
    );
  }
}
