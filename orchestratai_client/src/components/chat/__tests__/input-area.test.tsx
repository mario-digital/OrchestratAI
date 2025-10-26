import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputArea } from "../input-area";

describe("InputArea", () => {
  const mockSendMessage = vi.fn();

  beforeEach(() => {
    mockSendMessage.mockClear();
  });

  it("renders textarea and send button", () => {
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={false} />);

    expect(
      screen.getByPlaceholderText("Type your message...")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Send message")).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={false} />);

    expect(screen.getByLabelText("Send message")).toBeDisabled();
  });

  it("send button is enabled when input has text", async () => {
    const user = userEvent.setup();
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={false} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    await user.type(textarea, "Hello");

    expect(screen.getByLabelText("Send message")).toBeEnabled();
  });

  it("calls onSendMessage when send button clicked", async () => {
    const user = userEvent.setup();
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={false} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    await user.type(textarea, "Hello");
    await user.click(screen.getByLabelText("Send message"));

    expect(mockSendMessage).toHaveBeenCalledWith("Hello");
    expect(mockSendMessage).toHaveBeenCalledTimes(1);
  });

  it("calls onSendMessage when Enter key pressed", async () => {
    const user = userEvent.setup();
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={false} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    await user.type(textarea, "Hello{Enter}");

    expect(mockSendMessage).toHaveBeenCalledWith("Hello");
    expect(mockSendMessage).toHaveBeenCalledTimes(1);
  });

  it("does not send when Shift+Enter pressed (adds new line)", async () => {
    const user = userEvent.setup();
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={false} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    await user.type(textarea, "Hello");
    await user.type(textarea, "{Shift>}{Enter}{/Shift}");

    expect(mockSendMessage).not.toHaveBeenCalled();
    // Verify the textarea still contains the message
    expect(textarea).toHaveValue("Hello\n");
  });

  it("clears input after successful send", async () => {
    const user = userEvent.setup();
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={false} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    await user.type(textarea, "Hello");
    await user.click(screen.getByLabelText("Send message"));

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
  });

  it("disables send button when isProcessing is true", async () => {
    const user = userEvent.setup();
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={true} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    await user.type(textarea, "Hello");

    expect(screen.getByLabelText("Sending message...")).toBeDisabled();
  });

  it("shows loading spinner when processing", () => {
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={true} />);

    // Check for the Loader2 icon (it has animate-spin class)
    const button = screen.getByLabelText("Sending message...");
    const spinner = button.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("shows character count when approaching limit (>= 1800 chars)", async () => {
    const user = userEvent.setup();
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={false} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    const longMessage = "a".repeat(1850);
    // Use paste instead of type for long strings (much faster)
    await user.click(textarea);
    await user.paste(longMessage);

    expect(screen.getByText(/1850\/2000/)).toBeInTheDocument();
  });

  it("does not show character count when below threshold", async () => {
    const user = userEvent.setup();
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={false} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    await user.type(textarea, "Hello");

    expect(screen.queryByText(/\/2000/)).not.toBeInTheDocument();
  });

  it("disables send button when message exceeds max length (2000 chars)", async () => {
    const user = userEvent.setup();
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={false} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    const tooLongMessage = "a".repeat(2100);
    // Use paste instead of type for long strings (much faster)
    await user.click(textarea);
    await user.paste(tooLongMessage);

    expect(screen.getByLabelText("Send message")).toBeDisabled();
  });

  it("shows error color for character count when over limit", async () => {
    const user = userEvent.setup();
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={false} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    const tooLongMessage = "a".repeat(2100);
    // Use paste instead of type for long strings (much faster)
    await user.click(textarea);
    await user.paste(tooLongMessage);

    const charCount = screen.getByText(/2100\/2000/);
    expect(charCount).toHaveClass("text-input-text-error");
  });

  it("trims whitespace before sending", async () => {
    const user = userEvent.setup();
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={false} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    // Use paste to avoid interleaving issues with user.type
    await user.click(textarea);
    await user.paste("  Hello  ");
    await user.click(screen.getByLabelText("Send message"));

    expect(mockSendMessage).toHaveBeenCalledWith("Hello");
  });

  it("does not send message with only whitespace", async () => {
    const user = userEvent.setup();
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={false} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    // Use paste to avoid interleaving issues
    await user.click(textarea);
    await user.paste("   ");

    expect(screen.getByLabelText("Send message")).toBeDisabled();
  });

  it("respects disabled prop", async () => {
    const user = userEvent.setup();
    render(
      <InputArea
        onSendMessage={mockSendMessage}
        isProcessing={false}
        disabled={true}
      />
    );

    const textarea = screen.getByPlaceholderText("Type your message...");
    await user.type(textarea, "Hello");

    expect(screen.getByLabelText("Send message")).toBeDisabled();
  });

  it("disables textarea when disabled prop is true", () => {
    render(
      <InputArea
        onSendMessage={mockSendMessage}
        isProcessing={false}
        disabled={true}
      />
    );

    const textarea = screen.getByPlaceholderText("Type your message...");
    expect(textarea).toBeDisabled();
  });

  it("disables textarea when processing", () => {
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={true} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    expect(textarea).toBeDisabled();
  });

  it("refocuses textarea after sending message", async () => {
    const user = userEvent.setup();
    render(<InputArea onSendMessage={mockSendMessage} isProcessing={false} />);

    const textarea = screen.getByPlaceholderText("Type your message...");
    await user.type(textarea, "Hello");
    await user.click(screen.getByLabelText("Send message"));

    await waitFor(() => {
      expect(textarea).toHaveFocus();
    });
  });
});
