import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout/header';
import { ChatProvider } from '@/components/providers/chat-provider';

describe('Header', () => {
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
});
