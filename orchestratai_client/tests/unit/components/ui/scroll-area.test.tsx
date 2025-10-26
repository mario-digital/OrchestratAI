import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollArea } from '@/components/ui/scroll-area';

describe('ScrollArea', () => {
  it('renders children', () => {
    render(
      <ScrollArea>
        <div>Scrollable Content</div>
      </ScrollArea>
    );
    expect(screen.getByText('Scrollable Content')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    const { container } = render(
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>
    );
    expect(container.querySelector('[data-slot="scroll-area"]')).toBeInTheDocument();
  });

  it('has viewport with data-slot attribute', () => {
    const { container } = render(
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>
    );
    expect(container.querySelector('[data-slot="scroll-area-viewport"]')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <ScrollArea className="custom-scroll">
        <div>Content</div>
      </ScrollArea>
    );
    expect(container.querySelector('.custom-scroll')).toBeInTheDocument();
  });
});
