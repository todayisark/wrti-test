/**
 * 生成 UUID v4
 * 兼容所有浏览器和 Node.js 环境
 */
export function generateUUID(): string {
  // 优先使用 crypto.randomUUID()（现代浏览器和 Node.js）
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback：手动实现 UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
