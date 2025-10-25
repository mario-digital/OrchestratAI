# Epic 3: Agent & Log Panels

**Epic ID**: ORCH-EPIC-3
**Phase**: 3 of 6
**Timeline**: Days 11-15 (~18 hours)
**Status**: 🚧 Ready for Story Creation
**Dependencies**: Epic 1 (Foundation), Epic 2 (Chat Interface)
**PRD Reference**: OrchestratAI PRD v2.0, Section 4.1, Section 10 (Phase 3)

---

## Epic Goal

Implement the left Agent Panel and right Retrieval Log Panel to visualize the multi-agent orchestration system in real-time, providing users with transparency into agent status, routing decisions, vector search operations, and system performance metrics.

---

## Business Value

This epic delivers:
- **System Transparency**: Users see how their queries are routed and processed
- **Multi-Agent Visualization**: Demonstrates the orchestrator's routing intelligence
- **Performance Insights**: Real-time metrics (tokens, cost, latency) build trust
- **RAG/CAG Operations**: Shows retrieval strategy and document sources
- **Portfolio Differentiation**: Advanced UI that stands out in demos/interviews

**User Impact**: Users understand which agent is handling their request and why, creating confidence in the system's intelligence.

---

## Epic Description

### What's Being Built

This epic brings the left and right panels to life with dynamic, real-time content:

#### Left Panel: Agent Pipeline
Displays all 4 agents with live status updates:
- **Orchestrator** (Cyan): Routes queries to specialist agents
- **Billing Agent** (Green): Handles pricing, subscriptions, payments
- **Technical Agent** (Blue): Addresses technical issues, API questions
- **Policy Agent** (Purple): Manages refunds, terms, cancellations

**Each Agent Card Shows**:
- Agent name with color-coded icon
- Current status badge (IDLE, ROUTING, ACTIVE, COMPLETE)
- Model name (e.g., "OpenAI GPT-4o")
- Strategy badge (RAG, CAG, or Hybrid)
- Token usage counter
- Cost tracking ($0.0000)
- Latency metric (ms)
- Cache status indicator

**Interactive Features**:
- Execution graph link (Phase 5 - navigates to visual workflow)
- Collapsible panel (from Epic 1)

#### Right Panel: Retrieval Log
Real-time operation log showing:

1. **Query Analysis Section**:
   - Intent classification ("Billing inquiry detected")
   - Confidence score (0.95)
   - Target agent selection
   - Routing reasoning

2. **Vector Search Details**:
   - Collection name (ChromaDB)
   - Number of chunks retrieved (5)
   - Similarity scores for each chunk
   - Search latency (ms)

3. **Cache Operations**:
   - Cache hit/miss status
   - Hit rate percentage
   - Cache size information

4. **Retrieved Documents Preview**:
   - Source file names
   - Document snippets (truncated to 200 chars)
   - Similarity scores
   - "View Full" button (opens modal)

**Color Coding**:
- Query analysis: Blue background
- Vector search: Purple background
- Cache operations: Green background
- Errors: Red background

### How It Integrates

Both panels consume data from the chat API response (Epic 2):

```
User sends message → Backend routes to agent → Response includes:
  - agent: "BILLING"
  - metadata: { tokens, cost, latency }
  - retrieval_logs: [ { type, data } ]
  - agent_status: { orchestrator: "ROUTING", billing: "ACTIVE", ... }
→ Chat Provider updates agent panel state
→ Chat Provider updates log panel state
→ Panels re-render with new data
```

---

## Success Criteria

### Must Have
- [ ] All 4 agent cards display with correct colors (cyan, green, blue, purple)
- [ ] Agent status updates when chat message is processed
- [ ] Orchestrator status changes: IDLE → ROUTING → IDLE
- [ ] Selected agent status changes: IDLE → ACTIVE → COMPLETE
- [ ] Token counters increment with each message
- [ ] Cost displays in USD format (e.g., "$0.0023")
- [ ] Latency displays in milliseconds (e.g., "1,200ms")
- [ ] Strategy badges display correct text (RAG/CAG/Hybrid)
- [ ] Retrieval log entries appear in chronological order (newest first)
- [ ] Log entries have timestamps (HH:MM:SS format)
- [ ] Query analysis section shows intent and confidence
- [ ] Document previews truncate at 200 characters with "..."
- [ ] "View Full" button opens modal with complete document text
- [ ] Log panel scrolls independently from chat panel

### Should Have
- [ ] Agent cards have subtle hover effect
- [ ] Status badge includes animated pulse for ACTIVE state
- [ ] Execution graph link is clickable (stub for Phase 5)
- [ ] Cache hit rate displays as percentage with progress bar
- [ ] Similarity scores display as colored bars (high=green, low=red)

### Nice to Have
- [ ] Agent card "expand" button shows full metrics history
- [ ] Log entries collapsible by type (show/hide all vector searches)
- [ ] Export logs to JSON button
- [ ] Dark/light syntax highlighting for document snippets

---

## Key Features & Components

### 1. Agent Panel Components

**Files to Create**:
```
orchestratai_client/src/components/panels/
├── agent-panel.tsx              # Container for all agents (Server or Client)
├── agent-card.tsx               # Individual agent display (Client)
├── agent-status-badge.tsx       # Status indicator component
└── agent-metrics.tsx            # Metrics display (tokens, cost, latency)
```

**AgentCard Component**:
```typescript
interface AgentCardProps {
  agent: AgentType;              // ORCHESTRATOR | BILLING | TECHNICAL | POLICY
  status: AgentStatus;            // IDLE | ROUTING | ACTIVE | COMPLETE
  model: string;                  // "OpenAI GPT-4o"
  strategy: StrategyType;         // RAG | CAG | HYBRID
  metrics: {
    tokens: number;
    cost: number;                 // USD
    latency: number;              // milliseconds
  };
  cacheStatus: 'hit' | 'miss' | 'none';
  onViewGraph?: () => void;       // Navigation to execution graph
}
```

**Agent Color Mapping** (use design tokens from Epic 1):
```typescript
const AGENT_COLORS = {
  ORCHESTRATOR: 'var(--color-agent-orchestrator)',  // Cyan
  BILLING: 'var(--color-agent-billing)',            // Green
  TECHNICAL: 'var(--color-agent-technical)',        // Blue
  POLICY: 'var(--color-agent-policy)',              // Purple
} as const;
```

### 2. Retrieval Log Components

**Files to Create**:
```
orchestratai_client/src/components/panels/
├── retrieval-panel.tsx          # Container for logs (Server or Client)
├── log-entry.tsx                # Individual log item (Client)
├── query-analysis-card.tsx      # Query analysis display
├── vector-search-card.tsx       # Vector search details
├── document-preview.tsx         # Document snippet with "View Full"
└── document-modal.tsx           # Full document viewer (shadcn Dialog)
```

**LogEntry Component**:
```typescript
interface LogEntryProps {
  type: 'query_analysis' | 'vector_search' | 'cache_operation' | 'error';
  timestamp: Date;
  data: QueryAnalysis | VectorSearch | CacheOperation | ErrorInfo;
}
```

**Log Data Structures** (add to `lib/types.ts`):
```typescript
interface QueryAnalysis {
  intent: string;                // "Billing inquiry detected"
  confidence: number;            // 0.95
  targetAgent: AgentType;
  reasoning: string;             // "Message contains pricing keywords"
}

interface VectorSearch {
  collection: string;            // "knowledge_base_v1"
  chunksRetrieved: number;       // 5
  chunks: Array<{
    source: string;              // "pricing_faq.md"
    snippet: string;             // Document text (truncated)
    similarity: number;          // 0.87
  }>;
  latency: number;               // milliseconds
}

interface CacheOperation {
  status: 'hit' | 'miss';
  hitRate: number;               // 0.75
  size: string;                  // "2.3 MB"
}
```

---

## Technical Specifications

### State Management Updates

Extend ChatProvider from Epic 2 to include agent and log state:

```typescript
// components/providers/chat-provider.tsx
interface ChatState {
  // ... existing message state from Epic 2

  // NEW: Agent state
  agents: Record<AgentType, AgentState>;
  updateAgentStatus: (agent: AgentType, status: AgentStatus) => void;
  incrementAgentMetrics: (agent: AgentType, metrics: MetricsUpdate) => void;

  // NEW: Log state
  retrievalLogs: LogEntry[];
  addLogEntry: (entry: LogEntry) => void;
  clearLogs: () => void;
}

interface AgentState {
  status: AgentStatus;
  model: string;
  strategy: StrategyType;
  metrics: {
    tokens: number;
    cost: number;
    latency: number;
  };
  cacheStatus: 'hit' | 'miss' | 'none';
}
```

### Backend Response Enhancement

Update backend `/api/chat` endpoint to include agent and log data:

```python
# orchestratai_api/src/models/schemas.py
class ChatResponse(BaseModel):
    # ... existing fields from Epic 2

    # NEW: Agent status update
    agent_status: dict[AgentType, AgentStatus]

    # NEW: Metrics for the handling agent
    metrics: AgentMetrics

    # NEW: Retrieval logs
    retrieval_logs: list[LogEntry]

class AgentMetrics(BaseModel):
    tokens_used: int
    cost_usd: float
    latency_ms: int
    cache_status: Literal["hit", "miss", "none"]

class LogEntry(BaseModel):
    type: Literal["query_analysis", "vector_search", "cache_operation", "error"]
    timestamp: datetime
    data: dict  # Polymorphic data based on type
```

### Mock Data Generation

Extend mock service to generate realistic logs:

```python
# orchestratai_api/src/services/mock_data.py
def generate_retrieval_logs(agent: AgentType) -> list[LogEntry]:
    logs = []

    # 1. Query analysis (always present)
    logs.append(LogEntry(
        type="query_analysis",
        timestamp=datetime.now(),
        data={
            "intent": f"{agent.value} inquiry detected",
            "confidence": random.uniform(0.85, 0.99),
            "target_agent": agent,
            "reasoning": "Message keywords matched agent domain"
        }
    ))

    # 2. Vector search (80% chance)
    if random.random() < 0.8:
        logs.append(LogEntry(
            type="vector_search",
            timestamp=datetime.now(),
            data={
                "collection": "knowledge_base_v1",
                "chunks_retrieved": random.randint(3, 7),
                "chunks": generate_mock_chunks(5),
                "latency": random.randint(50, 300)
            }
        ))

    # 3. Cache operation (50% chance)
    if random.random() < 0.5:
        logs.append(LogEntry(
            type="cache_operation",
            timestamp=datetime.now(),
            data={
                "status": random.choice(["hit", "miss"]),
                "hit_rate": random.uniform(0.6, 0.9),
                "size": f"{random.uniform(1.0, 5.0):.1f} MB"
            }
        ))

    return logs
```

### Document Modal Implementation

Use shadcn/ui Dialog component:

```typescript
// components/panels/document-modal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    source: string;
    content: string;
    similarity: number;
  };
}

export function DocumentModal({ isOpen, onClose, document }: DocumentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{document.source}</DialogTitle>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Similarity: {(document.similarity * 100).toFixed(1)}%
          </p>
        </DialogHeader>
        <div className="mt-4 whitespace-pre-wrap font-mono text-sm">
          {document.content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Dependencies & Prerequisites

### Prerequisites from Previous Epics
- ✅ Epic 1: Design tokens, enums, three-panel layout
- ✅ Epic 2: Chat interface, API client, ChatProvider

### New Dependencies to Install
```bash
# Frontend
bun add date-fns  # For timestamp formatting
bunx shadcn@latest add dialog  # For document modal
bunx shadcn@latest add progress  # For similarity score bars
```

### Backend Updates Required
- Extend `ChatResponse` Pydantic model
- Update mock data service to generate logs
- No new endpoints (reuse `/api/chat`)

---

## Acceptance Criteria

### Functional Requirements

**Scenario 1: Agent Status Updates**
1. User sends message: "What are your pricing tiers?"
2. Orchestrator card status: IDLE → ROUTING (animation pulse)
3. After 500ms, Orchestrator: ROUTING → IDLE
4. Billing Agent card status: IDLE → ACTIVE (animation pulse)
5. After backend response, Billing Agent: ACTIVE → COMPLETE
6. Token counter on Billing Agent increments by ~450
7. Cost displays as "$0.0023"
8. Latency displays as "1,200ms"

**Scenario 2: Retrieval Logs**
1. User sends message
2. Log panel shows new entry: "Query Analysis" (blue background)
3. Entry displays: Intent, 95% confidence, target agent "Billing"
4. Second entry appears: "Vector Search" (purple background)
5. Shows: 5 chunks retrieved, collection name, latency
6. Document snippets truncated with "..."
7. Click "View Full" → Modal opens with complete text

**Scenario 3: Multiple Messages**
1. User sends 3 messages in sequence
2. Agent metrics accumulate (tokens: 450 → 900 → 1350)
3. Cost accumulates correctly
4. Log panel shows 9+ entries (3 per message)
5. Logs display newest first (reverse chronological)

### Non-Functional Requirements

- **Performance**:
  - Panel updates <100ms after API response
  - Smooth animations at 60fps
  - No jank when scrolling logs

- **Accessibility**:
  - Agent status badges have aria-label (e.g., "Billing Agent Active")
  - Log timestamps have semantic time element
  - Modal keyboard navigation (Esc to close)

- **Responsiveness**:
  - Panels collapse on mobile (Epic 1 collapsible functionality)
  - Agent cards stack vertically on narrow panels
  - Log entries wrap text on small widths

---

## Technical Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| State management complexity grows | Medium | High | Keep agent/log state in ChatProvider; refactor to Zustand if needed |
| Log panel performance with 100+ entries | Medium | Medium | Implement virtualization (react-window) in Phase 5 |
| Backend response too large (>1MB) | Low | Low | Limit logs to last 20 entries; truncate chunks |
| Agent status transitions too fast to see | Low | Medium | Add minimum 300ms delay for visual feedback |

---

## Story Breakdown Guidance for Scrum Master

This epic should be broken into **5-7 user stories**:

1. **Backend Enhancements** (1-2 stories):
   - Story 1: Extend ChatResponse model with agent_status and retrieval_logs
   - Story 2: Update mock service to generate realistic logs

2. **Agent Panel** (2-3 stories):
   - Story 3: Build AgentCard component with status badges
   - Story 4: Implement agent metrics display (tokens, cost, latency)
   - Story 5: Connect agent panel to ChatProvider state

3. **Retrieval Log Panel** (2-3 stories):
   - Story 6: Build log entry components (query analysis, vector search)
   - Story 7: Implement document preview with modal
   - Story 8: Connect log panel to ChatProvider state

**Story Sizing**:
- Backend stories: 3-5 points each
- Agent panel: 5-8 points each
- Log panel: 5-8 points each

**Critical Path**:
1. Backend changes first (enables testing)
2. Agent panel (simpler, fewer data types)
3. Log panel (more complex, multiple card types)

---

## Definition of Done

- [ ] All 4 agent cards render with correct colors
- [ ] Agent status updates in real-time during chat
- [ ] Token counters accumulate correctly across messages
- [ ] Cost and latency display in correct format
- [ ] All log entry types render (query analysis, vector search, cache)
- [ ] Document modal opens on "View Full" click
- [ ] Modal displays full document text
- [ ] Logs sorted newest-first
- [ ] Panel scroll works independently
- [ ] Mobile: panels accessible via tabs (Epic 1 functionality)
- [ ] No console errors
- [ ] Code review completed
- [ ] Integration tested with 10+ messages
- [ ] Accessibility: screen reader can navigate panels

---

## Related Documentation

- **PRD**: `/docs/prd/orchestratai_prd_v2.md` - Sections 4.1, 4.3, 10 (Phase 3)
- **Epic 1**: `/docs/stories/epic-1-foundation-design-system.md`
- **Epic 2**: `/docs/stories/epic-2-chat-interface.md`
- **shadcn/ui Dialog**: https://ui.shadcn.com/docs/components/dialog

---

## Notes for Story Manager

**Key Considerations**:

1. **State Synchronization**:
   - Agent status and logs MUST update from same API response as chat message
   - Avoid separate API calls for panel data (increases latency)

2. **Agent Status Transitions**:
   - Transitions should be visible (not instant)
   - Suggested: Orchestrator routes in 500ms, then target agent activates
   - Add artificial delay if needed for UX clarity

3. **Mock Data Realism**:
   - Document snippets should be actual technical content (not Lorem ipsum)
   - Use realistic file names: `pricing_faq.md`, `api_documentation.md`
   - Similarity scores should cluster high (0.8-0.95) for relevant results

4. **Client vs Server Components**:
   - AgentPanel container can be Server Component (receives initial state)
   - AgentCard MUST be Client Component (updates from context)
   - Same for LogPanel/LogEntry

5. **Performance Optimization**:
   - Don't re-render all agent cards on every status change
   - Use React.memo for AgentCard
   - Only update the agent that changed

6. **Testing Strategy**:
   - Unit test: AgentCard renders all variants (IDLE, ROUTING, ACTIVE)
   - Unit test: LogEntry renders all types correctly
   - Integration test: Chat message updates agent panel
   - Integration test: Logs appear in correct order

**Handoff to Epic 4**:
Epic 4 implements mobile tabbed interface - ensure panels are accessible via `data-panel="agents"` and `data-panel="logs"` attributes for tab switching.

This epic is the visual differentiator that showcases the multi-agent architecture.
