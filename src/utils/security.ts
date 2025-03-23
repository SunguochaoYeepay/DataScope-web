/**
 * 安全工具函数
 * @description 提供了一系列用于防止XSS攻击和SQL注入的工具函数
 */

/**
 * 转义HTML特殊字符
 * @param str - 需要转义的字符串
 * @returns 转义后的字符串
 */
function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return str.replace(/[&<>"'/]/g, (match) => htmlEscapes[match]);
}

/**
 * 转义SQL特殊字符
 * @param str - 需要转义的字符串
 * @returns 转义后的字符串
 */
function escapeSql(str: string): string {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (match) => {
    switch (match) {
      case '\0':
        return '\\0';
      case '\x08':
        return '\\b';
      case '\x09':
        return '\\t';
      case '\x1a':
        return '\\z';
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + match;
      default:
        return match;
    }
  });
}

/**
 * 递归处理对象中的所有字符串值
 * @param input - 需要处理的输入值
 * @returns 处理后的值
 */
export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    return escapeHtml(escapeSql(input));
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, sanitizeInput(value)])
    );
  }
  
  return input;
} 