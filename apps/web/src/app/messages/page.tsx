'use client';

import { MessageSquare, Search, Send } from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
}

// Placeholder chats — will be replaced by real API once backend messages endpoint is built
const DEMO_CHATS: Chat[] = [
  {
    id: '1',
    name: 'Carlos M.',
    avatar: 'CM',
    lastMessage: 'Is the property still available for next week?',
    time: '2m ago',
    unread: 2,
    messages: [
      { id: '1', sender: 'them', text: 'Hi! Is the property still available for next week?', time: '10:42 AM' },
      { id: '2', sender: 'me', text: 'Yes it is! Which dates are you looking at?', time: '10:45 AM' },
      { id: '3', sender: 'them', text: 'From the 15th to the 20th.', time: '10:46 AM' },
    ],
  },
  {
    id: '2',
    name: 'Ana R.',
    avatar: 'AR',
    lastMessage: 'Thanks for the quick response!',
    time: '1h ago',
    unread: 0,
    messages: [
      { id: '1', sender: 'them', text: 'Hello, I have a question about check-in time.', time: '9:00 AM' },
      { id: '2', sender: 'me', text: 'Check-in is from 3 PM. Does that work for you?', time: '9:05 AM' },
      { id: '3', sender: 'them', text: 'Thanks for the quick response!', time: '9:06 AM' },
    ],
  },
];

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(DEMO_CHATS[0]);
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState<Chat[]>(DEMO_CHATS);

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!newMessage.trim() || !selectedChat) return;
    const msg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id
          ? { ...c, messages: [...c.messages, msg], lastMessage: msg.text, time: 'Just now' }
          : c
      )
    );
    setSelectedChat((prev) =>
      prev ? { ...prev, messages: [...prev.messages, msg], lastMessage: msg.text } : prev
    );
    setNewMessage('');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-80 shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-lg mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats"
              className="w-full bg-background border border-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <MessageSquare className="h-8 w-8 opacity-40" />
              <span className="text-sm">No chats found</span>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => setSelectedChat(chat)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left ${
                  selectedChat?.id === chat.id ? 'bg-accent' : ''
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                  {chat.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm truncate">{chat.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">
                    {chat.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card">
              <div className="h-9 w-9 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                {selectedChat.avatar}
              </div>
              <div>
                <p className="font-semibold text-sm">{selectedChat.name}</p>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {selectedChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                      msg.sender === 'me'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-secondary text-secondary-foreground rounded-bl-sm'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-border bg-card">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
