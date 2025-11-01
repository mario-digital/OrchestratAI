# Component Updates for Mockup v2.0

**Date:** November 1, 2025
**Author:** Sally (UX Expert)
**Status:** ✅ **PHASE 1 COMPLETE**

---

## 📊 Update Summary

| Component | Status | Changes | File |
|-----------|--------|---------|------|
| **AgentCard** | ✅ Complete | Active state with green background | `agent-card.tsx` |
| **AgentStatusBadge** | ✅ Complete | Darker IDLE, uppercase text, active variants | `agent-status-badge.tsx` |
| **AgentMetrics** | ✅ Complete | Active state styling, gold cost on green | `agent-metrics.tsx` |
| **Header** | ✅ Complete | Logo icon, new title/subtitle layout | `header.tsx` |
| **ExecutionGraph** | 🔴 TODO | New component needed | N/A |
| **RetrievalPanel** | 🔴 TODO | Section headers needed | `retrieval-panel.tsx` |
| **LogEntry** | 🔴 TODO | Section header styling | `log-entry.tsx` |

---

## ✅ **COMPLETED UPDATES**

### **1. AgentCard Component** (`agent-card.tsx`)

**Changes Implemented:**

#### **Active State - Full Green Background**
When `status === AgentStatus.ACTIVE`, the card now displays:
- Full green background (`bg-agent-active`)
- Lighter green left border (`border-l-agent-active`)
- White text throughout (`text-agent-active`)
- Gold cost value (`text-agent-active-cost`)
- Dark green ACTIVE badge (`bg-badge-active-on-green`)

**Code Example:**
```tsx
<Card
  className={`transition-all duration-200 ${
    isActive
      ? "bg-agent-active border-l-agent-active"
      : "hover:bg-agent-card-bg-hover"
  }`}
  style={{
    borderLeftColor: isActive
      ? "var(--color-agent-card-active-border)"
      : `var(${borderColor})`,
    borderLeftWidth: "3px",
  }}
>
```

#### **Agent Name - Uppercase**
Agent names now display in uppercase with tracking:
```tsx
<h3 className={`font-semibold uppercase text-sm tracking-wide ${
  isActive ? "text-agent-active" : ""
}`}>
  {name}
</h3>
```

#### **Props Changed:**
- Added `isActive` boolean derived from `status === AgentStatus.ACTIVE`
- Passed `isOnGreenBackground={isActive}` to `AgentStatusBadge`
- Passed `isActive={isActive}` to `AgentMetrics`

**Visual Result:**
- ✅ IDLE agents: Dark card with colored left border
- ✅ ACTIVE agents: Full green background, white text, gold cost

---

### **2. AgentStatusBadge Component** (`agent-status-badge.tsx`)

**Changes Implemented:**

#### **New Prop: `isOnGreenBackground`**
```tsx
interface AgentStatusBadgeProps {
  status: AgentStatus;
  agentName: string;
  isOnGreenBackground?: boolean; // NEW
}
```

#### **IDLE Badge - Darker Background**
```tsx
[AgentStatus.IDLE]: {
  text: "IDLE",
  className: "bg-badge-idle-bg text-badge-idle-text", // Now uses slate-800
}
```

#### **ACTIVE Badge - Conditional Styling**
```tsx
[AgentStatus.ACTIVE]: {
  text: "ACTIVE",
  className: isOnGreenBackground
    ? "bg-badge-active-on-green text-badge-active-on-green" // Dark green on green
    : "bg-status-badge-active-bg text-status-badge-active-text", // Cyan on dark
}
```

#### **Typography - Uppercase, 11px**
```tsx
<Badge
  className={`text-[11px] px-2 py-0.5 font-medium uppercase ${config.className}`}
>
  {config.text}
</Badge>
```

**Visual Result:**
- ✅ All badges now uppercase
- ✅ IDLE badges darker (slate-800 instead of gray-700)
- ✅ ACTIVE badges adapt to background color

---

### **3. AgentMetrics Component** (`agent-metrics.tsx`)

**Changes Implemented:**

#### **New Prop: `isActive`**
```tsx
export interface AgentMetricsProps {
  tokens: number;
  cost: number;
  latency: number;
  cacheStatus: "hit" | "miss" | "none";
  isActive?: boolean; // NEW
}
```

#### **Active State Styling**
All labels and values adapt when `isActive=true`:

**Labels:**
```tsx
<span className={`text-xs ${
  isActive ? "text-agent-active-label" : "text-text-tertiary"
}`}>
  Tokens
</span>
```

**Values:**
```tsx
<span className={`text-sm font-medium ${
  isActive ? "text-agent-active-value" : "text-text-primary"
}`}>
  {formatTokens(tokens)}
</span>
```

**Cost (Gold on Active):**
```tsx
<span className={`text-sm font-medium font-mono ${
  isActive ? "text-agent-active-cost" : "text-cost-text"
}`}>
  {formatCost(cost)}
</span>
```

**Cache Icon:**
```tsx
function CacheStatusIcon({ status, isActive }: {...}): JSX.Element {
  const iconMap = {
    hit: (
      <CheckCircle className={`h-4 w-4 ${
        isActive ? "text-agent-active" : "text-cache-hit"
      }`} />
    ),
    // ...
  };
}
```

**Visual Result:**
- ✅ Metrics labels white on active green background
- ✅ Cost always displays in gold (yellow-400)
- ✅ Cache icons adapt to background

---

### **4. Header Component** (`header.tsx`)

**Changes Implemented:**

#### **Logo Icon - Bot with Cyan Background**
```tsx
<div className="w-10 h-10 rounded-md bg-agent-card-border-cyan/20 flex items-center justify-center">
  <Bot className="w-6 h-6 text-agent-card-text-cyan" />
</div>
```

#### **New Title & Subtitle**
```tsx
<h1 className="text-base font-semibold text-text-primary">
  Multi-Agent Customer Service System
</h1>
<p className="text-xs text-text-secondary">
  LangGraph Orchestrator + RAG/CAG Hybrid
</p>
```

#### **Status Badge - Styled to Match Mockup**
```tsx
<Badge className="bg-badge-active-bg text-badge-active-text border-0 text-[11px] px-3 py-1 font-medium">
  ACTIVE
</Badge>
```

**Visual Result:**
- ✅ Cyan bot icon in square with subtle background
- ✅ Updated title matches mockup
- ✅ ACTIVE badge in top right corner

---

## 🔴 **REMAINING WORK (Phase 2)**

### **5. ExecutionGraph Component** (NEW)

**Location:** Create `/components/panels/execution-graph.tsx`

**Requirements:**
- Show execution flow at bottom of Agent Pipeline panel
- Display steps: Input → Orchestrator → Agent → Response
- Green checkmarks for completed steps
- Model names below each step
- Gray connector lines between steps

**Example Implementation Needed:**
```tsx
export function ExecutionGraph({ steps }: { steps: ExecutionStep[] }) {
  return (
    <div className="bg-execution-graph border-t border-execution-graph p-4">
      <h3 className="text-execution-graph-header section-header mb-3">
        EXECUTION GRAPH
      </h3>
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => (
          <>
            <Step status={step.status} label={step.model} />
            {idx < steps.length - 1 && <Connector />}
          </>
        ))}
      </div>
    </div>
  );
}
```

---

### **6. RetrievalPanel Updates**

**Location:** `/components/panels/retrieval-panel.tsx`

**Changes Needed:**
- Add section headers with colored text:
  - `QUERY ANALYSIS` - Purple (`text-log-header-query`)
  - `VECTOR SEARCH` - Blue (`text-log-header-vector`)
  - `CACHED CONTEXT` - Green (`text-log-header-cache`)
  - `RETRIEVED DOCUMENTS` - Cyan (`text-log-header-docs`)
- Add timestamps next to headers (`text-log-header-timestamp`)
- Update document card filenames to cyan (`text-doc-filename`)
- Add "View Full" links in cyan (`text-doc-view-link`)

**Example Implementation:**
```tsx
<div className="space-y-4">
  {/* QUERY ANALYSIS Section */}
  <div>
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-log-header-query section-header">QUERY ANALYSIS</h3>
      <span className="text-log-header-timestamp text-xs">14:32:18</span>
    </div>
    <QueryAnalysisCard {...} />
  </div>

  {/* VECTOR SEARCH Section */}
  <div>
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-log-header-vector section-header">VECTOR SEARCH</h3>
      <span className="text-log-header-timestamp text-xs">14:32:19</span>
    </div>
    <VectorSearchCard {...} />
  </div>

  {/* RETRIEVED DOCUMENTS Section */}
  <div>
    <h3 className="text-log-header-docs section-header mb-2">RETRIEVED DOCUMENTS</h3>
    <div className="space-y-2">
      {documents.map(doc => (
        <div className="bg-bg-tertiary p-3 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-doc-filename">{doc.filename}</span>
            <span className="text-doc-similarity-label">
              sim: <span className="text-doc-similarity-value">{doc.similarity}</span>
            </span>
          </div>
          <p className="text-text-secondary text-sm mt-1">{doc.preview}</p>
          <button className="text-doc-view-link text-sm mt-2">👁 View Full</button>
        </div>
      ))}
    </div>
  </div>
</div>
```

---

### **7. LogEntry Component Updates**

**Location:** `/components/panels/log-entry.tsx`

**Changes Needed:**
- Remove timestamp from CardHeader (will be in section header instead)
- Simplify to just wrap content with colored background
- May not need significant changes if using section headers

---

## 📋 **Phase 1 Completion Checklist**

- [x] Update AgentCard with active state
- [x] Update AgentStatusBadge with new styling
- [x] Update AgentMetrics with active state styling
- [x] Update Header with logo and new layout
- [x] Document all changes in this file

---

## 📋 **Phase 2 TODO Checklist**

- [ ] Create ExecutionGraph component
- [ ] Update RetrievalPanel with section headers
- [ ] Update document card styling
- [ ] Add "View Full" links
- [ ] Update LogEntry component if needed
- [ ] Test all components visually
- [ ] Verify all token usage is correct

---

## 🎯 **Testing Guidelines**

### **Visual Testing Checklist:**

**AgentCard:**
- [ ] IDLE agents show dark card with colored left border
- [ ] ACTIVE agents show full green background
- [ ] ACTIVE agent text is white
- [ ] Cost is gold on both IDLE and ACTIVE
- [ ] IDLE badge is darker (slate-800)
- [ ] ACTIVE badge is dark green on green background
- [ ] Hover effect works on IDLE cards

**Header:**
- [ ] Bot icon visible in cyan square
- [ ] Title matches mockup
- [ ] ACTIVE badge in top right
- [ ] Spacing is correct

**Metrics:**
- [ ] All labels white on active green
- [ ] Cost always displays in gold
- [ ] Cache icons adapt to background

---

## 📞 **Next Steps**

**For Component Implementation:**
1. Create `ExecutionGraph` component using tokens:
   - `text-execution-graph-header`
   - `bg-execution-step-complete`
   - `bg-execution-step-active`
   - `bg-execution-step-pending`
   - `bg-execution-connector`

2. Update `RetrievalPanel` with section headers using:
   - `text-log-header-query` (purple)
   - `text-log-header-vector` (blue)
   - `text-log-header-cache` (green)
   - `text-log-header-docs` (cyan)
   - `text-log-header-timestamp` (gray)
   - `section-header` utility class

3. Update document cards with:
   - `text-doc-filename` (cyan)
   - `text-doc-view-link` (cyan)
   - `text-doc-similarity-label` (gray)
   - `text-doc-similarity-value` (white)

---

**🎨 Phase 1 Complete - 4 Components Updated with Mockup v2.0 Tokens**

All updated components now fully utilize the new design token system and match the mockup v2.0 specification for active states, typography, and color usage.
