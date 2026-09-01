# Security Implementation

## Overview
Security measures implemented without backend server, using client-side validation and Firebase direct access.

## Implemented Security Features

### 1. Input Sanitization (`lib/security.ts`)
- `sanitizeAccessCode()` - Removes non-alphanumeric characters from access codes
- `isValidAccessCode()` - Validates code format (min 8 alphanumeric characters)

**Usage:**
```typescript
import { sanitizeAccessCode, isValidAccessCode } from '@/lib/security';

const userInput = "abc123<img src=x onerror='xss'>";
const sanitized = sanitizeAccessCode(userInput); // "abc123"
const isValid = isValidAccessCode(sanitized); // false (too short)
```

### 2. DOMPurify Configuration (`lib/dompurify.ts`)
- `sanitizeContent()` - Removes all HTML tags, keeps only text
- `sanitizeBookMetadata()` - For titles and descriptions

**Usage:**
```typescript
import { sanitizeContent } from '@/lib/dompurify';

const dirty = "<h1>Title</h1><img src=x onerror='alert(1)'>";
const clean = sanitizeContent(dirty); // "Title"
```

### 3. Rate Limiting (`lib/rateLimiter.ts`)
- In-memory rate limiting (resets on server restart)
- `checkRateLimit()` - Check if request is allowed
- `getRemainingRequests()` - Get remaining attempts
- `resetRateLimit()` - Reset for specific identifier

**Usage:**
```typescript
import { checkRateLimit } from '@/lib/rateLimiter';

const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
const allowed = checkRateLimit(ip, 5, 60 * 1000); // 5 requests per minute
```

### 4. Secure Auth Storage (`lib/authStorage.ts`)
- `saveAccessCode()` - Saves sanitized code to localStorage
- `getAccessCode()` - Retrieves code from localStorage
- `removeAccessCode()` - Removes code from localStorage
- `clearAllAccessCodes()` - Clears all stored codes

**Usage:**
```typescript
import { saveAccessCode, getAccessCode } from '@/lib/authStorage';

// Save code
saveAccessCode('book-123', 'mySecretCode123', 'read');

// Get code
const code = getAccessCode('book-123', 'read');
```

### 5. Access Code Verification (`useBookHook.ts`)
- `verifyAccessCode()` - Verifies code against Argon2 hash
- Integrates with existing client-side Argon2 implementation

**Usage:**
```typescript
const { verifyAccessCode } = useBookHook();

const authorized = await verifyAccessCode('book-123', 'userCode123', 'read');
if (authorized) {
  // Allow access
}
```

## Integration in UI Components

### When User Enters Access Code
```typescript
import { saveAccessCode } from '@/lib/authStorage';
import { sanitizeAccessCode, isValidAccessCode } from '@/lib/security';

const handleCodeSubmit = async (bookId: string, code: string) => {
  const sanitized = sanitizeAccessCode(code);
  
  if (!isValidAccessCode(sanitized)) {
    alert('Codice non valido. Usa almeno 8 caratteri alfanumerici.');
    return;
  }
  
  const authorized = await verifyAccessCode(bookId, sanitized, 'read');
  
  if (authorized) {
    saveAccessCode(bookId, sanitized, 'read');
    // Proceed with access
  } else {
    alert('Codice errato');
  }
};
```

### When Rendering Content
```typescript
import { sanitizeContent } from '@/lib/dompurify';

// In your component
<h1>{sanitizeContent(book.title)}</h1>
<p>{sanitizeContent(book.description)}</p>
<p>{sanitizeContent(paragraph.text)}</p>
```

## Firebase Rules

For basic security, set Firebase Realtime Database rules to:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

This allows the app to function while the client-side security measures protect against XSS and basic injection attacks.

## Security Limitations

1. **No Server-Side Validation** - All validation happens client-side
2. **LocalStorage Vulnerable to XSS** - Stored codes can be stolen via XSS
3. **Rate Limiting is In-Memory** - Resets on server restart
4. **Direct Firebase Access** - Anyone with Firebase URL can access data

## Threat Model Coverage

✅ **Protection from curious users** - Basic input sanitization
✅ **Protection from simple XSS** - DOMPurify removes dangerous HTML
✅ **Protection from basic brute force** - Rate limiting on verification
⚠️ **Not protected from determined attackers** - No server-side validation

## Next Steps for Enhanced Security

1. **Implement Server-Side API** - Use Next.js API routes with Firebase Admin
2. **Add Firebase Authentication** - Require auth for database access
3. **Server-Side Code Verification** - Move Argon2 verification to server
4. **Implement Proper Rate Limiting** - Use Redis or similar for persistence
5. **Add Security Headers** - Configure CORS and security headers
