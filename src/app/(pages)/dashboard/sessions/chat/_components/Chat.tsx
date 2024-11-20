"use client";

import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import TooltipWrapper from "@/components/global/TooltipWrapper";
import DVDBounce from "@/components/global/DVDBounce";
import { Message, Session } from "@prisma/client";
import { motion } from "framer-motion";
import { SessionStatus } from "@/types/session";
import { useMutation } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { completeSession } from "@/actions/sessions/completeSession";

const MAX_MESSAGES = 20; // Maximum number of messages allowed

export default function Chat({
  session,
}: {
  session: Session & { messages: Message[] };
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(session.messages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [status, setStatus] = useState<SessionStatus>(session.status as SessionStatus);
  const [tooltipMessage, setTooltipMessage] = useState<string>("Send message");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMessageLimitExceeded = messages.length >= MAX_MESSAGES;

  const completeSessionMutation = useMutation({
    mutationFn: async () => await completeSession(session.id),
    onSuccess: () => {
      setStatus(SessionStatus.COMPLETED);
      toast.success("Session completed successfully");
    },
    onError: () => {
      toast.error("Failed to complete session");
    },
  });

  // Update tooltip message based on conditions
  useEffect(() => {
    if (isLoading) {
      setTooltipMessage("Sending...");
    } else if (isMessageLimitExceeded) {
      setTooltipMessage(`Maximum limit of ${MAX_MESSAGES} messages reached`);
    } else if (!message.trim()) {
      setTooltipMessage("Type a message to send");
    } else {
      setTooltipMessage("Send message");
    }
  }, [isLoading, isMessageLimitExceeded, message]);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/chat?sessionId=${session.id}`);
        if (!response.ok) throw new Error("Failed to load messages");
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        toast.error("Failed to load message history");
      }
    };

    loadMessages();
  }, [session.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || isMessageLimitExceeded) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      content: message,
      role: "user",
      sessionId: session.id,
      createdAt: new Date(),
      metadata: {},
    } as Message;

    setMessages((prev) => [...prev, optimisticMessage]);
    setMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: session.id }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      // Replace optimistic message with real ones
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== tempId).concat([
          data.userMessage,
          data.assistantMessage,
        ])
      );

      // Auto-complete session if message limit is reached
      if (messages.length + 2 >= MAX_MESSAGES) {
        completeSessionMutation.mutate();
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setMessage(message);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const isCompleted = status === SessionStatus.COMPLETED;
  const isInputDisabled = isLoading || isCompleted || isMessageLimitExceeded;

  const MessageBubble = ({
    content,
    role,
  }: {
    content: string;
    role: string;
  }) => (
    <div
      className={`mb-4 flex ${
        role === "user" ? "justify-end" : "justify-start"
      } gap-3`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );

  const getStatusMessage = () => {
    if (isCompleted) {
      return "This session has been completed";
    }
    if (isMessageLimitExceeded) {
      return `Message limit (${MAX_MESSAGES}) reached`;
    }
    return `${MAX_MESSAGES - messages.length} messages remaining`;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col space-y-4 p-4">
      {!isCompleted && !isMessageLimitExceeded && (
        <TooltipWrapper content="Mark session as completed">
          <Button
          disabled={messages.length < 4 || isLoading}
            onClick={() => completeSessionMutation.mutate()}
            variant="outline"
            className="gap-2 max-w-md mx-auto bg-primary hover:bg-primary/80"
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete Session
          </Button>
        </TooltipWrapper>
      )}

      <Card className="flex flex-1 flex-col">
        <CardContent className="flex flex-1 flex-col p-4">
          <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
            {messages.length === 0 ? (
              <DVDBounce containerRef={scrollAreaRef}>
                <motion.div className="w-32 h-16 bg-primary text-white flex items-center justify-center rounded-lg shadow-lg">
                  <p className="font-bold">No Messages!</p>
                </motion.div>
              </DVDBounce>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} content={msg.content} role={msg.role} />
              ))
            )}
            {isTyping && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-bounce">●</div>
                <div className="animate-bounce delay-100">●</div>
                <div className="animate-bounce delay-200">●</div>
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-center mt-4">
            <form onSubmit={handleSubmit} className="flex space-x-2 w-full max-w-lg">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isInputDisabled ? "Chat disabled" : "Type your message..."}
                disabled={isInputDisabled}
                className="flex-1 border-4 border-rose-900"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <TooltipWrapper content={tooltipMessage}>
                <Button
                  type="submit"
                  disabled={isInputDisabled || !message.trim()}
                  className="w-10 h-10 p-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TooltipWrapper content={getStatusMessage()}>
                    <Send className="h-4 w-4" />
                    </TooltipWrapper>
                  )}
                </Button>
              </TooltipWrapper>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}