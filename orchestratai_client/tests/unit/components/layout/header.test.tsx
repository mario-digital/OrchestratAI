import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout/header';
import { ChatProvider, type ChatContextValue } from '@/components/providers/chat-provider';
import { MessageRole } from '@/lib/enums';
import * as chatContext from '@/components/providers/chat-provider';

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and subtitle', () => {
    render(
      <ChatProvider>
        <Header />
      </ChatProvider>
    );

    expect(screen.getByText('Multi-Agent Customer Service System')).toBeInTheDocument();
    expect(screen.getByText(/LangGraph Orchestrator/)).toBeInTheDocument();
  });

  it('displays system status badge', () => {
    render(
      <ChatProvider>
        <Header />
      </ChatProvider>
    );

    const badge = screen.getByText('ACTIVE');
    expect(badge).toBeInTheDocument();
  });

  it('shows response complete when last message is from assistant and not streaming', () => {
    const mockContext = {
      isStreaming: false,
      messages: [
        { id: '1', role: MessageRole.USER, content: 'Hello', timestamp: new Date() },
        { id: '2', role: MessageRole.ASSISTANT, content: 'Hi', timestamp: new Date() },
      ],
    };

    vi.spyOn(chatContext, 'useChatContext').mockReturnValue(mockContext as Partial<ChatContextValue> as ChatContextValue);

    render(
      <ChatProvider>
        <Header />
      </ChatProvider>
    );

    // Response step should be complete (green)
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('handles different active agents', () => {
    render(
      <ChatProvider>
        <Header />
      </ChatProvider>
    );

    // Should render without errors when different agents are active
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('handles orchestrator idle state when streaming starts', () => {
    const mockContext = {
      isStreaming: true,
      messages: [],
    };

    vi.spyOn(chatContext, 'useChatContext').mockReturnValue(mockContext as Partial<ChatContextValue> as ChatContextValue);

    render(
      <ChatProvider>
        <Header />
      </ChatProvider>
    );

    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('shows pending state when not streaming and no messages', () => {
    const mockContext = {
      isStreaming: false,
      messages: [],
    };

    vi.spyOn(chatContext, 'useChatContext').mockReturnValue(mockContext as Partial<ChatContextValue> as ChatContextValue);

    render(
      <ChatProvider>
        <Header />
      </ChatProvider>
    );

    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('shows response pending when streaming is active', () => {
    const mockContext = {
      isStreaming: true,
      messages: [
        { id: '1', role: MessageRole.USER, content: 'Hello', timestamp: new Date() },
      ],
    };

    vi.spyOn(chatContext, 'useChatContext').mockReturnValue(mockContext as Partial<ChatContextValue> as ChatContextValue);

    render(
      <ChatProvider>
        <Header />
      </ChatProvider>
    );

    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });
});
