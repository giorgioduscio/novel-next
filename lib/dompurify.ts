/**
 * DOMPurify configuration for content sanitization
 */

import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Allows only safe text content (no HTML tags)
 * @param dirty - Dirty HTML string
 * @returns Sanitized string with only safe text
 */
export function sanitizeContent(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed, only text
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });
}

/**
 * Sanitizes book titles and descriptions
 * @param dirty - Dirty string
 * @returns Sanitized string
 */
export function sanitizeBookMetadata(dirty: string): string {
  return sanitizeContent(dirty);
}
