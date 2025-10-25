# Epic 4: Mobile Layout & Real-Time Streaming

**Epic ID**: ORCH-EPIC-4
**Phase**: 4 of 6
**Timeline**: Days 16-20 (~18 hours)
**Status**: 🚧 Ready for Story Creation
**Dependencies**: Epic 1, Epic 2, Epic 3
**PRD Reference**: OrchestratAI PRD v2.0, Section 4.2, Section 10 (Phase 4), Section 14

---

## Epic Goal

Transform OrchestratAI into a truly mobile-responsive application with tabbed navigation for small screens, and implement Server-Sent Events (SSE) streaming for real-time agent status updates and progressive message delivery, creating a professional, polished user experience across all devices.

---

## Business Value

This epic delivers:
- **Mobile Accessibility**: ~60% of users access web apps on mobile devices
- **Real-Time Experience**: Streaming creates engaging, responsive feel (like ChatGPT)
- **Progressive Disclosure**: See messages being typed character-by-character
- **Professional Polish**: Demonstrates production-ready UX thinking
- **Portfolio Impact**: Shows responsive design and modern streaming APIs

**User Impact**: Users on any device get a seamless, real-time experience watching the AI "think" and respond progressively.

---

## Epic Description

### What's Being Built

This epic has two major components:

#### 1. Mobile Responsive Layout (< 768px)

**Current State** (from Epic 1):
- Three-panel desktop layout (768px+)
- Panels collapse but still side-by-side

**New State**:
- **Tabbed Interface** with three tabs:
  - 💬 **Chat** (default active)
  - 🤖 **Agents**
  - 📋 **Logs**

**Tab Navigation**:
- Bottom tab bar (iOS/Android pattern)
- Active tab highlighted with agent color
- Smooth transitions between tabs
- Optional: Swipe gestures to switch tabs

**Layout Behavior**:
- Tabs at bottom on mobile (fixed position)
- Each panel occupies full screen when active
- Footer stats bar remains visible (compressed on mobile)
- Header simplified (logo only, no subtitle)

#### 2. Server-Sent Events (SSE) Streaming

**Current State** (from Epic 2):
- Request → Wait → Full response arrives

**New State**:
- Request → Stream events → Progressive updates

**What Streams**:
1. **Message content** (character-by-character or word-by-word)
2. **Agent status updates** (ROUTING → ACTIVE transitions)
3. **Retrieval logs** (entries appear as they're generated)
4. **Typing indicators** (which agent is processing)

**Backend**:
- New endpoint: `POST /api/chat/stream`
- Sends SSE events (not JSON response)
- Events: `message_chunk`, `agent_status`, `retrieval_log`, `done`

**Frontend**:
- New hook: `use-streaming.ts`
- Connects to SSE endpoint
- Updates chat state progressively
- Graceful fallback to non-streaming if unsupported

### How It Integrates

```
Mobile Layout:
  User opens app on iPhone → Detects viewport width < 768px →
  Renders tabbed interface → Default shows Chat tab →
  User taps "Agents" → Smooth transition to Agent Panel →
  User swipes right → Returns to Chat tab

SSE Streaming:
  User sends message → Frontend opens SSE connection →
  Backend emits events:
    1. agent_status: { agent: "BILLING", status: "ACTIVE" }
    2. message_chunk: { content: "We " }
    3. message_chunk: { content: "offer " }
    4. retrieval_log: { type: "vector_search", ... }
    5. message_chunk: { content: "three " }
    6. done: {}
  → Frontend accumulates chunks into message →
  → Updates agent panel in real-time →
  → Adds logs as they arrive →
  → Closes connection on "done"
```

---

## Success Criteria

### Must Have - Mobile Layout
- [ ] Tab bar renders on screens < 768px
- [ ] Three tabs: Chat, Agents, Logs
- [ ] Active tab highlighted with primary color
- [ ] Tapping tab switches panel (full-screen)
- [ ] Only one panel visible at a time on mobile
- [ ] Desktop layout unchanged (three panels side-by-side)
- [ ] Footer stats bar responsive (stacks on mobile)
- [ ] No horizontal scroll on 320px width (iPhone SE)

### Must Have - SSE Streaming
- [ ] `/api/chat/stream` endpoint streams SSE events
- [ ] Frontend connects to SSE on message send
- [ ] Message text appears progressively (typewriter effect)
- [ ] Agent status updates in real-time during stream
- [ ] Retrieval logs appear as backend generates them
- [ ] "done" event closes connection cleanly
- [ ] Fallback to regular POST if SSE fails
- [ ] Error handling for connection drops

### Should Have
- [ ] Swipe gestures switch tabs on mobile
- [ ] Tab icons match agent colors
- [ ] Stream typing speed configurable (chars/second)
- [ ] Reconnect SSE on disconnect (with exponential backoff)

### Nice to Have
- [ ] Tab badges show unread count (e.g., new logs while viewing chat)
- [ ] Haptic feedback on tab switch (mobile devices)
- [ ] Progressive message rendering with markdown parsing
- [ ] Stream pause/resume functionality

---

## Key Features & Components

### 1. Mobile Tabbed Interface

**Files to Create**:
```
orchestratai_client/src/components/mobile/
├── tab-navigation.tsx           # Bottom tab bar
├── tab-panel.tsx                # Container for tab content
└── swipe-handler.tsx            # Optional: swipe gesture detection
```

**TabNavigation Component**:
```typescript
interface TabNavigationProps {
  activeTab: 'chat' | 'agents' | 'logs';
  onTabChange: (tab: string) => void;
  unreadCounts?: {
    agents: number;
    logs: number;
  };
}

// Tabs configuration
const TABS = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'logs', label: 'Logs', icon: FileText },
] as const;
```

**Layout Hook**:
```typescript
// hooks/use-mobile.ts
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
```

### 2. SSE Backend Implementation

**New Endpoint**:
```python
# orchestratai_api/src/api/chat.py
from fastapi.responses import StreamingResponse
import asyncio

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    async def event_generator():
        # 1. Emit agent status update
        yield create_sse_event("agent_status", {
            "agent": "BILLING",
            "status": "ACTIVE"
        })
        await asyncio.sleep(0.1)

        # 2. Emit query analysis log
        yield create_sse_event("retrieval_log", {
            "type": "query_analysis",
            "data": { ... }
        })
        await asyncio.sleep(0.1)

        # 3. Stream message chunks
        message = "We offer three pricing tiers..."
        for word in message.split():
            yield create_sse_event("message_chunk", {
                "content": word + " "
            })
            await asyncio.sleep(0.05)  # 50ms between words

        # 4. Emit done event
        yield create_sse_event("done", {
            "session_id": session_id,
            "metadata": { ... }
        })

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        }
    )

def create_sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"
```

**Event Types**:
```typescript
type SSEEvent =
  | { event: 'message_chunk'; data: { content: string } }
  | { event: 'agent_status'; data: { agent: AgentType; status: AgentStatus } }
  | { event: 'retrieval_log'; data: LogEntry }
  | { event: 'done'; data: { session_id: string; metadata: AgentMetrics } };
```

### 3. SSE Frontend Hook

**File to Create**:
```typescript
// hooks/use-streaming.ts
export function useStreaming() {
  const sendStreamingMessage = async (
    content: string,
    onChunk: (chunk: string) => void,
    onAgentUpdate: (agent: AgentType, status: AgentStatus) => void,
    onLog: (log: LogEntry) => void,
    onComplete: (metadata: AgentMetrics) => void
  ) => {
    const eventSource = new EventSource(
      `${API_URL}/api/chat/stream?message=${encodeURIComponent(content)}`
    );

    let accumulatedMessage = '';

    eventSource.addEventListener('message_chunk', (e) => {
      const data = JSON.parse(e.data);
      accumulatedMessage += data.content;
      onChunk(accumulatedMessage);
    });

    eventSource.addEventListener('agent_status', (e) => {
      const data = JSON.parse(e.data);
      onAgentUpdate(data.agent, data.status);
    });

    eventSource.addEventListener('retrieval_log', (e) => {
      const data = JSON.parse(e.data);
      onLog(data);
    });

    eventSource.addEventListener('done', (e) => {
      const data = JSON.parse(e.data);
      onComplete(data.metadata);
      eventSource.close();
    });

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
      // Fallback to regular POST request
    };
  };

  return { sendStreamingMessage };
}
```

### 4. Error Handling & Edge Cases

**Error Scenarios to Handle**:

1. **SSE Connection Fails**:
   - Fallback to regular POST `/api/chat`
   - Show toast: "Streaming unavailable, using standard mode"

2. **Connection Drops Mid-Stream**:
   - Detect via `onerror` event
   - Retry connection (exponential backoff: 1s, 2s, 4s)
   - Max 3 retries, then fallback

3. **Malformed SSE Event**:
   - Catch JSON parse errors
   - Log to console
   - Continue stream (don't crash)

4. **User Navigates Away**:
   - Close SSE connection in cleanup (`useEffect` return)
   - Cancel any pending streams

**Implementation**:
```typescript
// lib/errors.ts (extend from Epic 2)
export class StreamError extends Error {
  constructor(
    message: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'StreamError';
  }
}
```

---

## Technical Specifications

### Mobile Breakpoints

```css
/* Use Tailwind breakpoints (already configured in Epic 1) */
/* Mobile: default (0px - 767px) */
/* Tablet: md (768px - 1023px) */
/* Desktop: lg (1024px+) */

/* Tab bar visibility */
.tab-navigation {
  @apply lg:hidden;  /* Hide on desktop */
}

/* Desktop three-panel */
.three-panel-layout {
  @apply hidden lg:grid lg:grid-cols-[250px_1fr_300px];
}
```

### SSE Protocol Details

**EventSource Polyfill**:
```bash
# For older browsers (Safari < 12)
bun add eventsource-polyfill
```

**SSE Format** (per W3C spec):
```
event: message_chunk
data: {"content":"Hello "}

event: message_chunk
data: {"content":"world"}

event: done
data: {"session_id":"uuid"}

```

**Key Requirements**:
- Each event MUST end with double newline (`\n\n`)
- Data MUST be JSON string (serialize objects)
- Event names are case-sensitive
- Reconnection handled by browser (send `id` field for resume)

### State Management Updates

**Extend ChatProvider**:
```typescript
interface ChatState {
  // ... existing from Epic 2 & 3

  // NEW: Streaming state
  isStreaming: boolean;
  streamingMessageId: string | null;

  // NEW: Methods
  startStream: (content: string) => void;
  updateStreamingMessage: (chunk: string) => void;
  endStream: (metadata: AgentMetrics) => void;
}
```

---

## Dependencies & Prerequisites

### Prerequisites from Previous Epics
- ✅ Epic 1: Responsive layout foundation, design tokens
- ✅ Epic 2: Chat interface, API client
- ✅ Epic 3: Agent panel, retrieval logs

### New Dependencies to Install
```bash
# Frontend
bun add eventsource-polyfill  # SSE support for older browsers
bun add framer-motion         # Optional: smooth tab animations

# Backend (Python)
# No new dependencies (FastAPI has native StreamingResponse)
```

---

## Acceptance Criteria

### Functional Requirements

**Scenario 1: Mobile Tab Navigation**
1. Open app on iPhone (375px width)
2. Assert: Tab bar visible at bottom
3. Assert: Chat tab active (highlighted)
4. Assert: Chat panel visible full-screen
5. Tap "Agents" tab
6. Assert: Agents panel visible, chat hidden
7. Assert: All 4 agent cards visible (stacked vertically)
8. Swipe right
9. Assert: Returns to chat tab

**Scenario 2: SSE Streaming (Desktop or Mobile)**
1. User sends message: "What are your pricing tiers?"
2. User message appears instantly (optimistic update)
3. Typing indicator: "Billing Agent is typing..."
4. After 200ms, first word appears: "We"
5. Words appear progressively: "We offer three..."
6. Agent panel updates: Billing Agent status = ACTIVE
7. Log entry appears: "Query Analysis"
8. Message completes after 2 seconds
9. Typing indicator disappears
10. Billing Agent status = COMPLETE

**Scenario 3: SSE Fallback**
1. Mock SSE connection failure (disable in DevTools)
2. User sends message
3. Assert: Toast notification "Using standard mode"
4. Assert: Message sent via regular POST
5. Assert: Full response appears after delay (no streaming)

### Non-Functional Requirements

- **Performance**:
  - Tab switch <100ms animation
  - SSE chunk processing <10ms
  - No memory leaks from unclosed connections

- **Accessibility**:
  - Tab bar uses `role="tablist"` and `role="tab"`
  - Active tab has `aria-selected="true"`
  - Tab panels have `aria-labelledby` matching tab ID
  - Keyboard navigation: Arrow keys switch tabs

- **Responsiveness**:
  - Tabs stack at 320px (no horizontal scroll)
  - Footer icons hide labels on < 375px
  - SSE works on mobile networks (handle slow connections)

---

## Technical Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| SSE not supported in old browsers | Medium | Low | Polyfill + fallback to POST |
| Mobile browser tabs killed (iOS) | High | Medium | Persist chat state in localStorage |
| SSE connection limit (6 per domain) | Low | Low | Close connections on "done" event |
| Streaming too fast (unreadable) | Low | Medium | Configurable delay between chunks |
| Docker networking breaks SSE | High | Low | Test SSE in Docker; verify CORS/headers |

---

## Story Breakdown Guidance for Scrum Master

This epic should be broken into **5-7 user stories**:

1. **Mobile Layout** (2-3 stories):
   - Story 1: Build tab navigation component
   - Story 2: Implement tab switching logic and animations
   - Story 3: Add swipe gesture support (optional)

2. **SSE Backend** (1-2 stories):
   - Story 4: Create `/api/chat/stream` endpoint
   - Story 5: Implement event generator with mock data

3. **SSE Frontend** (2-3 stories):
   - Story 6: Build `use-streaming` hook
   - Story 7: Integrate streaming into ChatProvider
   - Story 8: Add error handling and fallback logic

**Story Sizing**:
- Mobile layout: 5-8 points each
- SSE backend: 5-8 points
- SSE frontend: 8-13 points

**Critical Path**:
1. Mobile layout can be developed independently of SSE
2. SSE backend before frontend (enables testing with curl/Postman)
3. Error handling last (requires working SSE first)

---

## Definition of Done

- [ ] Tab navigation renders on mobile (<768px)
- [ ] Tabs switch smoothly on tap
- [ ] Desktop layout unaffected (three panels)
- [ ] SSE endpoint streams events correctly
- [ ] Frontend connects to SSE and receives events
- [ ] Message text streams progressively
- [ ] Agent status updates in real-time
- [ ] Logs appear during stream
- [ ] SSE connection closes on "done" event
- [ ] Fallback to POST works if SSE unavailable
- [ ] Error toast displays on connection failure
- [ ] No memory leaks (verified with Chrome DevTools)
- [ ] Tested on Chrome, Safari, Firefox (desktop + mobile)
- [ ] Tested on iOS Safari, Chrome Android
- [ ] Code review completed
- [ ] Accessibility: keyboard navigation, ARIA labels

---

## Testing Strategy

### Manual Testing Checklist

**Mobile Responsive**:
- [ ] Test on 320px (iPhone SE)
- [ ] Test on 375px (iPhone 12)
- [ ] Test on 390px (iPhone 14 Pro)
- [ ] Test on 768px (tablet breakpoint)
- [ ] Test landscape orientation
- [ ] Test swipe gestures (if implemented)

**SSE Streaming**:
- [ ] Test with slow network (DevTools throttling)
- [ ] Test connection drop mid-stream
- [ ] Test multiple concurrent streams (error expected)
- [ ] Test SSE with 1000+ character messages
- [ ] Test with special characters (emoji, unicode)

### Automated Testing

```typescript
// __tests__/hooks/use-streaming.test.ts
describe('useStreaming', () => {
  it('should accumulate message chunks correctly', async () => {
    // Mock EventSource
    // Emit multiple message_chunk events
    // Assert final message is concatenated correctly
  });

  it('should close connection on done event', async () => {
    // Mock EventSource
    // Emit done event
    // Assert connection closed
  });
});
```

---

## Related Documentation

- **PRD**: `/docs/prd/orchestratai_prd_v2.md` - Sections 4.2, 10 (Phase 4), 14
- **Epic 2**: `/docs/stories/epic-2-chat-interface.md` (extends chat functionality)
- **MDN SSE Guide**: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- **Tailwind Responsive**: https://tailwindcss.com/docs/responsive-design

---

## Notes for Story Manager

**Key Considerations**:

1. **Mobile-First Development**:
   - Build tab navigation first, test on mobile devices
   - Ensure touch targets are 44px minimum (iOS HIG)
   - Use `:active` states for tactile feedback

2. **SSE Implementation Order**:
   - Start with backend (easier to test with curl)
   - Frontend hook next (can mock EventSource)
   - Integration last (full flow)

3. **Testing Strategy**:
   - Use BrowserStack for real device testing
   - Test on slow 3G network (simulate mobile conditions)
   - Verify SSE works through Docker network

4. **Fallback Gracefully**:
   - Don't break the app if SSE fails
   - Users should not notice fallback (just no streaming)
   - Log errors for debugging but don't show to users

5. **Performance Optimization**:
   - Close SSE connections immediately on "done"
   - Don't keep multiple connections open
   - Clear event listeners in useEffect cleanup

6. **Client vs Server Components**:
   - Tab navigation MUST be Client Component (interactivity)
   - SSE hook is client-side only (browser API)

**Handoff to Epic 5**:
Epic 5 adds polish like animations, keyboard shortcuts, and performance optimization. Ensure tab animations are smooth (60fps) so Epic 5 can enhance rather than fix.

This epic makes OrchestratAI feel like a modern, production-ready application.
