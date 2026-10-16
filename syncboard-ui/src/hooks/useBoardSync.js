// src/hooks/useBoardSync.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useBoardSync(boardId, token, user, onRemoteAction) {
  const stompClient = useRef(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!boardId || !token) return;

    // Use VITE_WS_URL directly if set, or fall back to VITE_API_BASE_URL + '/ws', or localhost
    const rawUrl = import.meta.env.VITE_WS_URL ||
      (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/ws` : 'http://localhost:8080/ws');

    const socketFactory = () => new SockJS(rawUrl);

    const client = new Client({
      webSocketFactory: socketFactory,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 4000,
      onConnect: () => {
        setIsConnected(true);
        // Announce presence
        client.publish({
          destination: `/app/boards/${boardId}/action`,
          body: JSON.stringify({
            type: 'USER_JOINED',
            sender: user?.fullName || user?.email,
          })
        });

        // Listen for board modifications & peer events
        client.subscribe(`/topic/boards/${boardId}`, (message) => {
          const payload = JSON.parse(message.body);
          if (payload.type === 'USER_JOINED' && payload.sender !== (user?.fullName || user?.email)) {
            setConnectedUsers(prev => Array.from(new Set([...prev, payload.sender])));
          }
          if (onRemoteAction) {
            onRemoteAction(payload);
          }
        });
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: (frame) => console.error('STOMP Error:', frame)
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (client) client.deactivate();
    };
  }, [boardId, token, user, onRemoteAction]);

  const broadcastAction = useCallback((actionPayload) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.publish({
        destination: `/app/boards/${boardId}/action`,
        body: JSON.stringify({
          ...actionPayload,
          sender: user?.fullName || user?.email
        })
      });
    }
  }, [boardId, user]);

  return { broadcastAction, connectedUsers, isConnected };
}