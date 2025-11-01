# OrchestratAI Mockup v2.0 Token System Update

**Date:** November 1, 2025
**Author:** Sally (UX Expert)
**Status:** ✅ **COMPLETE - Implementation Ready**
**Approved By:** User

---

## 📊 Update Summary

| Category | Updated Tokens | New Tokens | Total Changes |
|----------|----------------|------------|---------------|
| **Background Colors** | 3 | 2 | 5 |
| **Agent Card States** | 1 | 8 | 9 |
| **Execution Graph** | 0 | 12 | 12 |
| **Retrieval Log** | 0 | 10 | 10 |
| **Badges** | 1 | 3 | 4 |
| **Icons** | 0 | 5 | 5 |
| **Effects** | 0 | 2 | 2 |
| **Typography** | 0 | 2 | 2 |
| **Utility Classes** | 0 | 40+ | 40+ |
| **TOTAL** | **5** | **84+** | **89+** |

---

## 🎨 **Section 1: Background Color Updates**

### **Updated Primitive Tokens** (`colors.css`)

The mockup shows darker, more neutral navy backgrounds with less blue tint.

| Token | Old Value | New Value | Change Reason |
|-------|-----------|-----------|---------------|
| `--token-color-slate-950` | `#0a0f1e` | `#0d1117` | Darker primary background |
| `--token-color-slate-900` | `#0f172a` | `#161b22` | Panel/card backgrounds |
| `--token-color-slate-800` | `#1e293b` | `#21262d` | Elevated surfaces |

**New Green Primitives Added:**

```css
--token-color-green-200: #bbf7d0; /* Light green for active badges */
--token-color-green-800: #166534; /* Dark green for active badges */
```

**Impact:** All background colors are now darker and more consistent with modern dark themes (GitHub Dark style).

---

## 🃏 **Section 2: Agent Card Active State (NEW)**

### **Component Tokens Added** (`globals.css:207-213`)

Mockup shows **BILLING AGENT** with full green background when active - a new visual state.

```css
/* Agent Card Active State (Mockup v2.0) */
--color-agent-card-active-bg: var(--token-color-green-600); /* #16a34a */
--color-agent-card-active-text: var(--token-color-gray-50); /* #f9fafb */
--color-agent-card-active-label: var(--token-color-gray-50); /* #f9fafb */
--color-agent-card-active-value: var(--token-color-gray-100); /* #f3f4f6 */
--color-agent-card-active-cost: var(--token-color-yellow-400); /* #facc15 */
--color-agent-card-active-border: var(--token-color-green-500); /* #22c55e */
```

**Usage Example:**

```tsx
// Active agent card with full green background
<div className={cn(
  "agent-card",
  agent.status === 'active' && "bg-agent-active text-agent-active border-l-agent-active"
)}>
  {/* White text on green background */}
  <span className="text-agent-active-cost">$0.0034</span>
</div>
```

**New Utility Classes:**
- `.bg-agent-active` - Full green background
- `.text-agent-active` - White text
- `.text-agent-active-label` - White labels
- `.text-agent-active-value` - Light gray values
- `.text-agent-active-cost` - Gold cost text
- `.border-agent-active` - Lighter green border

---

## 🔀 **Section 3: Execution Graph Component (NEW)**

### **Component Tokens Added** (`globals.css:295-307`)

New component showing execution flow at bottom of Agent Pipeline.

```css
/* Execution Graph Component (Mockup v2.0) */
--color-execution-graph-bg: var(--color-bg-secondary); /* #161b22 */
--color-execution-graph-border: var(--color-border-default); /* #374151 */
--color-execution-graph-header-text: var(--token-color-cyan-400); /* #22d3ee */

/* Step States */
--color-execution-step-complete-bg: var(--token-color-green-500); /* #22c55e */
--color-execution-step-complete-icon: var(--token-color-gray-50); /* #f9fafb */
--color-execution-step-active-bg: var(--token-color-cyan-500); /* #06b6d4 */
--color-execution-step-pending-bg: var(--token-color-gray-600); /* #4b5563 */

/* Connector Lines */
--color-execution-connector: var(--token-color-gray-700); /* #374151 */
```

**Usage Example:**

```tsx
<div className="bg-execution-graph border-t border-execution-graph">
  <h3 className="text-execution-graph-header section-header">
    EXECUTION GRAPH
  </h3>
  <div className="flex items-center gap-2">
    {/* Completed Step */}
    <div className="w-3 h-3 rounded-full bg-execution-step-complete flex items-center justify-center">
      <CheckIcon className="w-2 h-2 text-execution-step-complete" />
    </div>
    {/* Connector */}
    <div className="h-px w-8 bg-execution-connector" />
    {/* Active Step */}
    <div className="w-3 h-3 rounded-full bg-execution-step-active" />
  </div>
</div>
```

**New Utility Classes:**
- `.bg-execution-graph` - Panel background
- `.border-execution-graph` - Border color
- `.text-execution-graph-header` - Cyan header text
- `.bg-execution-step-complete` - Green completed step
- `.text-execution-step-complete` - White checkmark icon
- `.bg-execution-step-active` - Cyan active step
- `.bg-execution-step-pending` - Gray pending step
- `.bg-execution-connector` - Gray connection lines

---

## 📋 **Section 4: Retrieval Log Section Headers (NEW)**

### **Component Tokens Added** (`globals.css:528-547`)

Mockup shows distinct colored section headers (QUERY ANALYSIS, VECTOR SEARCH, etc.).

```css
/* Retrieval Log Section Headers (Mockup v2.0) */
--color-log-header-query: var(--token-color-purple-400); /* #c084fc */
--color-log-header-vector: var(--token-color-blue-400); /* #60a5fa */
--color-log-header-cache: var(--token-color-green-400); /* #4ade80 */
--color-log-header-docs: var(--token-color-cyan-400); /* #22d3ee */
--color-log-header-timestamp: var(--color-text-tertiary); /* #6b7280 */

/* Document Card Styling */
--color-doc-filename: var(--token-color-cyan-400); /* #22d3ee */
--color-doc-view-link: var(--token-color-cyan-500); /* #06b6d4 */
--color-doc-similarity-label: var(--color-text-secondary); /* #d1d5db */
--color-doc-similarity-value: var(--token-color-gray-50); /* #f9fafb */
```

**Usage Example:**

```tsx
{/* QUERY ANALYSIS Section */}
<div className="retrieval-section mb-4">
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-log-header-query section-header">QUERY ANALYSIS</h3>
    <span className="text-log-header-timestamp text-xs">14:32:18</span>
  </div>
  <div className="space-y-1 text-sm">
    <div><span className="text-text-tertiary">Intent:</span> billing_inquiry</div>
    <div><span className="text-text-tertiary">Confidence:</span> 0.94</div>
  </div>
</div>

{/* RETRIEVED DOCUMENTS Section */}
<div className="retrieval-section">
  <h3 className="text-log-header-docs section-header mb-2">RETRIEVED DOCUMENTS</h3>
  <div className="document-card bg-bg-tertiary p-3 rounded-md">
    <div className="flex items-center justify-between">
      <span className="text-doc-filename">pricing-2024.pdf</span>
      <span className="text-doc-similarity-label">sim: <span className="text-doc-similarity-value">0.87</span></span>
    </div>
    <p className="text-text-secondary text-sm mt-1">Enterprise pricing starts at $299/mo...</p>
    <button className="text-doc-view-link text-sm mt-2">👁 View Full</button>
  </div>
</div>
```

**New Utility Classes:**
- `.text-log-header-query` - Purple header
- `.text-log-header-vector` - Blue header
- `.text-log-header-cache` - Green header
- `.text-log-header-docs` - Cyan header
- `.text-log-header-timestamp` - Gray timestamp
- `.text-doc-filename` - Cyan filename
- `.text-doc-view-link` - Cyan "View Full" link
- `.text-doc-similarity-label` - Gray similarity label
- `.text-doc-similarity-value` - White similarity value
- `.section-header` - 11px uppercase semibold typography

---

## 🏷️ **Section 5: Badge Refinements**

### **Updated Tokens** (`globals.css:208-220`)

```css
/* IDLE Badge - Darker Background (UPDATED) */
--color-badge-idle-bg: var(--token-color-slate-800); /* #21262d - Was gray-700 */

/* ACTIVE Badge - Icon Support (NEW) */
--color-badge-active-icon: var(--token-color-green-300); /* #86efac - Sparkle */

/* Active Badge on Green Background (NEW) */
--color-badge-active-on-green-bg: var(--token-color-green-800); /* #166534 */
--color-badge-active-on-green-text: var(--token-color-green-200); /* #bbf7d0 */
```

**Usage Example:**

```tsx
{/* IDLE Badge */}
<span className="bg-badge-idle-bg text-badge-idle-text px-2 py-1 text-[11px] rounded-sm">
  IDLE
</span>

{/* ACTIVE Badge with Icon */}
<span className="bg-badge-active-bg text-badge-active-text px-2 py-1 text-[11px] rounded-sm flex items-center gap-1">
  <SparkleIcon className="w-3 h-3 text-badge-active-icon" />
  ACTIVE
</span>

{/* ACTIVE Badge on Green Agent Card */}
<span className="bg-badge-active-on-green text-badge-active-on-green px-2 py-1 text-[11px] rounded-sm">
  ACTIVE
</span>
```

**New Utility Classes:**
- `.text-badge-active-icon` - Light green sparkle icon
- `.bg-badge-active-on-green` - Dark green badge on green background
- `.text-badge-active-on-green` - Light green text

---

## 🎨 **Section 6: Agent Icon Colors (NEW)**

### **Component Tokens Added** (`globals.css:542-547`)

Mockup shows colored icons before agent names (robot, dollar, wrench, shield).

```css
/* Agent Icon Colors (Mockup v2.0) */
--color-icon-orchestrator: var(--token-color-cyan-400); /* #22d3ee - Robot */
--color-icon-billing: var(--token-color-green-400); /* #4ade80 - Dollar */
--color-icon-technical: var(--token-color-blue-400); /* #60a5fa - Wrench */
--color-icon-policy: var(--token-color-purple-400); /* #c084fc - Shield */
--color-icon-execution-graph: var(--token-color-cyan-500); /* #06b6d4 - Graph */
```

**Usage Example:**

```tsx
{/* Orchestrator Icon */}
<svg className="w-4 h-4 text-icon-orchestrator">
  <path d="..." /> {/* Robot icon */}
</svg>

{/* Billing Agent Icon */}
<svg className="w-4 h-4 text-icon-billing">
  <path d="..." /> {/* Dollar icon */}
</svg>
```

**New Utility Classes:**
- `.text-icon-orchestrator` - Cyan
- `.text-icon-billing` - Green
- `.text-icon-technical` - Blue
- `.text-icon-policy` - Purple
- `.text-icon-execution-graph` - Cyan

---

## ✨ **Section 7: Glow Effects (NEW)**

### **Primitive Tokens Added** (`effects.css:70-72`)

```css
/* Badge Glow Effects (Mockup v2.0) */
--token-shadow-glow-active-badge: 0 0 12px rgb(34 197 94 / 0.3);
--token-shadow-glow-green-subtle: 0 0 8px rgb(34 197 94 / 0.4);
```

### **Semantic Tokens Added** (`globals.css:127-129`)

```css
/* Glow Effects (Mockup v2.0) */
--shadow-badge-active: var(--token-shadow-glow-active-badge);
--shadow-glow-green-subtle: var(--token-shadow-glow-green-subtle);
```

**Usage Example:**

```tsx
{/* ACTIVE badge with subtle green glow */}
<span className="bg-badge-active-bg text-badge-active-text shadow-[var(--shadow-badge-active)]">
  ACTIVE
</span>
```

---

## 📝 **Section 8: Typography Additions**

### **Semantic Tokens Added** (`globals.css:103-105`)

```css
/* Section Header Typography (Mockup v2.0) */
--font-size-section-header: var(--token-font-size-11); /* 11px */
--font-weight-section-header: var(--token-font-weight-semibold); /* 600 */
```

**New Utility Class:**

```css
.section-header {
  font-size: var(--font-size-section-header);
  font-weight: var(--font-weight-section-header);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

**Usage:**

```tsx
<h3 className="text-log-header-query section-header">
  QUERY ANALYSIS
</h3>
```

---

## 📁 **Files Modified**

### **1. `colors.css`** (Primitive Layer)
- Updated 3 slate background tokens
- Added 2 green color primitives

### **2. `effects.css`** (Primitive Layer)
- Added 2 glow effect tokens

### **3. `globals.css`** (Semantic + Component Layers)
- Updated 2 badge tokens
- Added 31 new component tokens
- Added 40+ utility classes

**Total Files Changed:** 3
**Lines Added:** ~250
**Lines Modified:** ~10

---

## ✅ **Implementation Checklist**

### **Token System ✅ COMPLETE**
- [x] Update background colors in `colors.css`
- [x] Add green color primitives for active states
- [x] Add glow effects in `effects.css`
- [x] Add agent card active state tokens in `globals.css`
- [x] Add execution graph tokens in `globals.css`
- [x] Add retrieval log section tokens in `globals.css`
- [x] Add agent icon color tokens in `globals.css`
- [x] Add typography tokens in `globals.css`
- [x] Add all utility classes in `globals.css`

### **Documentation ✅ COMPLETE**
- [x] Create mockup-v2-update-summary.md
- [x] Document all new tokens with usage examples
- [x] Provide component implementation examples
- [x] List all utility classes

### **Next Steps (Component Implementation)**
- [ ] Update AgentCard component for active state
- [ ] Create ExecutionGraph component
- [ ] Update RetrievalLog component with sections
- [ ] Add agent icons to agent cards
- [ ] Update Header component
- [ ] Test all components with new tokens
- [ ] Visual regression testing

---

## 🎯 **Quick Reference: Most Used New Tokens**

| Use Case | Token | Utility Class | Value |
|----------|-------|---------------|-------|
| **Active Agent BG** | `--color-agent-card-active-bg` | `.bg-agent-active` | `#16a34a` |
| **Active Agent Text** | `--color-agent-card-active-text` | `.text-agent-active` | `#f9fafb` |
| **Active Cost** | `--color-agent-card-active-cost` | `.text-agent-active-cost` | `#facc15` |
| **Execution Step Done** | `--color-execution-step-complete-bg` | `.bg-execution-step-complete` | `#22c55e` |
| **Query Header** | `--color-log-header-query` | `.text-log-header-query` | `#c084fc` |
| **Vector Header** | `--color-log-header-vector` | `.text-log-header-vector` | `#60a5fa` |
| **Doc Filename** | `--color-doc-filename` | `.text-doc-filename` | `#22d3ee` |
| **Orchestrator Icon** | `--color-icon-orchestrator` | `.text-icon-orchestrator` | `#22d3ee` |
| **Section Header** | N/A | `.section-header` | 11px semibold |

---

## 🚨 **Breaking Changes**

### **Background Colors**
⚠️ **All backgrounds are now darker** - components may need contrast adjustments:
- Primary: `#0a0f1e` → `#0d1117` (darker)
- Secondary: `#0f172a` → `#161b22` (darker)
- Tertiary: `#1e293b` → `#21262d` (darker)

### **IDLE Badge Background**
⚠️ **Badge now uses darker slate color:**
- Old: `#374151` (gray-700)
- New: `#21262d` (slate-800)

**No other breaking changes** - all new tokens are additive.

---

## 📞 **Support & Questions**

For implementation help or questions about these tokens:
1. Reference this document for token usage examples
2. Check utility classes in `globals.css:749-905`
3. See component implementation examples in each section
4. Contact Sally (UX Expert) for design system questions

---

**🎨 OrchestratAI Mockup v2.0 Token System Update - COMPLETE**

All 89 tokens and utility classes are now ready for component implementation. The design system maintains full 3-tier architecture compliance with all approved token additions.

**Approved:** November 1, 2025
**Status:** Production Ready ✅
