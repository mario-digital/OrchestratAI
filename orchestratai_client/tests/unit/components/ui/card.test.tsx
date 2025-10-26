import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card with content', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      const { container } = render(<Card className="custom-card">Content</Card>);
      expect(container.querySelector('.custom-card')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    it('renders header with content', () => {
      render(<CardHeader>Header Content</CardHeader>);
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      const { container } = render(<CardHeader>Content</CardHeader>);
      expect(container.querySelector('[data-slot="card-header"]')).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('renders title with content', () => {
      render(<CardTitle>Title Content</CardTitle>);
      expect(screen.getByText('Title Content')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      const { container} = render(<CardTitle>Title</CardTitle>);
      expect(container.querySelector('[data-slot="card-title"]')).toBeInTheDocument();
    });
  });

  describe('CardDescription', () => {
    it('renders description with content', () => {
      render(<CardDescription>Description Content</CardDescription>);
      expect(screen.getByText('Description Content')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      const { container } = render(<CardDescription>Description</CardDescription>);
      expect(container.querySelector('[data-slot="card-description"]')).toBeInTheDocument();
    });
  });

  describe('CardContent', () => {
    it('renders content', () => {
      render(<CardContent>Body Content</CardContent>);
      expect(screen.getByText('Body Content')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      const { container } = render(<CardContent>Content</CardContent>);
      expect(container.querySelector('[data-slot="card-content"]')).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    it('renders footer content', () => {
      render(<CardFooter>Footer Content</CardFooter>);
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      expect(container.querySelector('[data-slot="card-footer"]')).toBeInTheDocument();
    });
  });

  it('renders complete card with all components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Body</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Card Body')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });
});
