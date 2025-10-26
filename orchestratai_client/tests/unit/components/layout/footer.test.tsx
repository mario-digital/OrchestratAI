import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/footer';

describe('Footer', () => {
  it('renders all 4 metrics with icons', () => {
    render(<Footer />);

    expect(screen.getByText(/Latency:/)).toBeInTheDocument();
    expect(screen.getByText(/Tokens:/)).toBeInTheDocument();
    expect(screen.getByText(/Cost:/)).toBeInTheDocument();
    expect(screen.getByText(/ChromaDB:/)).toBeInTheDocument();
  });

  it('displays placeholder values', () => {
    render(<Footer />);

    expect(screen.getByText(/--ms/)).toBeInTheDocument();
    expect(screen.getByText(/Tokens: --/)).toBeInTheDocument();
    expect(screen.getByText(/\$--/)).toBeInTheDocument();
    expect(screen.getByText(/Connected/)).toBeInTheDocument();
  });
});
