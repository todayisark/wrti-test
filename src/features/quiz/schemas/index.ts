/**
 * Quiz Schema 统一导出
 */

export {
  QuizAnswerSchema,
  QuizSubmitSchema,
  QuizSubmitSimpleSchema,
  type QuizAnswerRequest,
  type QuizSubmitRequest,
  type QuizSubmitSimpleRequest,
} from './submit';

export { answersToOptionIds, validateQuestionIds } from './utils';
