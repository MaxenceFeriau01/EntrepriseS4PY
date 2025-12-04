package com.s4p.entreprise.dto;

import com.s4p.entreprise.model.Message;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private Long id;
    private Long senderId;
    private String senderName;
    private Long recipientId;
    private String recipientName;
    private String subject;
    private String content;
    private Boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    
    public static MessageDTO fromMessage(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getFirstName() + " " + message.getSender().getLastName());
        dto.setRecipientId(message.getRecipient().getId());
        dto.setRecipientName(message.getRecipient().getFirstName() + " " + message.getRecipient().getLastName());
        dto.setSubject(message.getSubject());
        dto.setContent(message.getContent());
        dto.setRead(message.getRead());
        dto.setReadAt(message.getReadAt());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }
}