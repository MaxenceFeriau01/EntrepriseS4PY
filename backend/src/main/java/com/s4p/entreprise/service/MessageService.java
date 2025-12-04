package com.s4p.entreprise.service;

import com.s4p.entreprise.dto.MessageDTO;
import com.s4p.entreprise.model.Message;
import com.s4p.entreprise.model.User;
import com.s4p.entreprise.repository.MessageRepository;
import com.s4p.entreprise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    public List<MessageDTO> getReceivedMessages(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return messageRepository.findByRecipientOrderByCreatedAtDesc(user).stream()
                .map(MessageDTO::fromMessage)
                .collect(Collectors.toList());
    }

    public List<MessageDTO> getSentMessages(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return messageRepository.findBySenderOrderByCreatedAtDesc(user).stream()
                .map(MessageDTO::fromMessage)
                .collect(Collectors.toList());
    }

    public List<MessageDTO> getUnreadMessages(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return messageRepository.findByRecipientAndReadFalse(user).stream()
                .map(MessageDTO::fromMessage)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return messageRepository.countByRecipientAndReadFalse(user);
    }

    public MessageDTO getMessageById(Long id) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        return MessageDTO.fromMessage(message);
    }

    @Transactional
    public MessageDTO sendMessage(Long senderId, MessageDTO messageDTO) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User recipient = userRepository.findById(messageDTO.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setSubject(messageDTO.getSubject());
        message.setContent(messageDTO.getContent());
        message.setRead(false);

        message = messageRepository.save(message);
        return MessageDTO.fromMessage(message);
    }

    @Transactional
    public MessageDTO markAsRead(Long id) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        message.markAsRead();
        message = messageRepository.save(message);
        return MessageDTO.fromMessage(message);
    }

    @Transactional
    public void deleteMessage(Long id) {
        messageRepository.deleteById(id);
    }
}