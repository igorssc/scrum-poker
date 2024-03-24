'use client';
import { Children, useEffect, useState } from 'react';
import { useWebsocket } from '../hooks/useWebsocket';

export default function Home() {
  const { socket } = useWebsocket();

  const [currentMessage, setCurrentMessage] = useState('');

  const [messages, setMessages] = useState<{ message: string }[]>([]);

  useEffect(() => {
    socket.on('msgReceived', (msg: string) => {
      setMessages((prev) => [...prev, { message: msg }]);
    });
  }, [socket]);

  const handleSendEvent = () => {
    setCurrentMessage('');
    socket.emit('msg', currentMessage);
  };

  return (
    <>
      <ul>{Children.toArray(messages.map((msg) => <li>{msg.message}</li>))}</ul>
      <input
        style={{ border: '1px solid black', background: '#eee' }}
        type="text"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
      />
      <button onClick={handleSendEvent}>enviar</button>
    </>
  );
}
