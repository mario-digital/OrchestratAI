import { describe, it, expect } from 'vitest';
import {
  ChatRequestSchema,
  ChatMetricsSchema,
  DocumentChunkSchema,
  RetrievalLogSchema,
  MessageSchema,
  AgentSchema,
  ChatResponseSchema,
} from '@/lib/schemas';

describe('Schemas', () => {
  describe('ChatRequestSchema', () => {
    it('validates a valid chat request', () => {
      const valid = {
        message: 'Hello, how can I help?',
        session_id: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(() => ChatRequestSchema.parse(valid)).not.toThrow();
    });

    it('rejects empty message', () => {
      const invalid = {
        message: '',
        session_id: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(() => ChatRequestSchema.parse(invalid)).toThrow('Message cannot be empty');
    });

    it('rejects message over 2000 characters', () => {
      const invalid = {
        message: 'a'.repeat(2001),
        session_id: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(() => ChatRequestSchema.parse(invalid)).toThrow('Message cannot exceed 2000 characters');
    });

    it('rejects invalid UUID', () => {
      const invalid = {
        message: 'test',
        session_id: 'not-a-uuid',
      };
      expect(() => ChatRequestSchema.parse(invalid)).toThrow('Session ID must be a valid UUID v4');
    });
  });

  describe('ChatMetricsSchema', () => {
    it('validates valid metrics', () => {
      const valid = {
        tokensUsed: 100,
        cost: 0.01,
        latency: 250,
      };
      expect(() => ChatMetricsSchema.parse(valid)).not.toThrow();
    });

    it('rejects negative tokens', () => {
      const invalid = {
        tokensUsed: -10,
        cost: 0.01,
        latency: 250,
      };
      expect(() => ChatMetricsSchema.parse(invalid)).toThrow('Tokens used cannot be negative');
    });

    it('rejects negative cost', () => {
      const invalid = {
        tokensUsed: 100,
        cost: -0.01,
        latency: 250,
      };
      expect(() => ChatMetricsSchema.parse(invalid)).toThrow('Cost cannot be negative');
    });

    it('rejects negative latency', () => {
      const invalid = {
        tokensUsed: 100,
        cost: 0.01,
        latency: -250,
      };
      expect(() => ChatMetricsSchema.parse(invalid)).toThrow('Latency cannot be negative');
    });
  });

  describe('DocumentChunkSchema', () => {
    it('validates valid document chunk', () => {
      const valid = {
        id: 1,
        content: 'Document content here',
        similarity: 0.95,
        source: '/docs/file.pdf',
      };
      expect(() => DocumentChunkSchema.parse(valid)).not.toThrow();
    });

    it('rejects similarity below 0', () => {
      const invalid = {
        id: 1,
        content: 'Document content here',
        similarity: -0.1,
        source: '/docs/file.pdf',
      };
      expect(() => DocumentChunkSchema.parse(invalid)).toThrow('Similarity must be between 0 and 1');
    });

    it('rejects similarity above 1', () => {
      const invalid = {
        id: 1,
        content: 'Document content here',
        similarity: 1.5,
        source: '/docs/file.pdf',
      };
      expect(() => DocumentChunkSchema.parse(invalid)).toThrow('Similarity must be between 0 and 1');
    });

    it('accepts optional metadata', () => {
      const valid = {
        id: 1,
        content: 'Document content here',
        similarity: 0.95,
        source: '/docs/file.pdf',
        metadata: { author: 'John Doe', year: '2024' },
      };
      expect(() => DocumentChunkSchema.parse(valid)).not.toThrow();
    });
  });

  describe('RetrievalLogSchema', () => {
    it('validates valid retrieval log', () => {
      const valid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'routing',
        title: 'Query routed to billing agent',
        data: { agent: 'billing', confidence: 0.95 },
        status: 'success',
        timestamp: '2024-01-01T00:00:00Z',
      };
      expect(() => RetrievalLogSchema.parse(valid)).not.toThrow();
    });

    it('rejects invalid log type enum', () => {
      const invalid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'invalid_type',
        title: 'Test',
        data: {},
        status: 'success',
        timestamp: '2024-01-01T00:00:00Z',
      };
      expect(() => RetrievalLogSchema.parse(invalid)).toThrow();
    });
  });

  describe('MessageSchema', () => {
    it('validates valid user message', () => {
      const valid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(() => MessageSchema.parse(valid)).not.toThrow();
    });

    it('validates valid assistant message', () => {
      const valid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        role: 'assistant',
        content: 'Hi there!',
        agent: 'billing',
        confidence: 0.95,
        timestamp: new Date(),
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(() => MessageSchema.parse(valid)).not.toThrow();
    });
  });

  describe('AgentSchema', () => {
    it('validates valid agent', () => {
      const valid = {
        id: 'orchestrator',
        name: 'Orchestrator',
        status: 'active',
        model: 'gpt-4',
        strategy: 'Pure RAG',
        color: 'cyan',
        tokensUsed: 100,
        cost: 0.01,
        latency: 250,
        cacheStatus: 'hit',
      };
      expect(() => AgentSchema.parse(valid)).not.toThrow();
    });
  });

  describe('ChatResponseSchema', () => {
    it('validates valid chat response', () => {
      const valid = {
        message: 'Response message',
        agent: 'billing',
        confidence: 0.95,
        logs: [],
        metrics: {
          tokensUsed: 100,
          cost: 0.01,
          latency: 250,
        },
      };
      expect(() => ChatResponseSchema.parse(valid)).not.toThrow();
    });
  });
});
