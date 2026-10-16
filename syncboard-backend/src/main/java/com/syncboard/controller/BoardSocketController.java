// src/main/java/com/syncboard/controller/BoardSocketController.java
package com.syncboard.controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class BoardSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BoardEventPayload {
        private String type;       // "CARD_MOVED", "CARD_CREATED", "USER_JOINED", "USER_TYPING"
        private String cardId;
        private String sourceColumn;
        private String destColumn;
        private Integer newIndex;
        private Object cardData;
        private String sender;
    }

    @MessageMapping("/boards/{boardId}/action")
    public void handleBoardAction(
            @DestinationVariable Long boardId,
            @Payload BoardEventPayload payload,
            Principal principal
    ) {
        if (principal != null) {
            payload.setSender(principal.getName());
        }
        // Broadcast to all active users viewing this board
        messagingTemplate.convertAndSend("/topic/boards/" + boardId, payload);
    }
}