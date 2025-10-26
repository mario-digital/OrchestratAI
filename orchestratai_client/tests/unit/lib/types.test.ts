import { describe, it, expect } from 'vitest';
import * as types from '@/lib/types';
import {
  AgentStatus,
  AgentId,
  MessageRole,
  LogType,
  LogStatus,
  RetrievalStrategy,
  AgentColor,
} from '@/lib/types';

describe('Types Module', () => {
  it('exports all enum re-exports', () => {
    // Verify runtime exports exist
    expect(types.AgentStatus).toBeDefined();
    expect(types.AgentId).toBeDefined();
    expect(types.MessageRole).toBeDefined();
    expect(types.LogType).toBeDefined();
    expect(types.LogStatus).toBeDefined();
    expect(types.RetrievalStrategy).toBeDefined();
    expect(types.AgentColor).toBeDefined();
  });

  it('AgentStatus enum has correct values', () => {
    expect(AgentStatus.IDLE).toBe('idle');
    expect(AgentStatus.ROUTING).toBe('routing');
    expect(AgentStatus.ACTIVE).toBe('active');
  });

  it('AgentId enum has correct values', () => {
    expect(AgentId.ORCHESTRATOR).toBe('orchestrator');
    expect(AgentId.BILLING).toBe('billing');
    expect(AgentId.TECHNICAL).toBe('technical');
    expect(AgentId.POLICY).toBe('policy');
  });

  it('MessageRole enum has correct values', () => {
    expect(MessageRole.USER).toBe('user');
    expect(MessageRole.ASSISTANT).toBe('assistant');
  });

  it('LogType enum has correct values', () => {
    expect(LogType.ROUTING).toBe('routing');
    expect(LogType.VECTOR_SEARCH).toBe('vector_search');
    expect(LogType.CACHE).toBe('cache');
    expect(LogType.DOCUMENTS).toBe('documents');
  });

  it('LogStatus enum has correct values', () => {
    expect(LogStatus.SUCCESS).toBe('success');
    expect(LogStatus.WARNING).toBe('warning');
    expect(LogStatus.ERROR).toBe('error');
  });

  it('RetrievalStrategy enum has correct values', () => {
    expect(RetrievalStrategy.PURE_RAG).toBe('Pure RAG');
    expect(RetrievalStrategy.PURE_CAG).toBe('Pure CAG');
    expect(RetrievalStrategy.HYBRID_RAG_CAG).toBe('Hybrid RAG/CAG');
  });

  it('AgentColor enum has correct values', () => {
    expect(AgentColor.CYAN).toBe('cyan');
    expect(AgentColor.GREEN).toBe('green');
    expect(AgentColor.BLUE).toBe('blue');
    expect(AgentColor.PURPLE).toBe('purple');
  });

  describe('Type Inference', () => {
    it('ChatRequest type can be used with proper structure', () => {
      const request: types.ChatRequest = {
        message: 'test message',
        session_id: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(request.message).toBe('test message');
      expect(request.session_id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('ChatResponse type can be used with proper structure', () => {
      const response: types.ChatResponse = {
        message: 'response message',
        agent: AgentId.BILLING,
        confidence: 0.95,
        logs: [],
        metrics: {
          tokensUsed: 100,
          cost: 0.01,
          latency: 250,
        },
      };
      expect(response.message).toBe('response message');
      expect(response.agent).toBe(AgentId.BILLING);
    });

    it('Agent type can be used with proper structure', () => {
      const agent: types.Agent = {
        id: AgentId.ORCHESTRATOR,
        name: 'Orchestrator',
        status: AgentStatus.ACTIVE,
        model: 'gpt-4',
        color: AgentColor.CYAN,
        tokensUsed: 100,
        cost: 0.01,
      };
      expect(agent.id).toBe(AgentId.ORCHESTRATOR);
      expect(agent.name).toBe('Orchestrator');
    });

    it('Message type can be used with proper structure', () => {
      const message: types.Message = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        role: MessageRole.USER,
        content: 'test message',
        timestamp: new Date(),
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(message.role).toBe(MessageRole.USER);
      expect(message.content).toBe('test message');
    });

    it('RetrievalLog type can be used with proper structure', () => {
      const log: types.RetrievalLog = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: LogType.ROUTING,
        title: 'Query routed',
        data: {},
        status: LogStatus.SUCCESS,
        timestamp: '2024-01-01T00:00:00Z',
      };
      expect(log.type).toBe(LogType.ROUTING);
      expect(log.status).toBe(LogStatus.SUCCESS);
    });

    it('ChatMetrics type can be used with proper structure', () => {
      const metrics: types.ChatMetrics = {
        tokensUsed: 100,
        cost: 0.01,
        latency: 250,
      };
      expect(metrics.tokensUsed).toBe(100);
      expect(metrics.cost).toBe(0.01);
    });

    it('DocumentChunk type can be used with proper structure', () => {
      const chunk: types.DocumentChunk = {
        id: 1,
        content: 'document content',
        similarity: 0.95,
        source: '/docs/file.pdf',
      };
      expect(chunk.content).toBe('document content');
      expect(chunk.similarity).toBe(0.95);
    });
  });
});
