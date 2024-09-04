"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { MinimizeIcon, SendIcon, XIcon } from "lucide-react"
import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { Label } from "../ui/label"

const SOCKET_URL = 'http://localhost:3002';

type Message = {
    content: string;
    username?: string;
    userId?: string;
};

export default function Chat() {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [isUsernameSet, setIsUsernameSet] = useState<boolean>(false);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL);

    socketInstance.on('connect', () => {
      setUserId(socketInstance.id as any); // Armazena o ID do usuário atual
    });

    socketInstance.on('message', (msg: Message) => {
      if (msg.content.trim()) {
        setMessages((prevMessages) => [...prevMessages, msg]);
      }
    });

    socketInstance.on('user-join', (data: Message) => {
      if (data.content?.trim()) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (socket && message.trim() !== '') {
      socket.emit('New message', { content: message, username });
      setMessage(''); // Limpa o campo de mensagem após o envio
    }
  };

  const handleSetUsername = () => {
    if (username.trim() !== '') {
      setIsUsernameSet(true);
    }
  };

  if (!isUsernameSet) {
    return (
      <div className="max-w-sm  mx-auto mt-4 shadow-md w-[300px] h-fit flex flex-col gap-4 p-4 justify-between">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          placeholder="Enter your name"
          className="w-full"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Please enter your full name as it appears on your chat.
        </p>
        <Button onClick={handleSetUsername}>
          Enter Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] w-full max-w-[600px] rounded-2xl bg-background shadow-lg mx-auto mt-4">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium">Grupo dos Feras</div>
            {/* <div className="text-sm text-muted-foreground">Online</div> */}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50">
            <MinimizeIcon className="w-5 h-5" />
            <span className="sr-only">Minimize</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50">
            <XIcon className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-4 ${msg.userId === userId ? 'justify-end' : ''}`}
          >
            {msg.userId !== userId && (
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder-user.jpg" alt="Agent Avatar" />
                <AvatarFallback>{msg.username?.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`${
                msg.userId === userId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              } rounded-2xl p-4 max-w-[70%]`}
            >
              <div className="text-sm">
                { msg.userId === userId ? 'You' :  msg.username}
              </div>
              <div className="text-sm">{msg.content}</div>
            </div>
            {msg.userId === userId && (
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
                <AvatarFallback>{username.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>
      <div className="border-t px-6 py-4 flex items-center gap-2">
        <Input
          id="message"
          placeholder="Type your message..."
          className="flex-1"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          autoComplete="off"
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <Button type="submit" size="icon" onClick={handleSendMessage}>
          <SendIcon className="w-5 h-5" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}
