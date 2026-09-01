/**
 * Client-side storage for access codes with security measures
 */

import { sanitizeAccessCode, isValidAccessCode } from './security';

const STORAGE_KEY = 'book_access_codes';

interface StoredCodes {
  [bookId: string]: {
    readCode?: string;
    writeCode?: string;
    timestamp: number;
  };
}

/**
 * Saves an access code to localStorage with sanitization
 * @param bookId - Book ID
 * @param code - Raw access code
 * @param type - 'read' or 'write'
 */
export function saveAccessCode(bookId: string, code: string, type: 'read' | 'write'): void {
  try {
    // Sanitize code before saving
    const sanitizedCode = sanitizeAccessCode(code);
    
    if (!isValidAccessCode(sanitizedCode)) {
      console.error('Invalid code format - not saving');
      return;
    }

    const stored = getStoredCodes();
    
    if (!stored[bookId]) {
      stored[bookId] = { timestamp: Date.now() };
    }
    
    if (type === 'read') {
      stored[bookId].readCode = sanitizedCode;
    } else {
      stored[bookId].writeCode = sanitizedCode;
    }
    
    stored[bookId].timestamp = Date.now();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Error saving access code:', error);
  }
}

/**
 * Gets an access code from localStorage
 * @param bookId - Book ID
 * @param type - 'read' or 'write'
 * @returns Sanitized code or undefined
 */
export function getAccessCode(bookId: string, type: 'read' | 'write'): string | undefined {
  try {
    const stored = getStoredCodes();
    const bookData = stored[bookId];
    
    if (!bookData) return undefined;
    
    return type === 'read' ? bookData.readCode : bookData.writeCode;
  } catch (error) {
    console.error('Error getting access code:', error);
    return undefined;
  }
}

/**
 * Removes an access code from localStorage
 * @param bookId - Book ID
 * @param type - 'read' or 'write' or undefined to remove all
 */
export function removeAccessCode(bookId: string, type?: 'read' | 'write'): void {
  try {
    const stored = getStoredCodes();
    
    if (!stored[bookId]) return;
    
    if (type) {
      if (type === 'read') {
        delete stored[bookId].readCode;
      } else {
        delete stored[bookId].writeCode;
      }
      
      // Remove book entry if both codes are gone
      if (!stored[bookId].readCode && !stored[bookId].writeCode) {
        delete stored[bookId];
      }
    } else {
      delete stored[bookId];
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Error removing access code:', error);
  }
}

/**
 * Gets all stored codes
 * @returns Object with all stored codes
 */
function getStoredCodes(): StoredCodes {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return {};
    
    const parsed = JSON.parse(data);
    
    // Validate structure
    if (typeof parsed !== 'object' || parsed === null) {
      return {};
    }
    
    return parsed as StoredCodes;
  } catch (error) {
    console.error('Error parsing stored codes:', error);
    return {};
  }
}

/**
 * Clears all stored access codes
 */
export function clearAllAccessCodes(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing access codes:', error);
  }
}
