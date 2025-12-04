package com.s4p.entreprise.repository;

import com.s4p.entreprise.model.Message;
import com.s4p.entreprise.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findBySender(User sender);
    
    List<Message> findByRecipient(User recipient);
    
    List<Message> findByRecipientAndReadFalse(User recipient);
    
    List<Message> findByRecipientOrderByCreatedAtDesc(User recipient);
    
    List<Message> findBySenderOrderByCreatedAtDesc(User sender);
    
    long countByRecipientAndReadFalse(User recipient);
}