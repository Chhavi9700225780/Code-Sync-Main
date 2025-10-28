interface ChatMessage {
    id: string
    message: string
    username: string
    timestamp: string
    // --- ADD THIS ---
  // Store a snapshot of the message being replied to
  replyingTo?: { // <-- Add this whole block
        id: string;
        username: string;
        message: string;
    };
  // --- END ADD ---
}

interface ChatContext {
    messages: ChatMessage[]
    setMessages: (
        messages: ChatMessage[] | ((messages: ChatMessage[]) => ChatMessage[]),
    ) => void
    isNewMessage: boolean
    setIsNewMessage: (isNewMessage: boolean) => void
    lastScrollHeight: number
    setLastScrollHeight: (lastScrollHeight: number) => void
    // --- ADD THESE TWO LINES ---
    replyingTo: ChatMessage | null;
    setReplyingTo: React.Dispatch<React.SetStateAction<ChatMessage | null>>;
}

export { ChatContext, ChatMessage }
