import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout/header';

describe('Header', () => {
  it('renders title and subtitle', () => {
    render(<Header />);

    expect(screen.getByText('OrchestratAI')).toBeInTheDocument();
    expect(screen.getByText(/LangGraph Orchestrator/)).toBeInTheDocument();
  });

  it('displays system status badge', () => {
    render(<Header />);

    const badge = screen.getByText('ACTIVE');
    expect(badge).toBeInTheDocument();
  });
});
