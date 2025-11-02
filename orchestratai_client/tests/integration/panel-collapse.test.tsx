import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { ThreePanelLayout } from '@/components/layout/three-panel-layout';
import { AgentPanel } from '@/components/panels/agent-panel';
import { RetrievalPanel } from '@/components/panels/retrieval-panel';
import { ChatProvider } from '@/components/providers/chat-provider';

function renderLayout() {
  render(
    <ChatProvider>
      <ThreePanelLayout leftPanel={<AgentPanel />} rightPanel={<RetrievalPanel />}> 
        <div>Chat content</div>
      </ThreePanelLayout>
    </ChatProvider>
  );
}

describe('ThreePanelLayout collapse', () => {
  it('restores panel content after collapsing and expanding', async () => {
    renderLayout();

    const leftPanel = screen.getByLabelText('Agent Pipeline');

    await waitFor(() => {
      expect(within(leftPanel).getByText('Orchestrator')).toBeInTheDocument();
    });

    const collapseButton = within(leftPanel).getByRole('button', { name: /collapse agent pipeline/i });
    fireEvent.click(collapseButton);

    const expandButton = screen.getByRole('button', { name: /expand agent pipeline/i });
    fireEvent.click(expandButton);

    const reopenedPanel = screen.getByLabelText('Agent Pipeline');

    await waitFor(() => {
      expect(within(reopenedPanel).getByText('Orchestrator')).toBeInTheDocument();
    });
  });
});
