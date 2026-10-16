package com.syncboard.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.syncboard.dto.TaskBroadcastEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Configuration
public class RedisPubSubConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    @Bean
    public MessageListenerAdapter listenerAdapter(SimpMessagingTemplate messagingTemplate, ObjectMapper objectMapper) {
        return new MessageListenerAdapter(new Object() {
            public void handleMessage(String message) {
                try {
                    TaskBroadcastEvent event = objectMapper.readValue(message, TaskBroadcastEvent.class);
                    messagingTemplate.convertAndSend("/topic/tasks", event);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }, "handleMessage");
    }

    @Bean
    public RedisMessageListenerContainer container(RedisConnectionFactory connectionFactory,
                                                   MessageListenerAdapter listenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(listenerAdapter, new PatternTopic("task-events"));
        return container;
    }
}