# 16. Coding Standards

## 16.1 Critical Rules

- **Type Sharing:** Define types in `packages/shared`, never duplicate
- **API Calls:** Use service layer, never direct fetch in components
- **Design Tokens:** Use only token classes, NO arbitrary values
- **Enum Sync:** Run `validate:enums` before commit (Husky enforced)
- **Server Components:** Default to Server, `'use client'` only when needed

---

## 16.2 Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `UserProfile.tsx` |
| Functions | camelCase | snake_case | `getData()` / `get_data()` |
| API Routes | kebab-case | kebab-case | `/api/user-profile` |
| Enums | PascalCase | PascalCase | `AgentStatus` |

---
