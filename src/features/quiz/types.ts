/**
 * CP人格测试 - 类型定义
 */

// ==================== 基础类型 ====================

/**
 * 人格代码类型
 * W1-W4: 孙承完（Wendy）的四种人格
 * I1-I4: 裴柱现（Irene）的四种人格
 */
export type WendyCode = 'W1' | 'W2' | 'W3' | 'W4';
export type IreneCode = 'I1' | 'I2' | 'I3' | 'I4';
export type CharacterCode = WendyCode | IreneCode;

/**
 * 人格分组
 */
export type CharacterGroup = 'wendy' | 'irene';

// ==================== 人格卡片 ====================

/**
 * 父母人格卡片
 * 定义每个人格的完整信息
 */
export interface ParentCharacterCard {
  /** 人格代码 */
  code: CharacterCode;
  /** 所属分组 */
  group: CharacterGroup;
  /** 人格名称 */
  name: string;
  /** 人格标题（职业） */
  title: string;
  /** 职业描述 */
  job: string;
  /** 性格摘要 */
  personalitySummary: string;
  /** 性格特质列表 */
  personalityTraits: string[];
  /** 详细描述 */
  detailedDescription: string;
  /** 表情符号 */
  emoji?: string;
}

// ==================== 题目系统 ====================

/**
 * 计分规则
 */
export interface ScoreRule {
  /** 人格代码 */
  code: CharacterCode;
  /** 分数（主人格 +2，次人格 +1） */
  score: number;
}

/**
 * 题目选项
 */
export interface QuizOption {
  /** 选项 ID */
  id: string;
  /** 选项文本 */
  text: string;
  /** 计分规则数组 */
  scoreRules: ScoreRule[];
}

/**
 * 测试题目
 */
export interface QuizQuestion {
  /** 题目 ID */
  id: string;
  /** 题目文本 */
  prompt: string;
  /** 选项列表（每题 4 个选项） */
  options: QuizOption[];
}

/**
 * 用户答案
 */
export interface QuizAnswer {
  /** 题目 ID */
  questionId: string;
  /** 选中的选项 ID */
  optionId: string;
}

// ==================== 计分系统 ====================

/**
 * Wendy 人格分数映射
 */
export type WendyScoreMap = Record<WendyCode, number>;

/**
 * Irene 人格分数映射
 */
export type IreneScoreMap = Record<IreneCode, number>;

/**
 * 完整分数映射
 */
export interface ScoreMap {
  /** Wendy 四种人格的分数 */
  wendy: WendyScoreMap;
  /** Irene 四种人格的分数 */
  irene: IreneScoreMap;
}

// ==================== 测试结果 ====================

/**
 * 测试结果
 */
export interface QuizResult {
  /** Wendy 判定的人格类型 */
  wendyType: ParentCharacterCard;
  /** Irene 判定的人格类型 */
  ireneType: ParentCharacterCard;
  /** 结果标题（如："你是「小太阳DJ × 花店老板 的孩子」"） */
  resultTitle: string;
  /** 结果摘要 */
  resultSummary: string;
  /** 小剧场文案 */
  story: string;
  /** 孩子标签（如："暖慢宝"） */
  childLabel?: string;
}

// ==================== 小剧场模板 ====================

/**
 * 小剧场句子池
 */
export interface StoryTemplate {
  /** 开场白句子池 */
  opening: string[];
  /** Wendy 行动句子池（按人格分类） */
  wendyActions: Record<WendyCode, string[]>;
  /** Irene 行动句子池（按人格分类） */
  ireneActions: Record<IreneCode, string[]>;
  /** 孩子反应句子池 */
  childReactions: string[];
  /** 结尾句子池 */
  endings: string[];
}
