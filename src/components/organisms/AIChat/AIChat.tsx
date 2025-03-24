import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { useAI } from '@/context/AIContext';
import { ChatMessage } from '@/types/ai';

interface AIChatProps {
  context?: {
    questionId?: string;
    topicId?: string;
  };
  placeholder?: string;
  className?: string;
}

export const AIChat: React.FC<AIChatProps> = ({
  context,
  placeholder = 'Ask a question...',
  className,
}) => {
  const { chatHistory, sendChatMessage, isSendingMessage } = useAI();
  const [message, setMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSendingMessage) return;
    
    try {
      await sendChatMessage(message, context);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  const renderTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const renderChatMessage = (chatMessage: ChatMessage) => {
    const isAssistant = chatMessage.role === 'assistant';
    
    return (
      <div
        key={chatMessage.id}
        className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div
          className={`max-w-3/4 rounded-lg px-4 py-2 ${
            isAssistant
              ? 'bg-neutral-100 text-neutral-800'
              : 'bg-primary-100 text-primary-800'
          }`}
        >
          <div className="text-sm">{chatMessage.content}</div>
          <div className="text-xs text-neutral-500 mt-1 text-right">
            {renderTimestamp(chatMessage.timestamp)}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="bg-white rounded-t-lg p-4 shadow-sm border-b">
        <h3 className="text-lg font-medium">AI Assistant</h3>
        <p className="text-sm text-neutral-500">
          Ask for help, hints, or explanations
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-neutral-50">
        {chatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-neutral-500">
              <p className="mb-2">No messages yet</p>
              <p className="text-sm">
                Start by asking a question about the current topic or exercise
              </p>
            </div>
          </div>
        ) : (
          <>
            {chatHistory.map(renderChatMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <div className="bg-white rounded-b-lg p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            type="text"
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            containerClassName="flex-1"
          />
          <Button
            type="submit"
            disabled={!message.trim() || isSendingMessage}
            loading={isSendingMessage}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;