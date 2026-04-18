/**
 * CP人格测试 - 类型定义
 */

// ==================== 基础类型 ====================

/**
 * 人格代码类型
 * W0: 孙承完（Wendy）的特殊人格（高拒答率）
 * W1-W4: 孙承完（Wendy）的四种人格
 * I0: 裴柱现（Irene）的特殊人格（高拒答率）
 * I1-I4: 裴柱现（Irene）的四种人格
 */
export type WendyCode = 'W0' | 'W1' | 'W2' | 'W3' | 'W4';
export type IreneCode = 'I0' | 'I1' | 'I2' | 'I3' | 'I4';
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
export type ParentCharacterCard = {
  /** 人格代码 */
  code: CharacterCode;
  /** 所属分组 */
  group: CharacterGroup;
  /** 表情符号 */
  emoji: string;
  /** 职业描述 */
  job: string;
  /** 性格特质列表 */
  tags: string[];
  /** 人格故事描述 */
  story: string;
};

/**
 * 孩子人格组合
 * 定义 16 种父母组合下的孩子特征
 */
export type ChildProfile = {
  /** Wendy 人格代码 */
  wendyCode: WendyCode;
  /** Irene 人格代码 */
  ireneCode: IreneCode;
  /** 孩子标签（如："暖慢宝"） */
  label: string;
  /** 孩子表情符号 */
  emoji: string;
  /** 孩子性格描述 */
  personality: string;
  /** 父母的养育方式 */
  parentingStyle: string;
};

/**
 * 孩子组合键类型（如："W1_I1"）
 */
export type ChildCombinationKey = `${WendyCode}_${IreneCode}`;

// ==================== 题目系统 ====================

/**
 * 计分规则
 */
export type ScoreRule = {
  /** 人格代码 */
  code: CharacterCode;
  /** 分数（主人格 +2，次人格 +1） */
  score: number;
};

/**
 * 题目选项
 */
export type QuizOption = {
  /** 选项 ID */
  id: string;
  /** 选项文本 */
  text: string;
  /** 计分规则数组 */
  scoreRules: ScoreRule[];
};

/**
 * 测试题目
 */
export type QuizQuestion = {
  /** 题目 ID */
  id: string;
  /** 题目文本 */
  prompt: string;
  /** 选项列表（每题 4 个选项） */
  options: QuizOption[];
};

/**
 * 用户答案
 */
export type QuizAnswer = {
  /** 题目 ID */
  questionId: string;
  /** 选中的选项 ID */
  optionId: string;
};

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
export type ScoreMap = {
  /** Wendy 四种人格的分数 */
  wendy: WendyScoreMap;
  /** Irene 四种人格的分数 */
  irene: IreneScoreMap;
};

// ==================== 测试结果 ====================

/**
 * 测试结果
 */
export type QuizResult = {
  /** Wendy 判定的人格类型 */
  wendyType: ParentCharacterCard;
  /** Irene 判定的人格类型 */
  ireneType: ParentCharacterCard;
  /** 孩子人格信息 */
  childProfile: ChildProfile;
  /** 结果标题 */
  resultTitle: string;
  /** 结果表情符号 */
  resultEmoji: string;
  /** 结果标签 */
  resultLabel: string;
  /** 小剧场文案 */
  story: string;
  /** 用户 UUID（匿名追踪） */
  userUUID?: string;
  /** 用户选择的题目选项 ID 数组 */
  selectedOptionIds?: string[];
  /** W1-W4 和 I1-I4 的详细分数 */
  scores?: ScoreMap;
};

// ==================== 小剧场模板 ====================

/**
 * 小剧场映射
 * 使用组合键（如 W1_I1）映射到完整故事文本
 */
export type StoryTemplate = Record<ChildCombinationKey, string>;

// ==================== API 响应类型 ====================

/**
 * 成功响应
 */
export type SuccessResponse<T = unknown> = {
  success: true;
  data: T;
};

/**
 * 错误响应
 */
export type ErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
};

/**
 * 通用 API 响应
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * 测试提交响应
 */
export type QuizSubmitResponse = ApiResponse<QuizResult>;
