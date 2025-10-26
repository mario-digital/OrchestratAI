/**
 * Chat Component Types
 *
 * Re-exports relevant types from lib/types.ts for convenience and
 * defines component-specific interfaces.
 *
 * @module components/chat/types
 */

// Re-export core types from lib
export type { Message } from "@/lib/types";
export { MessageRole, AgentId } from "@/lib/enums";

// Component-specific types are defined in their respective component files
// See: MessageBubbleProps in message-bubble.tsx
// See: MessageListProps in message-list.tsx
// See: TypingIndicatorProps in typing-indicator.tsx
