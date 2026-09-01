/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitizes access code input by removing non-alphanumeric characters
 * @param input - Raw user input
 * @returns Sanitized alphanumeric string
 */
export function sanitizeAccessCode(input: string): string {
  // Remove all non-alphanumeric characters
  return input.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Validates if a code matches the expected alphanumeric pattern
 * @param code - Code to validate
 * @returns true if valid, false otherwise
 */
export function isValidAccessCode(code: string): boolean {
  // Code must be alphanumeric and at least 8 characters (as per schema)
  return /^[a-zA-Z0-9]{8,}$/.test(code);
}
