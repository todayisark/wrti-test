#!/usr/bin/env node

/**
 * 拉取新数据分布脚本
 *
 * 从 Supabase 查询指定时间点之后的提交，统计 16 种人格分布，
 * 输出格式与 docs/result.json 兼容，写入 docs/result-new.json。
 *
 * 用法:
 * node scripts/fetch-new-stats.mjs
 * node scripts/fetch-new-stats.mjs --since "2026-04-16T16:49:01.768118+00:00"
 * node scripts/fetch-new-stats.mjs --since "2026-04-16T16:49:01.768118+00:00" --out docs/result-new.json
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

// 读取 .env.local
const cwd = process.cwd();
loadEnvLocal(path.resolve(cwd, '.env.local'));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY，请确认 .env.local 存在。',
  );
  process.exit(1);
}

const PERSONALITY_TYPES = [
  'W1_I1',
  'W1_I2',
  'W1_I3',
  'W1_I4',
  'W2_I1',
  'W2_I2',
  'W2_I3',
  'W2_I4',
  'W3_I1',
  'W3_I2',
  'W3_I3',
  'W3_I4',
  'W4_I1',
  'W4_I2',
  'W4_I3',
  'W4_I4',
];

// 默认时间截止点：新题库上线时间
const DEFAULT_SINCE = '2026-04-16T16:49:01.768118+00:00';

const args = parseArgs(process.argv.slice(2));
const since = args.since ?? DEFAULT_SINCE;
const outPath = path.resolve(cwd, args.out ?? 'docs/result-new.json');

console.log(`查询时间起点: ${since}`);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const { data: rows, error } = await supabase
  .from('quiz_results')
  .select('personality_result')
  .not('personality_result', 'is', null)
  .gte('created_at', since);

if (error) {
  console.error('查询失败:', error.message);
  process.exit(1);
}

const counts = Object.fromEntries(PERSONALITY_TYPES.map((t) => [t, 0]));

for (const row of rows ?? []) {
  const result = row.personality_result;
  if (result in counts) {
    counts[result] += 1;
  }
}

const totalSubmissions = (rows ?? []).length;

const distribution = PERSONALITY_TYPES.map((type) => {
  const count = counts[type];
  const ratio = totalSubmissions > 0 ? Number(((count / totalSubmissions) * 100).toFixed(2)) : 0;
  return { personalityType: type, count, ratio };
}).sort((a, b) => b.count - a.count || a.personalityType.localeCompare(b.personalityType));

const output = {
  success: true,
  data: {
    totalSubmissions,
    since,
    distribution,
    generatedAt: new Date().toISOString(),
  },
};

fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`\n新数据总条数: ${totalSubmissions}`);
console.log('分布:');
for (const item of distribution) {
  if (item.count > 0) {
    console.log(`  ${item.personalityType}: ${item.count} (${item.ratio}%)`);
  }
}
console.log(`\n已写入: ${outPath}`);

// ── 工具函数 ──────────────────────────────────────────────

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--since') {
      parsed.since = argv[++i];
      continue;
    }
    if (token === '--out') {
      parsed.out = argv[++i];
      continue;
    }
  }
  return parsed;
}

function loadEnvLocal(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
