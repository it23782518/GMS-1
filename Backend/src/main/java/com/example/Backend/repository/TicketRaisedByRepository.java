package com.example.Backend.repository;

import com.example.Backend.model.TicketRaisedBy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRaisedByRepository extends JpaRepository<TicketRaisedBy, Long> {
    List<TicketRaisedBy> findByUserId(Long userId);

    List<TicketRaisedBy> findByStaffId(Long staffId);
}
