package com.s4p.entreprise.controller;

import com.s4p.entreprise.dto.MessageDTO;
import com.s4p.entreprise.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/received/{userId}")
    public ResponseEntity<List<MessageDTO>> getReceivedMessages(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getReceivedMessages(userId));
    }

    @GetMapping("/sent/{userId}")
    public ResponseEntity<List<MessageDTO>> getSentMessages(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getSentMessages(userId));
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<MessageDTO>> getUnreadMessages(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getUnreadMessages(userId));
    }

    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        long count = messageService.getUnreadCount(userId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageDTO> getMessageById(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.getMessageById(id));
    }

    @PostMapping("/send/{senderId}")
    public ResponseEntity<MessageDTO> sendMessage(
            @PathVariable Long senderId,
            @RequestBody MessageDTO messageDTO) {
        return ResponseEntity.ok(messageService.sendMessage(senderId, messageDTO));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<MessageDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.markAsRead(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}