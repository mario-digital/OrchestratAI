# OrchestratAI Component Styling Guide

**Version:** 1.0.0
**Last Updated:** October 24, 2025
**Author:** Sally (UX Expert)
**Status:** ✅ Production Ready

---

## Design Philosophy

OrchestratAI embodies a **"professional AI platform for customer service"** aesthetic featuring:

- **Dark, Technical UI**: Deep slate/blue backgrounds (#0a0f1e) for reduced eye strain
- **Agent Color Coding**: Four distinct agent colors (Cyan, Green, Blue, Purple) for clear visual hierarchy
- **Subtle Sophistication**: Muted neutrals with vibrant accents only for status and interaction
- **Information Density**: Compact layouts maximizing workspace efficiency
- **Responsive Feedback**: Clear visual states for all interactive elements
- **Professional Precision**: Clean typography and consistent spacing rhythm

**Color Strategy:**
- Cyan (#0891b2) - Orchestrator/Router agent
- Green (#16a34a) - Billing agent, active states
- Blue (#2563eb) - Technical agent, user messages
- Purple (#9333ea) - Policy agent
- Yellow (#facc15) - Cost displays (gold)
- Neutrals (Slate/Gray) - UI structure and text hierarchy

---

## Updated Color Primitives

### Agent Colors (Primary Palette)

**Cyan - Orchestrator Agent:**
- Border: `#0891b2` (`--token-color-cyan-600`)
- Text: `#22d3ee` (`--token-color-cyan-400`)
- Accent: `#06b6d4` (`--token-color-cyan-500`)

**Green - Billing Agent:**
- Border: `#16a34a` (`--token-color-green-600`)
- Text: `#4ade80` (`--token-color-green-400`)
- Accent: `#22c55e` (`--token-color-green-500`)

**Blue - Technical Agent:**
- Border: `#2563eb` (`--token-color-blue-600`)
- Text: `#60a5fa` (`--token-color-blue-400`)
- Accent: `#3b82f6` (`--token-color-blue-500`)

**Purple - Policy Agent:**
- Border: `#9333ea` (`--token-color-purple-600`)
- Text: `#c084fc` (`--token-color-purple-400`)
- Accent: `#a855f7` (`--token-color-purple-500`)

### Neutral Palette (Structure)

**Backgrounds:**
- Primary: `#0a0f1e` (Slate 950) - Main app background
- Secondary: `#0f172a` (Slate 900) - Cards, panels
- Tertiary: `#1e293b` (Slate 800) - Elevated surfaces
- Elevated: `#334155` (Slate 700) - Hover states

**Text Hierarchy:**
- Primary: `#f9fafb` (Gray 50) - Headings, body text
- Secondary: `#d1d5db` (Gray 300) - Subtext, labels
- Tertiary: `#6b7280` (Gray 500) - Metadata
- Muted: `#4b5563` (Gray 600) - Placeholders, disabled

**Borders:**
- Default: `#374151` (Gray 700)
- Subtle: `#1f2937` (Gray 800)
- Hover: `#4b5563` (Gray 600)
- Focus: `#06b6d4` (Cyan 500)

### Semantic Colors

**Success:** Green 500 (`#22c55e`)
**Warning:** Yellow 500 (`#f59e0b`)
**Error:** Red 500 (`#ef4444`)
**Cost:** Yellow 400 (`#facc15`) - Gold accent

---

## Component Specifications

### 1. Agent Cards

**Purpose:** Display agent status, model, and performance metrics

**Visual Structure:**
- Background: Secondary (`#0f172a`)
- Left border: 3px agent color
- Hover: Tertiary background (`#1e293b`)
- Padding: 16px (space-4)
- Border radius: 8px (radius-md)

**Implementation:**
```tsx
<div className="
  bg-agent-card-bg
  hover:bg-agent-card-bg-hover
  border-l-[3px]
  border-agent-card-border-{agent}  /* cyan|green|blue|purple */
  border-agent-card-border-default
  p-4
  rounded-md
  transition-colors
  duration-normal
">
  {/* Agent Name Header */}
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-sm font-semibold text-agent-card-text-{agent}">
      AGENT NAME
    </h3>

    {/* Status Badge */}
    <span className="
      bg-badge-{status}-bg       /* idle|active|processing */
      text-badge-{status}-text
      px-2 py-1
      text-[11px] font-medium
      rounded-sm
    ">
      STATUS
    </span>
  </div>

  {/* Model Info */}
  <p className="text-text-secondary text-[13px] mb-1">
    Model Name
  </p>

  {/* Metrics Row */}
  <div className="flex items-center justify-between text-[12px]">
    <div>
      <span className="text-text-tertiary">Tokens:</span>
      <span className="text-text-primary ml-1">1,243</span>
    </div>
    <div>
      <span className="text-cost-label">Cost:</span>
      <span className="text-cost-text font-mono ml-1">$0.0034</span>
    </div>
  </div>
</div>
```

**States:**
- **Default:** Secondary background, agent-colored left border
- **Hover:** Tertiary background, smooth transition (200ms)
- **Active (selected):** No distinct state (use badge to show activity)

**Agent Color Mapping:**
```typescript
const agentColors = {
  orchestrator: 'border-agent-card-border-cyan text-agent-card-text-cyan',
  billing: 'border-agent-card-border-green text-agent-card-text-green',
  technical: 'border-agent-card-border-blue text-agent-card-text-blue',
  policy: 'border-agent-card-border-purple text-agent-card-text-purple',
};
```

---

### 2. Status Badges

**Purpose:** Show agent operational state

**Badge Variants:**
- **IDLE**: Gray background, gray text
- **ACTIVE**: Green background, light green text
- **PROCESSING**: Cyan background, light cyan text

**Implementation:**
```tsx
{/* Idle Badge */}
<span className="
  bg-badge-idle-bg
  text-badge-idle-text
  px-2 py-1
  text-[11px] font-medium
  rounded-sm
  uppercase
">
  Idle
</span>

{/* Active Badge */}
<span className="
  bg-badge-active-bg
  text-badge-active-text
  px-2 py-1
  text-[11px] font-medium
  rounded-sm
  uppercase
">
  Active
</span>

{/* Processing Badge */}
<span className="
  bg-badge-processing-bg
  text-badge-processing-text
  px-2 py-1
  text-[11px] font-medium
  rounded-sm
  uppercase
">
  Processing
</span>
```

**Typography:**
- Font size: 11px
- Font weight: 500 (medium)
- Text transform: UPPERCASE
- Letter spacing: Slightly increased for readability

---

### 3. Chat Message Bubbles

**User Messages:**
- Background: Blue 600 (`#2563eb`)
- Text: Gray 50 (`#f9fafb`)
- Alignment: Right
- Max width: 70%
- Border radius: 12px (top-left), 12px (top-right), 4px (bottom-right), 12px (bottom-left)

**Assistant Messages:**
- Background: Secondary (`#0f172a`)
- Text: Gray 300 (`#d1d5db`)
- Border: 1px Gray 700
- Alignment: Left
- Max width: 80%
- Border radius: 12px (top-left), 12px (top-right), 12px (bottom-right), 4px (bottom-left)

**Implementation:**
```tsx
{/* User Message */}
<div className="flex justify-end">
  <div className="
    bg-message-user-bg
    text-message-user-text
    px-4 py-3
    rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-sm
    max-w-[70%]
  ">
    What are your pricing tiers for enterprise plans?
  </div>
</div>

{/* Assistant Message */}
<div className="flex justify-start">
  <div className="
    bg-message-assistant-bg
    text-message-assistant-text
    border border-message-assistant-border
    px-4 py-3
    rounded-tl-lg rounded-tr-lg rounded-br-lg rounded-bl-sm
    max-w-[80%]
  ">
    I can help you with pricing information. We offer three enterprise tiers...
  </div>
</div>

{/* System Message (optional) */}
<div className="flex justify-center">
  <div className="
    bg-message-system-bg
    text-message-system-text
    px-3 py-1.5
    rounded-md
    text-[13px]
  ">
    Agent switched to Billing Support
  </div>
</div>
```

---

### 4. Panel Containers

**Left Panel (Agent Pipeline):**
- Background: Secondary (`#0f172a`)
- Border: Right 1px Gray 700
- Header: Tertiary background
- Width: 280px (desktop), full width (mobile)

**Right Panel (Retrieval Log):**
- Background: Secondary (`#0f172a`)
- Border: Left 1px Gray 700
- Width: 320px (desktop), full width (mobile)

**Implementation:**
```tsx
{/* Panel Container */}
<div className="
  bg-panel-bg
  border-panel-border
  h-full
  overflow-y-auto
">
  {/* Panel Header */}
  <div className="
    bg-panel-header-bg
    text-panel-header-text
    px-4 py-3
    border-b border-panel-border
    sticky top-0
  ">
    <h2 className="text-[13px] font-semibold uppercase tracking-wide">
      Agent Pipeline
    </h2>
  </div>

  {/* Panel Content */}
  <div className="p-4 space-y-3">
    {/* Content items */}
  </div>
</div>
```

---

### 5. Execution Log Entries

**Purpose:** Show real-time execution steps with status indicators

**Log Entry Types:**
- **Query Analysis**: Purple text
- **Vector Search**: Blue text
- **Cached Context**: Green text
- **Retrieved Docs**: Cyan text

**Status Borders:**
- Success: Green left border
- Warning: Yellow left border
- Error: Red left border

**Implementation:**
```tsx
{/* Log Entry */}
<div className="
  bg-bg-secondary
  border-l-[3px]
  border-log-border-success  /* or warning, error */
  p-3
  rounded-md
  space-y-1
">
  {/* Log Header */}
  <div className="flex items-center justify-between">
    <span className="text-log-text-vector text-[13px] font-medium">
      VECTOR SEARCH
    </span>
    <span className="text-text-tertiary text-[11px]">
      14:32:19
    </span>
  </div>

  {/* Log Details */}
  <div className="text-text-secondary text-[12px] space-y-0.5">
    <div>Collection: <span className="text-text-primary">billing_docs</span></div>
    <div>Chunks: <span className="text-text-primary">3</span></div>
    <div>TopSimilarity: <span className="text-text-primary">0.87</span></div>
    <div>Method: <span className="text-text-primary">RAG</span></div>
    <div>Latency: <span className="text-text-primary">124ms</span></div>
  </div>
</div>
```

**Log Text Colors:**
```typescript
const logColors = {
  'routing': 'text-log-text-routing',      // Purple
  'vector': 'text-log-text-vector',        // Blue
  'cache': 'text-log-text-cache',          // Green
  'docs': 'text-log-text-docs',            // Cyan
};
```

---

### 6. Form Inputs

**Text Input:**
- Background: Secondary (`#0f172a`)
- Border: 1px Gray 700
- Hover: Border Gray 600
- Focus: Border Cyan 500, 2px box shadow
- Padding: 12px vertical, 16px horizontal
- Border radius: 6px

**Implementation:**
```tsx
<input
  type="text"
  placeholder="Enter query..."
  className="
    w-full
    bg-input-bg
    border border-input-border
    hover:border-input-border-hover
    focus:border-input-border-focus
    focus:outline-none
    focus:ring-2
    focus:ring-input-border-focus/20
    text-input-text
    placeholder:text-input-placeholder
    px-4 py-3
    rounded-md
    transition-colors
    duration-fast
  "
/>
```

---

### 7. Buttons

**Primary Button (Cyan):**
- Background: Cyan 600 (`#0891b2`)
- Hover: Cyan 500 (`#06b6d4`)
- Text: Gray 50 (`#f9fafb`)
- Padding: 12px vertical, 20px horizontal
- Border radius: 6px

**Secondary Button (Neutral):**
- Background: Tertiary (`#1e293b`)
- Hover: Elevated (`#334155`)
- Text: Primary (`#f9fafb`)

**Ghost Button (Minimal):**
- Background: Transparent
- Hover: Tertiary (`#1e293b`)
- Text: Secondary (`#d1d5db`)

**Implementation:**
```tsx
{/* Primary Button */}
<button className="
  bg-button-primary-bg
  hover:bg-button-primary-hover
  text-button-primary-text
  px-5 py-3
  rounded-md
  font-medium
  transition-colors
  duration-normal
">
  Send Message
</button>

{/* Secondary Button */}
<button className="
  bg-button-secondary-bg
  hover:bg-button-secondary-hover
  text-button-secondary-text
  border border-border-default
  px-5 py-3
  rounded-md
  font-medium
  transition-colors
  duration-normal
">
  Cancel
</button>

{/* Ghost Button */}
<button className="
  bg-button-ghost-bg
  hover:bg-button-ghost-hover
  text-button-ghost-text
  px-5 py-3
  rounded-md
  font-medium
  transition-colors
  duration-normal
">
  Learn More
</button>
```

---

### 8. Execution Graph Nodes

**Purpose:** Visualize agent execution flow

**Node States:**
- **Completed**: Green checkmark, active border
- **Active**: Pulsing animation, primary border
- **Pending**: Gray dot, muted border

**Implementation:**
```tsx
{/* Execution Graph Node */}
<div className="
  bg-graph-node-bg
  border border-graph-node-border
  p-3
  rounded-md
  text-center
">
  {/* Status Indicator */}
  <div className="
    w-4 h-4
    rounded-full
    bg-graph-node-active  /* or bg-graph-node-pending */
    mx-auto
    mb-2
  " />

  {/* Node Label */}
  <p className="text-graph-node-text text-[12px]">
    AWS Bedrock Nova Lite
  </p>
</div>

{/* Connection Edge */}
<div className="
  w-px
  h-8
  bg-graph-edge
  mx-auto
" />
```

---

### 9. Cost Display

**Purpose:** Show monetary costs in gold color for visibility

**Implementation:**
```tsx
<div className="flex items-center gap-1">
  <span className="text-cost-label text-[12px]">Cost:</span>
  <span className="text-cost-text text-[13px] font-mono">
    $0.0034
  </span>
</div>
```

**Typography:**
- Font family: Monospace
- Color: Yellow 400 (`#facc15`) - Gold
- Font size: 13px
- Weight: Normal (400)

---

## States & Animations

### Hover States

All interactive elements brighten on hover:
- **Cards**: Elevate background (secondary → tertiary)
- **Buttons**: Lighten background color
- **Inputs**: Brighten border
- **Agent Cards**: Subtle background shift

**Transition timing:** 200ms ease-out

### Focus States (Keyboard Navigation)

All focusable elements receive focus indicators:
- **Inputs**: Cyan border + 2px box shadow (20% opacity)
- **Buttons**: Cyan outline ring
- **Cards**: Cyan border (when keyboard focused)

**Focus ring:** 2px solid, 4px offset

### Active/Pressed States

- **Buttons**: Scale 0.98 transform
- **Cards**: Darken slightly
- **Inputs**: No transform (maintain focus state)

### Disabled States

- Opacity: 50%
- Text: Muted color
- Border: Subtle color
- Cursor: not-allowed

---

## Layout & Spacing

### Page Layout

- **Desktop**: 3-column layout (280px | flex-1 | 320px)
- **Mobile**: Single column with tabs
- Max width: Full viewport
- Padding: 20px

### Component Spacing

**Vertical spacing:** 8px, 12px, 16px, 24px increments
**Horizontal padding:** Same scale
**Gap between items:** 12px default, 16px for sections

### Responsive Breakpoints

- **Mobile**: < 768px (single column, tabs)
- **Tablet**: 768px - 1024px (2-column hybrid)
- **Desktop**: > 1024px (full 3-panel layout)

---

## Typography Scale

### Headings

- **H1**: 32px, weight 700, line-height 1.2 (rarely used)
- **H2**: 24px, weight 600, line-height 1.3 (page titles)
- **H3**: 20px, weight 600, line-height 1.3 (section headers)
- **H4**: 18px, weight 600, line-height 1.4 (subsections)

### Body Text

- **Body**: 14px, weight 400, line-height 1.4 (most text)
- **Small**: 13px, weight 400, line-height 1.5 (metadata)
- **Micro**: 11px, weight 400, line-height 1.5 (labels, badges)

### Special Text

- **Monospace (code)**: 13px, family 'Monaco' or equivalent
- **Links**: Primary text color, underline on hover

---

## Developer Checklist

Before submitting components for review:

- [ ] All color tokens use CSS variables (no hardcoded hex values)
- [ ] Button variants tested across all states (hover, active, focus, disabled)
- [ ] Form inputs include proper focus indicators (cyan ring)
- [ ] Agent cards show correct agent color borders
- [ ] Status badges use semantic color tokens
- [ ] Cards render correctly with hover elevation
- [ ] Agent colors apply to left borders only (not backgrounds)
- [ ] Animations use transition timing from token library
- [ ] Accessibility: contrast ratios meet WCAG AA standards
- [ ] Touch targets minimum 44x44px on mobile
- [ ] No color reliance alone for status indication (use icons/text)

---

## Usage Guidelines

### DO ✅

- Use primary buttons for main actions (Send, Submit)
- Apply agent colors only as accents (borders, text, not backgrounds)
- Maintain consistent spacing using token increments
- Test hover/focus states for all interactive elements
- Use semantic token names in code (never primitives)
- Apply opacity with Tailwind `/N` syntax

### DON'T ❌

- Override tokens with inline styles
- Mix button styles on same action
- Apply agent colors to large backgrounds (use 10% opacity)
- Create custom colors; use existing palette
- Forget disabled state styling
- Ignore keyboard navigation requirements
- Use arbitrary color values (`bg-[#0891b2]`)

---

## Token Reference Quick List

### Most Used Component Tokens

| Token | Hex | Use Case |
|-------|-----|----------|
| `--color-bg-primary` | `#0a0f1e` | Main background |
| `--color-bg-secondary` | `#0f172a` | Cards, panels |
| `--color-text-primary` | `#f9fafb` | Body text |
| `--color-border-default` | `#374151` | Standard borders |
| `--color-agent-card-border-cyan` | `#0891b2` | Orchestrator accent |
| `--color-agent-card-border-green` | `#16a34a` | Billing accent |
| `--color-badge-active-bg` | `#16a34a` | Active badge |
| `--color-button-primary-bg` | `#0891b2` | Primary buttons |
| `--color-cost-text` | `#facc15` | Cost displays (gold) |
| `--radius-md` | `8px` | Card corners |
| `--space-4` | `16px` | Standard padding |

---

This comprehensive guide ensures consistent, professional component styling across OrchestratAI's interface while maintaining the approved design token system. **Always reference this guide when implementing new components.** 🎨

**Related Documents:**
- [CSS Tokens Usage Guide](./css-tokens-usage.md)
- [PRD v2.0](../prd/orchestratai_prd_v2.md)
- [Coding Standards](../architecture/coding-standards.md)
