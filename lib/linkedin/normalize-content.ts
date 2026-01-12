const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

export const normalizeLinkedInContent = (content: string) =>
  content
    .replace(/\r\n/g, "\n")
    .replace(/[\u2028\u2029]/g, "\n")
    .replace(CONTROL_CHARS_REGEX, "")
    .trim()
