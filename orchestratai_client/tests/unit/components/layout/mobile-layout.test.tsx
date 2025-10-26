import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileLayout } from '@/components/layout/mobile-layout';

describe('MobileLayout', () => {
  const mockChatPanel = <div>Chat Panel Content</div>;
  const mockAgentsPanel = <div>Agents Panel Content</div>;
  const mockLogsPanel = <div>Logs Panel Content</div>;

  let originalHash: string;

  beforeEach(() => {
    // Save original hash and reset before each test
    if (typeof window !== 'undefined') {
      originalHash = window.location.hash;
      window.location.hash = '';
    }
  });

  afterEach(() => {
    // Restore original hash
    if (typeof window !== 'undefined') {
      window.location.hash = originalHash;
    }
  });

  it('renders three tabs with correct labels', () => {
    render(
      <MobileLayout
        chatPanel={mockChatPanel}
        agentsPanel={mockAgentsPanel}
        logsPanel={mockLogsPanel}
      />
    );

    expect(screen.getByRole('tab', { name: /chat/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /agents/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /logs/i })).toBeInTheDocument();
  });

  it('displays chat tab by default', () => {
    render(
      <MobileLayout
        chatPanel={mockChatPanel}
        agentsPanel={mockAgentsPanel}
        logsPanel={mockLogsPanel}
      />
    );

    // Chat tab content should be visible
    expect(screen.getByText('Chat Panel Content')).toBeVisible();

    // Other tab contents should not be in the DOM (Radix removes inactive content)
    expect(screen.queryByText('Agents Panel Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Logs Panel Content')).not.toBeInTheDocument();
  });

  it('switches to agents tab when clicked', async () => {
    const user = userEvent.setup();

    render(
      <MobileLayout
        chatPanel={mockChatPanel}
        agentsPanel={mockAgentsPanel}
        logsPanel={mockLogsPanel}
      />
    );

    const agentsTab = screen.getByRole('tab', { name: /agents/i });
    await user.click(agentsTab);

    // Agents tab content should now be visible
    expect(screen.getByText('Agents Panel Content')).toBeVisible();

    // Other tab contents should not be in the DOM (Radix removes inactive content)
    expect(screen.queryByText('Chat Panel Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Logs Panel Content')).not.toBeInTheDocument();
  });

  it('updates URL hash when tab changes', async () => {
    const user = userEvent.setup();

    render(
      <MobileLayout
        chatPanel={mockChatPanel}
        agentsPanel={mockAgentsPanel}
        logsPanel={mockLogsPanel}
      />
    );

    const logsTab = screen.getByRole('tab', { name: /logs/i });
    await user.click(logsTab);

    expect(window.location.hash).toBe('#logs');
  });
});
