# Epic 1: Foundation & Design System

**Epic ID**: ORCH-EPIC-1
**Phase**: 1 of 6
**Timeline**: Days 1-5 (~20 hours)
**Status**: 🚧 Ready for Story Creation
**Dependencies**: None (foundational epic)
**PRD Reference**: OrchestratAI PRD v2.0, Section 10, Phase 1

---

## Epic Goal

Establish the core architectural foundation and design system for OrchestratAI, implementing a production-grade 3-layer CSS design token system, type-safe validation infrastructure, and responsive layout framework that will support all subsequent development phases.

---

## Business Value

This epic delivers the critical foundation that ensures:
- **Type Safety**: End-to-end validation preventing runtime errors
- **Design Consistency**: Reusable token system matching my_flow_app proven pattern
- **Developer Productivity**: Clear patterns and reusable components accelerate feature development
- **Quality Assurance**: Automated enum synchronization prevents FE/BE mismatches
- **Responsive Base**: Mobile-first layout framework supporting all devices

**Portfolio Impact**: Demonstrates production-grade architecture thinking and modern frontend best practices.

---

## Epic Description

### Current System Context

**Already Completed** (from PRD Section 0):
- ✅ Next.js 15, React 19, TypeScript configured
- ✅ Docker + Docker Compose with hot reload
- ✅ Bun package manager for frontend
- ✅ Tailwind CSS v4 configured
- ✅ ESLint 9, Prettier, Vitest setup
- ✅ Basic backend structure (FastAPI, Python 3.12)

**This Epic Will Add**:
1. **3-Layer Design Token System** (following my_flow_app pattern)
   - Layer 1: Primitive tokens (colors, typography, spacing, effects, animation)
   - Layer 2: Semantic tokens (contextual meanings)
   - Layer 3: Component tokens (component-specific)

2. **Type-Safe Validation Pipeline**
   - TypeScript enums for all constants
   - Zod schemas for runtime validation
   - Python Pydantic models mirroring frontend
   - Automated enum synchronization validation

3. **UI Component Foundation**
   - shadcn/ui component library integration
   - Base layout components (3-panel desktop, responsive mobile)
   - Collapsible panel functionality
   - Header and footer components

4. **Quality Automation**
   - Enum synchronization script
   - Pre-commit hooks for validation
   - ESLint rules enforcing token usage

---

## Success Criteria

### Must Have
- [ ] All 5 CSS token files created and imported correctly in `globals.css`
- [ ] TypeScript enums defined for: AgentType, AgentStatus, MessageRole, StrategyType
- [ ] Zod schemas validate all API request/response shapes
- [ ] Python enums mirror TypeScript enums exactly
- [ ] Enum validation script runs successfully and is added to pre-commit hooks
- [ ] shadcn/ui installed with at least 5 core components (button, card, input, etc.)
- [ ] Three-panel desktop layout renders correctly at 1024px+
- [ ] Panels collapse/expand with smooth animations
- [ ] Header and footer components render with design tokens
- [ ] Mobile layout tested at 320px, 768px breakpoints

### Should Have
- [ ] localStorage persists panel collapse state
- [ ] ESLint rule enforces design token usage (no arbitrary Tailwind values)
- [ ] All components use semantic tokens (no direct primitive access)

### Nice to Have
- [ ] Storybook setup for component documentation
- [ ] Visual regression testing setup

---

## Key Features & Components

### 1. Design Token System
**Files to Create**:
- `orchestratai_client/src/app/styles/tokens/colors.css`
- `orchestratai_client/src/app/styles/tokens/typography.css`
- `orchestratai_client/src/app/styles/tokens/spacing.css`
- `orchestratai_client/src/app/styles/tokens/effects.css`
- `orchestratai_client/src/app/styles/tokens/animation.css`
- Update `orchestratai_client/src/app/globals.css`

**Token Categories**:
- **Colors**: Agent colors (cyan, green, blue, purple), status colors, theme backgrounds
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent padding/margin scale
- **Effects**: Shadows, border radius, z-index layers
- **Animation**: Durations, easing functions

### 2. Type System Infrastructure
**Files to Create**:
- `orchestratai_client/src/lib/enums.ts` - TypeScript enums
- `orchestratai_client/src/lib/schemas.ts` - Zod validation schemas
- `orchestratai_client/src/lib/types.ts` - TypeScript types (inferred from Zod)
- `orchestratai_api/src/models/enums.py` - Python enums
- `scripts/validate-enums.ts` - Synchronization validator

**Enums to Define**:
```typescript
enum AgentType { ORCHESTRATOR, BILLING, TECHNICAL, POLICY }
enum AgentStatus { IDLE, ROUTING, ACTIVE, COMPLETE }
enum MessageRole { USER, ASSISTANT, SYSTEM }
enum StrategyType { RAG, CAG, HYBRID }
```

### 3. UI Component Library
**shadcn/ui Components to Install**:
- Button (primary, secondary, ghost variants)
- Card (for agent cards, log entries)
- Input (for message input)
- Badge (for agent status, strategies)
- ScrollArea (for message list, logs)
- Separator (for panel dividers)
- Collapsible (for panel collapse functionality)

### 4. Layout Components
**Components to Create**:
- `components/layout/three-panel-layout.tsx` - Desktop grid layout
- `components/layout/header.tsx` - App header with branding
- `components/layout/footer.tsx` - Stats bar footer
- `components/panels/collapsible-panel.tsx` - Reusable panel wrapper

**Layout Specifications**:
- Desktop (1024px+): 3-column grid (250px | 1fr | 300px)
- Tablet (768px-1023px): Tabbed interface
- Mobile (<768px): Tabbed interface

---

## Technical Specifications

### Design Token Implementation Pattern
```css
/* globals.css - Correct import structure */
@import './styles/tokens/colors.css' layer(tokens.colors);
@import './styles/tokens/typography.css' layer(tokens.typography);
/* ... other imports ... */

@theme {
  /* Semantic tokens map to primitives */
  --color-bg-primary: var(--token-color-slate-950);
  --color-agent-orchestrator: var(--token-color-cyan-500);
}
```

**Usage in Components** (CRITICAL PATTERN):
```tsx
// ✅ CORRECT: Use base token + Tailwind opacity
<div className="bg-[var(--color-bg-primary)]/90">

// ❌ WRONG: Direct Tailwind color
<div className="bg-slate-950">
```

### Enum Synchronization Validation
The validation script must:
1. Read TypeScript enums from `lib/enums.ts`
2. Read Python enums from `models/enums.py`
3. Compare enum names and values
4. Exit with error code if mismatches found
5. Integrate with Husky pre-commit hook

---

## Dependencies & Prerequisites

### External Dependencies to Install
```bash
# Frontend (use Bun, not npm!)
bun add zod
bun add lucide-react
bun add -d @types/node

# shadcn/ui installation
bunx shadcn@latest init
bunx shadcn@latest add button card input badge scroll-area separator collapsible
```

### Environment Setup
- Docker containers running (`docker compose up`)
- Frontend accessible at `http://localhost:3000`
- Backend accessible at `http://localhost:8000`

---

## Acceptance Criteria

### Functional Requirements
1. **Token System**:
   - All token files import without errors
   - Token variables accessible in browser DevTools
   - Components can reference tokens via CSS variables

2. **Type Safety**:
   - TypeScript compilation succeeds with strict mode
   - Zod schemas validate sample API payloads
   - Python enums match TypeScript enums (validated by script)

3. **Layout**:
   - Three panels visible on desktop (>1024px)
   - Panels collapse when clicking collapse button
   - Animation duration: 300ms with ease-in-out
   - Mobile view shows tabbed interface (<768px)

4. **Components**:
   - Header displays "OrchestratAI" with subtitle
   - Footer displays 4 metric placeholders
   - All shadcn/ui components render without errors

### Non-Functional Requirements
- **Performance**: First paint <2 seconds in development
- **Accessibility**: All interactive elements keyboard accessible
- **Responsiveness**: No horizontal scroll at any breakpoint
- **Code Quality**: ESLint passes with no warnings

---

## Technical Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Tailwind v4 CSS layer conflicts | High | Medium | Follow exact my_flow_app import order |
| Enum sync breaks on CI/CD | Medium | Low | Add validation to package.json test script |
| shadcn/ui Tailwind v4 incompatibility | High | Low | Use latest shadcn/ui v3.5.0+ |
| Panel collapse state lost on refresh | Low | Medium | Implement localStorage persistence |

---

## Rollback Plan

If critical issues arise:
1. **Token System**: Revert to direct Tailwind classes temporarily
2. **Enum Validation**: Disable pre-commit hook, fix manually
3. **shadcn/ui**: Use headless Radix UI directly if shadcn incompatible
4. **Layout**: Simplify to single-column mobile-first, defer desktop

---

## Story Breakdown Guidance for Scrum Master

This epic should be broken into **8-10 user stories**, grouped by:

1. **Setup Stories** (2-3 stories):
   - Install dependencies (shadcn/ui, Zod)
   - Create token file structure
   - Configure ESLint rules

2. **Type System Stories** (2-3 stories):
   - Create TypeScript enums and Zod schemas
   - Create Python enums
   - Build enum synchronization validator

3. **Layout Stories** (3-4 stories):
   - Build desktop three-panel layout
   - Implement collapsible panel functionality
   - Create header and footer components
   - Add mobile responsive layout

4. **Validation Story** (1 story):
   - Integrate enum validation into CI/CD

**Story Sizing Recommendation**:
- Setup stories: 2-3 points each
- Type system: 3-5 points each
- Layout stories: 5-8 points each
- Validation: 3 points

---

## Definition of Done

- [ ] All code merged to main branch
- [ ] All tests passing (unit + integration)
- [ ] Enum validation script running in pre-commit hook
- [ ] Documentation updated in README
- [ ] Storybook stories created for all components (if implemented)
- [ ] Code review completed by at least 1 developer
- [ ] Tested on Chrome, Firefox, Safari (latest versions)
- [ ] Mobile tested on iOS and Android devices
- [ ] Lighthouse accessibility score >90
- [ ] No ESLint warnings
- [ ] Docker containers rebuild successfully

---

## Related Documentation

- **PRD**: `/docs/prd/orchestratai_prd_v2.md` - Sections 2, 3, 4.4, 10 (Phase 1)
- **Reference Pattern**: my_flow_app design token system
- **shadcn/ui Docs**: https://ui.shadcn.com/docs
- **Tailwind v4 Docs**: https://tailwindcss.com/docs/v4-beta
- **Zod Docs**: https://zod.dev

---

## Notes for Story Manager

**Key Considerations**:
1. This is a **greenfield project** - no legacy code to work around
2. **Server Components First**: Default to RSC, only use `'use client'` when needed
3. **Design Token Enforcement**: ESLint rule is critical to prevent token system drift
4. **Mobile-First**: Build mobile layout first, enhance for desktop
5. **Type Safety**: Zod schemas should be source of truth for TypeScript types

**Integration Points**:
- Frontend connects to backend at `http://backend:8000` (Docker network)
- All API calls must validate with Zod schemas
- Enum changes require running validation script before commit

**Critical Path**:
1. Token system must be complete before layout work
2. Enums must be synchronized before any API integration
3. shadcn/ui must be installed before building any UI components

The epic lays the foundation for all future work - prioritize quality over speed.
