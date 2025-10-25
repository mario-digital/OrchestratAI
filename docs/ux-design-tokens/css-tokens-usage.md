# OrchestratAI CSS Design Tokens Usage Guide

**Version:** 1.0.0
**Last Updated:** October 24, 2025
**Author:** Sally (UX Expert)
**Status:** ✅ Production Ready

---

## Overview

This guide explains how to use OrchestratAI's CSS Design Token System for development. The system is **complete and approved per PRD v2.0**—do not add new tokens without explicit user approval (see [coding-standards.md](../architecture/coding-standards.md)).

---

## 🏗️ 3-Layer Token Hierarchy

The system uses a pyramid structure where each layer builds upon the previous:

```
Component Tokens (Layer 3) ← Use these FIRST
    ↓ (references)
Semantic Tokens (Layer 2) ← Fallback option
    ↓ (references)
Primitive Tokens (Layer 1) ← NEVER use directly
```

### Layer 1: Primitive Tokens

**Location:** `orchestratai_client/src/app/styles/tokens/*.css`

Raw color, typography, spacing, effects, and animation values. These form the foundation but **should never appear in component code**.

**Files:**
- `colors.css` - Hex color values for agent colors, neutrals, status colors
- `typography.css` - Font families, sizes, weights, line heights
- `spacing.css` - 8px-based spacing scale (0-80px)
- `effects.css` - Border radii, shadows, z-index layers
- `animation.css` - Durations, easing functions, transitions

**Example tokens:**
```css
--token-color-cyan-600: #0891b2;
--token-font-size-14: 0.875rem;
--token-space-4: 1rem;
--token-radius-md: 0.5rem;
```

### Layer 2: Semantic Tokens

**Location:** `globals.css` `@theme` block

General-purpose tokens for common UI needs. These provide semantic meaning to primitive values.

**Categories:**
- **Backgrounds**: `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-tertiary`, `--color-bg-elevated`
- **Text**: `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-text-disabled`
- **Borders**: `--color-border-default`, `--color-border-subtle`, `--color-border-hover`, `--color-border-focus`
- **Status**: `--color-success`, `--color-warning`, `--color-error`

**Example:**
```css
--color-bg-primary: var(--token-color-slate-950);  /* #0a0f1e */
--color-text-primary: var(--token-color-gray-50);   /* #f9fafb */
```

### Layer 3: Component Tokens

**Location:** `globals.css` `@theme` block

Purpose-built tokens for specific OrchestratAI components.

**Component Categories:**
- **Agent Cards**: `--color-agent-card-border-cyan/green/blue/purple`, `--color-agent-card-text-*`, `--color-agent-card-bg`
- **Status Badges**: `--color-badge-idle-bg/text`, `--color-badge-active-bg/text`, `--color-badge-processing-bg/text`
- **Chat Messages**: `--color-message-user-bg/text`, `--color-message-assistant-bg/text/border`
- **Execution Logs**: `--color-log-border-success/warning/error`, `--color-log-text-routing/vector/cache/docs`
- **Panels**: `--color-panel-bg`, `--color-panel-border`, `--color-panel-header-bg`
- **Inputs**: `--color-input-bg/border/border-focus/text/placeholder`
- **Buttons**: `--color-button-primary-bg/hover/text`, `--color-button-secondary-*`, `--color-button-ghost-*`
- **Execution Graph**: `--color-graph-node-bg/border/text/active/pending`, `--color-graph-edge`
- **Cost Display**: `--color-cost-text` (gold), `--color-cost-label`

---

## 🎨 Implementation Methods

### Option 1: Tailwind Utilities (Recommended)

Tailwind CSS v4 automatically maps all `@theme` tokens to utility classes.

**Mapping Pattern:**
```
@theme token name:     --color-agent-card-border-cyan
Tailwind utility:      border-agent-card-border-cyan
```

**Usage Examples:**
```tsx
// Agent Card - Cyan (Orchestrator)
<div className="
  bg-agent-card-bg
  border-l-[3px]
  border-agent-card-border-cyan
  hover:bg-agent-card-bg-hover
">
  <span className="text-agent-card-text-cyan">ORCHESTRATOR</span>
</div>

// Status Badge - Active
<span className="
  bg-badge-active-bg
  text-badge-active-text
  px-2
  py-1
  rounded-sm
">
  ACTIVE
</span>

// Primary Button
<button className="
  bg-button-primary-bg
  hover:bg-button-primary-hover
  text-button-primary-text
">
  Send Message
</button>

// Input Field
<input className="
  bg-input-bg
  border-input-border
  focus:border-input-border-focus
  text-input-text
  placeholder:text-input-placeholder
" />
```

### Option 2: Tailwind Opacity Modifiers

Apply transparency using Tailwind's `/N` syntax (where N = opacity percentage).

**Base color tokens define solid colors** — opacity is applied at usage time.

```tsx
// Agent card with 10% cyan background
<div className="bg-agent-card-border-cyan/10">
  Subtle cyan tint
</div>

// Border with 30% opacity
<div className="border-agent-card-border-green/30">
  Translucent green border
</div>

// Hover with opacity transition
<div className="
  bg-panel-bg
  hover:bg-agent-card-accent-blue/20
  transition-colors
">
  Hover for blue tint
</div>
```

**Common opacity values:**
- `/10` - Very subtle tint (10%)
- `/20` - Subtle accent (20%)
- `/30` - Noticeable accent (30%)
- `/50` - Half transparency
- `/80` - Mostly opaque
- `/100` - Fully opaque (same as no modifier)

### Option 3: Direct CSS Variables (Rare Cases)

For custom CSS or when Tailwind utilities aren't suitable.

```css
.custom-component {
  background: var(--color-panel-bg);
  border: 1px solid var(--color-border-default);
  color: var(--color-text-primary);
}
```

---

## 🎯 Dynamic Context Theming

OrchestratAI has **4 agent colors** that represent different agents:

| Agent | Color | Border Token | Text Token |
|-------|-------|--------------|------------|
| **Orchestrator** (Router) | Cyan | `--color-agent-card-border-cyan` | `--color-agent-card-text-cyan` |
| **Billing Agent** | Green | `--color-agent-card-border-green` | `--color-agent-card-text-green` |
| **Technical Agent** | Blue | `--color-agent-card-border-blue` | `--color-agent-card-text-blue` |
| **Policy Agent** | Purple | `--color-agent-card-border-purple` | `--color-agent-card-text-purple` |

**Usage Example:**
```tsx
// Dynamic agent card color based on agent type
const agentColorMap = {
  'orchestrator': 'border-agent-card-border-cyan',
  'billing': 'border-agent-card-border-green',
  'technical': 'border-agent-card-border-blue',
  'policy': 'border-agent-card-border-purple',
};

<div className={`
  bg-agent-card-bg
  border-l-[3px]
  ${agentColorMap[agent.id]}
`}>
  {agent.name}
</div>
```

---

## ✅ Key Rules

### DO ✅

1. **Prefer component tokens** - Use Layer 3 tokens for OrchestratAI-specific components
2. **Use semantic tokens as fallback** - When no component token exists
3. **Apply opacity with `/N` syntax** - Never hardcode opacity in token values
4. **Include hover/active states** - Ensure interactive feedback
5. **Leverage agent color tokens** - Use agent-specific tokens for consistency

### DON'T ❌

1. **NEVER use primitive tokens directly** - Always go through semantic or component layers
2. **NEVER hardcode colors** - Use tokens exclusively
3. **NEVER create new tokens without approval** - See coding-standards.md Section 1.2
4. **NEVER forget interactive states** - Buttons, inputs, cards need hover/focus states
5. **NEVER use arbitrary color values** - `bg-[#0891b2]` is forbidden; use `bg-agent-card-border-cyan`

---

## 🚨 Critical Coding Standard Compliance

**From `coding-standards.md` Section 1.2:**

> **Rule:** NEVER create new design tokens without explicit approval. ALWAYS ask the user before adding any token to the design system.

**Violation consequences:**
- Pull requests will be rejected
- Design tokens must be removed
- Re-work required using approved tokens only

**If you need a new token:**
1. Check if existing tokens can be combined (e.g., using opacity modifiers `/10`, `/20`)
2. If truly needed, ask for approval with clear justification
3. Never assume you have permission to extend the design system

---

## 📖 Quick Reference Table

### Most Used Tokens

| Use Case | Token | Tailwind Utility | Hex Value |
|----------|-------|------------------|-----------|
| Main background | `--color-bg-primary` | `bg-bg-primary` | `#0a0f1e` |
| Card background | `--color-bg-secondary` | `bg-bg-secondary` | `#0f172a` |
| Primary text | `--color-text-primary` | `text-text-primary` | `#f9fafb` |
| Secondary text | `--color-text-secondary` | `text-text-secondary` | `#d1d5db` |
| Default border | `--color-border-default` | `border-border-default` | `#374151` |
| Cyan agent (Orchestrator) | `--color-agent-card-border-cyan` | `border-agent-card-border-cyan` | `#0891b2` |
| Green agent (Billing) | `--color-agent-card-border-green` | `border-agent-card-border-green` | `#16a34a` |
| Active badge BG | `--color-badge-active-bg` | `bg-badge-active-bg` | `#16a34a` |
| Primary button | `--color-button-primary-bg` | `bg-button-primary-bg` | `#0891b2` |
| Cost display (gold) | `--color-cost-text` | `text-cost-text` | `#facc15` |

---

## 🎓 Learning Resources

- **PRD v2.0** - `docs/prd/orchestratai_prd_v2.md` (Section 4.4: Design System)
- **Coding Standards** - `docs/architecture/coding-standards.md` (Section 5: Design Token System)
- **Component Guide** - `docs/ux-design-tokens/component-styling-guide.md`
- **Tailwind CSS v4 Docs** - https://tailwindcss.com/
- **Reference Implementation** - `my_flow_app` token system

---

## 📝 Example Component: Agent Card

```tsx
import { AgentId } from '@/lib/enums';

interface AgentCardProps {
  agentId: AgentId;
  name: string;
  status: 'idle' | 'active' | 'processing';
  model: string;
  cost: number;
}

export function AgentCard({ agentId, name, status, model, cost }: AgentCardProps) {
  // Map agent IDs to color tokens
  const colorClasses = {
    'orchestrator': {
      border: 'border-agent-card-border-cyan',
      text: 'text-agent-card-text-cyan',
    },
    'billing': {
      border: 'border-agent-card-border-green',
      text: 'text-agent-card-text-green',
    },
    'technical': {
      border: 'border-agent-card-border-blue',
      text: 'text-agent-card-text-blue',
    },
    'policy': {
      border: 'border-agent-card-border-purple',
      text: 'text-agent-card-text-purple',
    },
  }[agentId];

  // Map status to badge tokens
  const badgeClasses = {
    'idle': 'bg-badge-idle-bg text-badge-idle-text',
    'active': 'bg-badge-active-bg text-badge-active-text',
    'processing': 'bg-badge-processing-bg text-badge-processing-text',
  }[status];

  return (
    <div className={`
      bg-agent-card-bg
      hover:bg-agent-card-bg-hover
      border-l-[3px]
      ${colorClasses.border}
      border-agent-card-border-default
      p-4
      rounded-md
      transition-colors
      duration-normal
    `}>
      {/* Agent Name */}
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-semibold ${colorClasses.text}`}>
          {name.toUpperCase()}
        </h3>

        {/* Status Badge */}
        <span className={`
          px-2 py-1
          text-[11px] font-medium
          rounded-sm
          ${badgeClasses}
        `}>
          {status.toUpperCase()}
        </span>
      </div>

      {/* Model Info */}
      <p className="text-text-secondary text-[13px] mb-1">
        {model}
      </p>

      {/* Cost Display */}
      <div className="flex items-center gap-1">
        <span className="text-cost-label text-[12px]">Cost:</span>
        <span className="text-cost-text text-[13px] font-mono">
          ${cost.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
```

---

**This comprehensive guide ensures consistent, type-safe styling across OrchestratAI's interface while maintaining strict adherence to the approved design token system. 🎨**
