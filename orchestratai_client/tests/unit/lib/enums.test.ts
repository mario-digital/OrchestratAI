import { describe, it, expect } from 'vitest';
import {
  AgentStatus,
  AgentId,
  MessageRole,
  LogType,
  LogStatus,
  RetrievalStrategy,
  AgentColor,
} from '@/lib/enums';

describe('Enums', () => {
  describe('AgentStatus', () => {
    it('has correct values', () => {
      expect(AgentStatus.IDLE).toBe('idle');
      expect(AgentStatus.ROUTING).toBe('routing');
      expect(AgentStatus.ACTIVE).toBe('active');
    });

    it('has all expected keys', () => {
      const keys = Object.keys(AgentStatus);
      expect(keys).toContain('IDLE');
      expect(keys).toContain('ROUTING');
      expect(keys).toContain('ACTIVE');
    });
  });

  describe('AgentId', () => {
    it('has correct values', () => {
      expect(AgentId.ORCHESTRATOR).toBe('orchestrator');
      expect(AgentId.BILLING).toBe('billing');
      expect(AgentId.TECHNICAL).toBe('technical');
      expect(AgentId.POLICY).toBe('policy');
    });

    it('has all expected keys', () => {
      const keys = Object.keys(AgentId);
      expect(keys).toContain('ORCHESTRATOR');
      expect(keys).toContain('BILLING');
      expect(keys).toContain('TECHNICAL');
      expect(keys).toContain('POLICY');
    });
  });

  describe('MessageRole', () => {
    it('has correct values', () => {
      expect(MessageRole.USER).toBe('user');
      expect(MessageRole.ASSISTANT).toBe('assistant');
    });

    it('has all expected keys', () => {
      const keys = Object.keys(MessageRole);
      expect(keys).toContain('USER');
      expect(keys).toContain('ASSISTANT');
    });
  });

  describe('LogType', () => {
    it('has correct values', () => {
      expect(LogType.ROUTING).toBe('routing');
      expect(LogType.VECTOR_SEARCH).toBe('vector_search');
      expect(LogType.CACHE).toBe('cache');
      expect(LogType.DOCUMENTS).toBe('documents');
    });

    it('has all expected keys', () => {
      const keys = Object.keys(LogType);
      expect(keys).toContain('ROUTING');
      expect(keys).toContain('VECTOR_SEARCH');
      expect(keys).toContain('CACHE');
      expect(keys).toContain('DOCUMENTS');
    });
  });

  describe('LogStatus', () => {
    it('has correct values', () => {
      expect(LogStatus.SUCCESS).toBe('success');
      expect(LogStatus.WARNING).toBe('warning');
      expect(LogStatus.ERROR).toBe('error');
    });

    it('has all expected keys', () => {
      const keys = Object.keys(LogStatus);
      expect(keys).toContain('SUCCESS');
      expect(keys).toContain('WARNING');
      expect(keys).toContain('ERROR');
    });
  });

  describe('RetrievalStrategy', () => {
    it('has correct values', () => {
      expect(RetrievalStrategy.PURE_RAG).toBe('Pure RAG');
      expect(RetrievalStrategy.PURE_CAG).toBe('Pure CAG');
      expect(RetrievalStrategy.HYBRID_RAG_CAG).toBe('Hybrid RAG/CAG');
    });

    it('has all expected keys', () => {
      const keys = Object.keys(RetrievalStrategy);
      expect(keys).toContain('PURE_RAG');
      expect(keys).toContain('PURE_CAG');
      expect(keys).toContain('HYBRID_RAG_CAG');
    });
  });

  describe('AgentColor', () => {
    it('has correct values', () => {
      expect(AgentColor.CYAN).toBe('cyan');
      expect(AgentColor.GREEN).toBe('green');
      expect(AgentColor.BLUE).toBe('blue');
      expect(AgentColor.PURPLE).toBe('purple');
    });

    it('has all expected keys', () => {
      const keys = Object.keys(AgentColor);
      expect(keys).toContain('CYAN');
      expect(keys).toContain('GREEN');
      expect(keys).toContain('BLUE');
      expect(keys).toContain('PURPLE');
    });
  });
});
