import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import { useQueryClient } from '@tanstack/react-query';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

export function useTaskSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe('/topic/tasks', (message) => {
        if (!message.body) return;
        const event = JSON.parse(message.body);

        queryClient.setQueryData(['tasks'], (prevTasks = []) => {
          if (event.action === 'CREATED') {
            const exists = prevTasks.some((t) => t.id === event.task.id);
            return exists ? prevTasks : [...prevTasks, event.task];
          }
          if (event.action === 'UPDATED') {
            return prevTasks.map((task) =>
              task.id === event.task.id ? event.task : task
            );
          }
          if (event.action === 'DELETED') {
            return prevTasks.filter((task) => task.id !== event.task.id);
          }
          return prevTasks;
        });
      });
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [queryClient]);
}