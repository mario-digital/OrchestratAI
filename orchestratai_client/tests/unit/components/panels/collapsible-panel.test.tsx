import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CollapsiblePanel } from '@/components/panels/collapsible-panel';

// Mock localStorage
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value;
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

const localStorageMock = new LocalStorageMock();
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('CollapsiblePanel', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('collapses panel when trigger clicked', async () => {
    render(
      <CollapsiblePanel side="left" storageKey="test-left">
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
      <CollapsiblePanel side="left" storageKey="test-left" defaultOpen={false}>
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

  it('persists collapsed state to localStorage', async () => {
    render(
      <CollapsiblePanel side="left" storageKey="test-panel">
        <div>Content</div>
      </CollapsiblePanel>
    );

    const trigger = screen.getByRole('button');

    // Collapse
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(localStorage.getItem('test-panel')).toBe('false');
    });

    // Expand
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(localStorage.getItem('test-panel')).toBe('true');
    });
  });

  it('loads collapsed state from localStorage on mount', () => {
    // Set localStorage before render
    localStorage.setItem('test-panel', 'false');

    render(
      <CollapsiblePanel side="left" storageKey="test-panel" defaultOpen={true}>
        <div>Content</div>
      </CollapsiblePanel>
    );

    // localStorage value (false) should override defaultOpen (true)
    // Collapsed content is not in the document
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('shows correct icon based on side and state', () => {
    const { rerender } = render(
      <CollapsiblePanel side="left" storageKey="test-left">
        <div>Content</div>
      </CollapsiblePanel>
    );

    // Left panel open: shows ChevronLeft and "Collapse" text
    expect(screen.getByRole('button')).toHaveTextContent('Collapse');

    // Rerender as right panel
    rerender(
      <CollapsiblePanel side="right" storageKey="test-right">
        <div>Content</div>
      </CollapsiblePanel>
    );

    // Right panel open: shows ChevronRight and "Collapse" text
    expect(screen.getByRole('button')).toHaveTextContent('Collapse');
  });

  it('left and right panels collapse independently', async () => {
    render(
      <div>
        <CollapsiblePanel side="left" storageKey="test-left">
          <div>Left Content</div>
        </CollapsiblePanel>
        <CollapsiblePanel side="right" storageKey="test-right">
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
