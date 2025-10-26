// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CollapsiblePanel } from '@/components/panels/collapsible-panel';

describe('CollapsiblePanel', () => {
  it('collapses panel when trigger clicked', async () => {
    render(
      <CollapsiblePanel side="left">
        <div>Test Content</div>
      </CollapsiblePanel>
    );

    const trigger = screen.getByRole('button');
    const content = screen.getByText('Test Content');

    // Initially open
    expect(content).toBeVisible();

    // Click to collapse
    fireEvent.click(trigger);

    // Wait for animation
    await waitFor(() => {
      expect(content).not.toBeVisible();
    });
  });

  it('expands panel when trigger clicked while collapsed', async () => {
    render(
      <CollapsiblePanel side="left" defaultOpen={false}>
        <div>Test Content</div>
      </CollapsiblePanel>
    );

    const trigger = screen.getByRole('button');

    // Initially collapsed - content doesn't exist in DOM
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(trigger);

    // Wait for animation
    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  it('shows correct icon based on side and state', () => {
    const { rerender } = render(
      <CollapsiblePanel side="left">
        <div>Content</div>
      </CollapsiblePanel>
    );

    // Left panel open: shows ChevronLeft and "Collapse" text
    expect(screen.getByRole('button')).toHaveTextContent('Collapse');

    // Rerender as right panel
    rerender(
      <CollapsiblePanel side="right">
        <div>Content</div>
      </CollapsiblePanel>
    );

    // Right panel open: shows ChevronRight and "Collapse" text
    expect(screen.getByRole('button')).toHaveTextContent('Collapse');
  });

  it('left and right panels collapse independently', async () => {
    render(
      <div>
        <CollapsiblePanel side="left">
          <div>Left Content</div>
        </CollapsiblePanel>
        <CollapsiblePanel side="right">
          <div>Right Content</div>
        </CollapsiblePanel>
      </div>
    );

    const buttons = screen.getAllByRole('button');
    const leftTrigger = buttons[0]!;
    const rightTrigger = buttons[1]!;

    // Initially both open
    expect(screen.getByText('Left Content')).toBeInTheDocument();
    expect(screen.getByText('Right Content')).toBeInTheDocument();

    // Collapse left panel only
    fireEvent.click(leftTrigger);
    await waitFor(() => {
      expect(screen.queryByText('Left Content')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Right Content')).toBeInTheDocument();

    // Collapse right panel
    fireEvent.click(rightTrigger);
    await waitFor(() => {
      expect(screen.queryByText('Right Content')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('Left Content')).not.toBeInTheDocument();

    // Expand left panel
    fireEvent.click(leftTrigger);
    await waitFor(() => {
      expect(screen.getByText('Left Content')).toBeInTheDocument();
    });
    expect(screen.queryByText('Right Content')).not.toBeInTheDocument();
  });
});
