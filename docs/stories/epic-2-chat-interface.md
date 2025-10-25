# Epic 2: Chat Interface

**Epic ID**: ORCH-EPIC-2
**Phase**: 2 of 6
**Timeline**: Days 6-10 (~22 hours)
**Status**: 🚧 Ready for Story Creation
**Dependencies**: Epic 1 (Foundation & Design System)
**PRD Reference**: OrchestratAI PRD v2.0, Section 10, Phase 2

---

## Epic Goal

Build a fully functional chat interface with real-time message exchange, leveraging a modular mock backend to demonstrate the multi-agent system's capabilities. This epic establishes the core user interaction pattern and frontend-backend integration framework.

---

## Business Value

This epic delivers:
- **Core User Experience**: Primary interaction point for the entire application
- **Backend Integration**: Proves frontend-backend communication via Docker networking
- **Modular Architecture Demo**: Shows proper separation of concerns (API client, state management, UI)
- **Real-time Feedback**: Optimistic UI updates create responsive, polished UX
- **Portfolio Showcase**: Demonstrates full-stack TypeScript/Python integration with type safety

**User Impact**: Users can send messages and receive intelligent, context-aware responses simulating multi-agent routing.

---

## Epic Description

### What's Being Built

This epic transforms the foundational layout from Epic 1 into a functional chat application. It includes:

1. **Backend Modular Structure**:
   - Pydantic models mirroring frontend Zod schemas
   - Mock data service generating realistic agent responses
   - `/api/chat` POST endpoint returning structured JSON

2. **Frontend API Integration Layer**:
   - Base HTTP client with error handling
   - Chat-specific API functions
   - Custom error classes for type-safe error handling

3. **Chat UI Components**:
   - Message bubbles (user & assistant variants)
   - Scrollable message list with auto-scroll to bottom
   - Typing indicator during backend processing
   - Message input area with send button

4. **State Management**:
   - React Context-based chat provider
   - Message history state
   - Processing/loading states
   - Optimistic UI updates (instant message display)

### How It Integrates

The chat interface sits in the **center panel** of the three-panel layout created in Epic 1. It communicates with the backend via:

- **Development**: `http://backend:8000` (Docker network, Server Components)
- **Client-side**: `http://localhost:8000` (browser requests)

Messages flow through the system:
```
User Input → Chat Provider → API Client → Backend Mock → Response →
Message List Update → Agent Panel Update (Epic 3)
```

---

## Success Criteria

### Must Have
- [ ] Backend `/api/chat` endpoint responds with mock agent data
- [ ] Backend returns valid JSON matching Zod schema (validated by frontend)
- [ ] User can type message and click "Send" button
- [ ] User message appears immediately (optimistic update)
- [ ] Typing indicator displays while backend processes
- [ ] AI response appears after ~1-2 second mock delay
- [ ] Messages display correct agent attribution badge
- [ ] Message list auto-scrolls to newest message
- [ ] Message bubbles use design tokens from Epic 1
- [ ] Error handling displays user-friendly toast notifications
- [ ] Chat state persists during session (no loss on panel collapse)

### Should Have
- [ ] Enter key sends message (in addition to Send button)
- [ ] Send button disables while processing
- [ ] Input clears after successful send
- [ ] Confidence score displays on AI messages
- [ ] Session ID displays in header (from backend response)

### Nice to Have
- [ ] Markdown rendering in AI responses
- [ ] Code syntax highlighting in messages
- [ ] Message timestamps
- [ ] Retry failed messages

---

## Key Features & Components

### 1. Backend Structure (Python/FastAPI)

**Files to Create**:
```
orchestratai_api/src/
├── models/
│   └── schemas.py          # Pydantic request/response models
├── services/
│   └── mock_data.py        # Mock agent response generator
└── api/
    └── chat.py             # POST /api/chat endpoint
```

**Endpoint Specification**:
```python
POST /api/chat
Content-Type: application/json

Request:
{
  "message": "What are your pricing tiers?",
  "session_id": "optional-uuid"
}

Response (200):
{
  "session_id": "uuid-v4",
  "message": "We offer three pricing tiers...",
  "agent": "BILLING",
  "confidence": 0.95,
  "strategy": "HYBRID",
  "timestamp": "2025-10-24T10:30:00Z",
  "metadata": {
    "tokens_used": 450,
    "latency_ms": 1200,
    "cost_usd": 0.0023
  }
}
```

### 2. Frontend API Layer (TypeScript)

**Files to Create**:
```
orchestratai_client/src/lib/
├── api-client.ts           # Base fetch wrapper with error handling
├── errors.ts               # Custom error classes
└── api/
    └── chat.ts             # Chat-specific API functions
```

**API Client Features**:
- Request/response validation with Zod schemas
- Automatic retry on network errors (max 3 attempts)
- Timeout handling (30 seconds)
- Type-safe error responses
- Request/response logging (development only)

### 3. Chat Components (React)

**Components to Create**:
```
orchestratai_client/src/components/chat/
├── chat-interface.tsx      # Main container (Client Component)
├── message-bubble.tsx      # Individual message display
├── message-list.tsx        # Scrollable message container
├── input-area.tsx          # Message input + send button
└── typing-indicator.tsx    # Loading animation
```

**Component Specifications**:

**MessageBubble**:
- Variant: `user` (right-aligned, blue) | `assistant` (left-aligned, dark)
- Props: `{ role, content, agent?, confidence?, timestamp? }`
- Agent badge for assistant messages (colored per agent)
- Confidence score display (optional)

**InputArea**:
- Textarea auto-expands to 5 lines max
- Send button with icon (Lucide `SendHorizonal`)
- Enter key sends (Shift+Enter for new line)
- Disabled state while processing

**TypingIndicator**:
- Animated dots (3 dots bouncing)
- Agent-colored background
- Shows agent name: "Billing Agent is typing..."

### 4. State Management (React Context)

**File to Create**:
```
orchestratai_client/src/components/providers/chat-provider.tsx
```

**State Shape**:
```typescript
interface ChatState {
  messages: Message[];
  isProcessing: boolean;
  sessionId: string | null;
  error: Error | null;

  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
}
```

**Provider Responsibilities**:
- Manage message history array
- Handle optimistic updates (add user message instantly)
- Call API and update with backend response
- Error state management
- Session ID persistence (localStorage)

---

## Technical Specifications

### Mock Data Generation (Backend)

The mock service should simulate realistic agent routing:

**Simple Routing Logic**:
```python
def route_message(message: str) -> AgentType:
    message_lower = message.lower()

    if any(word in message_lower for word in ["price", "billing", "cost", "subscription"]):
        return AgentType.BILLING
    elif any(word in message_lower for word in ["error", "bug", "technical", "api"]):
        return AgentType.TECHNICAL
    elif any(word in message_lower for word in ["policy", "refund", "terms", "cancel"]):
        return AgentType.POLICY
    else:
        return AgentType.ORCHESTRATOR
```

**Response Templates**:
- Each agent type has 3-5 pre-written response templates
- Randomly select template based on agent
- Insert dynamic values: tokens, latency, confidence

### Error Handling Pattern

**Frontend Custom Errors**:
```typescript
// lib/errors.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public errors: ZodError) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

**Error Display**:
- Network errors: "Unable to connect to server. Please try again."
- Validation errors: "Invalid message format. Please try again."
- Server errors (500): "An error occurred. Our team has been notified."
- Timeout: "Request timed out. Please try again."

### Optimistic UI Update Flow

```typescript
async function sendMessage(content: string) {
  // 1. Optimistic update: add user message immediately
  const userMessage = { role: 'user', content, id: uuid() };
  setMessages(prev => [...prev, userMessage]);

  // 2. Set processing state
  setIsProcessing(true);

  try {
    // 3. Call backend API
    const response = await chatAPI.sendMessage(content, sessionId);

    // 4. Add AI response
    const aiMessage = {
      role: 'assistant',
      content: response.message,
      agent: response.agent,
      confidence: response.confidence,
      id: uuid()
    };
    setMessages(prev => [...prev, aiMessage]);

    // 5. Update session ID if new
    if (!sessionId) setSessionId(response.session_id);

  } catch (error) {
    // 6. Remove optimistic message on error
    setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    setError(error);
  } finally {
    setIsProcessing(false);
  }
}
```

---

## Dependencies & Prerequisites

### Prerequisites from Epic 1
- ✅ Design token system available
- ✅ TypeScript enums defined
- ✅ Zod schemas created
- ✅ Python enums created
- ✅ shadcn/ui components installed (Button, Input, ScrollArea)
- ✅ Three-panel layout available

### New Dependencies to Install
```bash
# Frontend
bun add uuid
bun add -d @types/uuid

# Backend (Python)
# All dependencies should already be in requirements.txt
```

### Docker Networking Verification
Before starting development:
```bash
# Verify backend is accessible from frontend container
docker exec orchestratai-frontend-1 curl http://backend:8000/api/health
```

---

## Acceptance Criteria

### Functional Requirements

1. **Message Sending**:
   - User types "Hello" and clicks Send
   - User message appears instantly with right alignment and blue styling
   - Typing indicator appears: "Orchestrator is typing..."
   - After 1-2 seconds, AI response appears with left alignment

2. **Agent Attribution**:
   - Message "What are your pricing tiers?" routes to Billing Agent
   - AI response shows green "Billing Agent" badge
   - Confidence score displays: "95% confident"

3. **Error Handling**:
   - Simulate backend down (stop Docker container)
   - User sends message
   - Error toast appears: "Unable to connect to server"
   - User message is removed (no orphaned messages)

4. **State Persistence**:
   - User sends 3 messages
   - User collapses left panel (from Epic 1)
   - Message history remains visible and scrollable

### Non-Functional Requirements

- **Performance**:
  - Message send latency <100ms (optimistic update)
  - Backend response <3 seconds (mock delay)
  - Smooth scrolling at 60fps

- **Accessibility**:
  - Input area has aria-label "Message input"
  - Send button has aria-label "Send message"
  - Keyboard navigation: Tab to input → Tab to send → Enter to submit

- **Responsiveness**:
  - Message bubbles max-width 70% on desktop
  - Input area full-width on mobile
  - No horizontal scroll on any device

---

## Technical Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Docker network DNS resolution fails | High | Low | Document troubleshooting steps; use IP fallback |
| Zod schema mismatch FE/BE | Medium | Medium | Add integration test validating response shape |
| Message list performance with 100+ messages | Medium | Low | Implement virtualization (Phase 5) |
| Optimistic update race conditions | Medium | Low | Use message ID for matching; implement queue |

---

## Integration Testing Requirements

### End-to-End Test Scenarios

**Test 1: Happy Path**
```typescript
it('should send message and receive response', async () => {
  // User opens chat page
  // User types "Hello"
  // User clicks send
  // Assert: User message visible
  // Assert: Typing indicator visible
  // Wait for response
  // Assert: AI message visible with agent badge
  // Assert: Typing indicator hidden
});
```

**Test 2: Error Recovery**
```typescript
it('should handle network errors gracefully', async () => {
  // Mock API to throw NetworkError
  // User sends message
  // Assert: Error toast visible
  // Assert: User message removed
  // Assert: Retry button available
});
```

---

## Story Breakdown Guidance for Scrum Master

This epic should be broken into **6-8 user stories**:

1. **Backend Foundation** (2 stories):
   - Story 1: Create Pydantic models and mock data service
   - Story 2: Implement /api/chat endpoint with routing logic

2. **Frontend API Layer** (1-2 stories):
   - Story 3: Build API client with error handling
   - Story 4: Create chat API functions and Zod validation

3. **Chat UI** (3-4 stories):
   - Story 5: Build message components (bubble, list, typing indicator)
   - Story 6: Create input area with send functionality
   - Story 7: Implement chat provider and state management
   - Story 8: Add optimistic UI updates and error handling

**Story Sizing**:
- Backend stories: 5 points each
- API layer: 3-5 points each
- UI stories: 5-8 points each

**Recommended Sequence**:
1. Backend first (enables testing during FE development)
2. API client (establishes integration contract)
3. Message display (visible progress)
4. Input area (completes interaction loop)
5. State management + optimistic UI (polish)

---

## Definition of Done

- [ ] All code merged to main branch
- [ ] Backend endpoint documented in Swagger (/docs)
- [ ] Integration tests passing (FE → BE flow)
- [ ] Manual testing: 10 messages sent/received successfully
- [ ] Error scenarios tested (network down, timeout, validation failure)
- [ ] Code review completed
- [ ] Docker containers rebuild without errors
- [ ] No console errors in browser
- [ ] Mobile tested (messages readable on 375px width)
- [ ] Accessibility: keyboard navigation works
- [ ] Session ID persists in localStorage across page refresh

---

## Related Documentation

- **PRD**: `/docs/prd/orchestratai_prd_v2.md` - Sections 7, 10 (Phase 2), 13 (Integration)
- **Epic 1**: `/docs/stories/epic-1-foundation-design-system.md`
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Context**: https://react.dev/reference/react/createContext

---

## Notes for Story Manager

**Key Considerations**:
1. **Server Components vs Client Components**:
   - Chat interface MUST be Client Component (`'use client'`) for interactivity
   - Use Server Components for initial page load only

2. **Mock Data Realism**:
   - Responses should be 2-3 sentences long (realistic chat length)
   - Include variety: some responses short, some detailed
   - Simulate realistic latency (800ms - 2000ms random)

3. **Type Safety Validation**:
   - Every API response MUST pass Zod validation
   - If validation fails, treat as error (don't display corrupted data)

4. **Critical Path Dependencies**:
   - Backend endpoint must be complete before FE integration testing
   - Mock data service must return all required fields (agent, confidence, etc.)
   - Enum values must match exactly (validated by Epic 1 script)

5. **Testing Strategy**:
   - Use Postman/Thunder Client to test backend independently
   - Mock API client in unit tests for chat provider
   - Integration test with real Docker network

**Handoff to Agent Panel (Epic 3)**:
The chat response includes agent metadata that Epic 3 will use to update the Agent Panel. Ensure this structure is preserved:
```json
{
  "agent": "BILLING",
  "metadata": {
    "tokens_used": 450,
    "latency_ms": 1200,
    "cost_usd": 0.0023
  }
}
```

This epic establishes the core interaction model that all future features build upon.
