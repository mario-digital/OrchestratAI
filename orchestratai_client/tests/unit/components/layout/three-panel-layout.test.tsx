import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThreePanelLayout } from '@/components/layout/three-panel-layout';

describe('ThreePanelLayout', () => {
  it('renders three panels', () => {
    render(<ThreePanelLayout>Test Content</ThreePanelLayout>);

    // Assert all three panels exist
    expect(screen.getByLabelText('Agent Pipeline')).toBeInTheDocument();
    expect(screen.getByLabelText('Chat Interface')).toBeInTheDocument();
    expect(screen.getByLabelText('Retrieval Log')).toBeInTheDocument();

    // Assert children render in center panel
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('uses correct grid column widths', () => {
    const { container } = render(<ThreePanelLayout />);

    // Find grid container (nested inside wrapper div)
    const wrapperDiv = container.firstChild as HTMLElement;
    const gridContainer = wrapperDiv.firstChild as HTMLElement;

    // Assert grid class is applied
    expect(gridContainer).toHaveClass('grid-cols-three-panel-chat');
  });

  it('panels are properly labeled for accessibility', () => {
    render(<ThreePanelLayout />);

    // Assert aria-labels exist
    const leftPanel = screen.getByLabelText('Agent Pipeline');
    const centerPanel = screen.getByLabelText('Chat Interface');
    const rightPanel = screen.getByLabelText('Retrieval Log');

    expect(leftPanel).toBeInTheDocument();
    expect(centerPanel).toBeInTheDocument();
    expect(rightPanel).toBeInTheDocument();

    // Assert semantic HTML
    expect(leftPanel.tagName).toBe('ASIDE');
    expect(centerPanel.tagName).toBe('MAIN');
    expect(rightPanel.tagName).toBe('ASIDE');
  });

  it('renders placeholder text when no children provided', () => {
    render(<ThreePanelLayout />);

    expect(screen.getByText('Agent Pipeline (Epic 3)')).toBeInTheDocument();
    expect(screen.getByText('Chat Interface (Epic 2)')).toBeInTheDocument();
    expect(screen.getByText('Retrieval Log (Epic 3)')).toBeInTheDocument();
  });
});
