"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal, Loader2 } from "lucide-react";

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

const MAX_MESSAGE_LENGTH = 2000;
const CHAR_WARNING_THRESHOLD = 1800;
const MAX_ROWS = 5;

export function InputArea({
  onSendMessage,
  isProcessing,
  disabled = false,
}: InputAreaProps): React.JSX.Element {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmedMessage = message.trim();
  const isOverLimit = message.length > MAX_MESSAGE_LENGTH;
  const showCharCount = message.length >= CHAR_WARNING_THRESHOLD;
  const canSend =
    trimmedMessage.length > 0 && !isProcessing && !disabled && !isOverLimit;

  // Auto-resize textarea up to MAX_ROWS
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to recalculate
    textarea.style.height = "auto";

    // Calculate the height for max rows
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const maxHeight = lineHeight * MAX_ROWS;

    // Set height to scrollHeight or maxHeight, whichever is smaller
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [message]);

  const handleSend = (): void => {
    if (!canSend) return;

    onSendMessage(trimmedMessage);
    setMessage("");

    // Refocus textarea after send
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 p-4 border-t border-input-border">
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="bg-input-bg border-input-border focus-visible:border-input-border-focus text-input-text placeholder:text-input-placeholder resize-none min-h-10 overflow-y-auto"
          disabled={disabled || isProcessing}
        />
        {showCharCount && (
          <div className="absolute bottom-2 right-2 text-xs pointer-events-none">
            <span
              className={
                isOverLimit ? "text-input-text-error" : "text-text-secondary"
              }
            >
              {message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        )}
      </div>
      <Button
        onClick={handleSend}
        disabled={!canSend}
        aria-label={isProcessing ? "Sending message..." : "Send message"}
        className="bg-button-primary-bg hover:bg-button-primary-hover text-button-primary-text disabled:opacity-50 h-auto px-4"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SendHorizonal className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
