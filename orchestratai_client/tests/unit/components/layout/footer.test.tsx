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
    expect(screen.getByText(/ChromaDB:/)).toBeInTheDocument();
  });

  it('displays actual metric values when provided', () => {
    render(<Footer latency={1500} tokens={250} cost={0.0025} />);

    expect(screen.getByText(/1,500ms/)).toBeInTheDocument();
    expect(screen.getByText(/250/)).toBeInTheDocument();
    expect(screen.getByText(/\$0\.0025/)).toBeInTheDocument();
  });

  it('shows connected status in green', () => {
    const { container } = render(<Footer dbStatus="connected" />);

    expect(screen.getByText(/Connected/)).toBeInTheDocument();
    const statusDiv = container.querySelector('.text-green-500');
    expect(statusDiv).toBeInTheDocument();
  });

  it('shows disconnected status in red', () => {
    const { container } = render(<Footer dbStatus="disconnected" />);

    expect(screen.getByText(/Disconnected/)).toBeInTheDocument();
    const statusDiv = container.querySelector('.text-red-500');
    expect(statusDiv).toBeInTheDocument();
  });

  it('shows checking status in yellow', () => {
    const { container } = render(<Footer dbStatus="checking" />);

    expect(screen.getByText(/Checking/)).toBeInTheDocument();
    const statusDiv = container.querySelector('.text-yellow-500');
    expect(statusDiv).toBeInTheDocument();
  });
});
