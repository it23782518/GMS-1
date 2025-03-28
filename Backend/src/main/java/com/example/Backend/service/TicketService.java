package com.example.Backend.service;

import com.example.Backend.dto.TicketDTO;
import com.example.Backend.dto.TicketResponse;
import com.example.Backend.model.*;
import com.example.Backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private TicketRaisedByRepository ticketRaisedByRepository;

    @Autowired
    private TicketAssignedToRepository ticketAssignedToRepository;

    @Transactional
    public Ticket createTicket(TicketDTO ticketDTO) {
        if (ticketDTO.getUserId() != null && ticketDTO.getStaffId() != null) {
            throw new RuntimeException("Ticket can be raised by either a user or staff, not both");
        }
        if (ticketDTO.getUserId() == null && ticketDTO.getStaffId() == null) {
            throw new RuntimeException("Ticket must be raised by either a user or staff");
        }

        Ticket ticket = new Ticket();
        ticket.setType(ticketDTO.getType());
        ticket.setDescription(ticketDTO.getDescription());
        ticket.setStatus(Ticket.TicketStatus.OPEN);
        ticket.setPriority(ticketDTO.getPriority() != null ? ticketDTO.getPriority() : Ticket.TicketPriority.MEDIUM);
        ticket = ticketRepository.saveAndFlush(ticket);

        TicketRaisedBy raisedBy = new TicketRaisedBy();
        raisedBy.setTicketId(ticket.getId());
        raisedBy.setTicket(ticket);

        if (ticketDTO.getUserId() != null) {
            User user = userRepository.findById(ticketDTO.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
            raisedBy.setUser(user);
        } else if (ticketDTO.getStaffId() != null) {
            Staff staff = staffRepository.findById(ticketDTO.getStaffId()).orElseThrow(() -> new RuntimeException("Staff not found"));
            raisedBy.setStaff(staff);
        }

        ticketRaisedByRepository.saveAndFlush(raisedBy);
        return ticket;
    }

    @Transactional
    public Ticket assignTicket(Long ticketId, Long staffId) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));

        Staff staff = staffRepository.findById(staffId).orElseThrow(() -> new RuntimeException("Staff not found"));

        TicketAssignedTo assignedTo = ticketAssignedToRepository.findById(ticketId).orElse(new TicketAssignedTo());

        assignedTo.setTicketId(ticketId);
        assignedTo.setTicket(ticket);
        assignedTo.setStaff(staff);
        ticketAssignedToRepository.saveAndFlush(assignedTo);

        ticket.setStatus(Ticket.TicketStatus.IN_PROGRESS);
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.saveAndFlush(ticket);
    }

    @Transactional
    public Ticket updateTicketStatus(Long ticketId, Ticket.TicketStatus status) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.saveAndFlush(ticket);
    }

    public List<Ticket> getAllTicketsWithDetails() {
        return ticketRepository.findAll();
    }

    public TicketResponse getTicketDetails(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setType(ticket.getType());
        response.setDescription(ticket.getDescription());
        response.setStatus(ticket.getStatus());
        response.setPriority(ticket.getPriority());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());

        Optional<TicketRaisedBy> raisedByOpt = ticketRaisedByRepository.findById(ticketId);
        raisedByOpt.ifPresent(raisedBy -> {
            if (raisedBy.getUser() != null) {
                response.setRaisedById(raisedBy.getUser().getId());
                response.setRaisedByName(raisedBy.getUser().getName());
                response.setRaisedByType("USER");
            } else if (raisedBy.getStaff() != null) {
                response.setRaisedById(raisedBy.getStaff().getId());
                response.setRaisedByName(raisedBy.getStaff().getName());
                response.setRaisedByType("STAFF");
            }
        });

        Optional<TicketAssignedTo> assignedToOpt = ticketAssignedToRepository.findById(ticketId);
        assignedToOpt.ifPresent(assignedTo -> {
            response.setAssignedToId(assignedTo.getStaff().getId());
            response.setAssignedToName(assignedTo.getStaff().getName());
        });

        return response;
    }

    public List<TicketResponse> getTickets(Long ticketId) {
        if (ticketId != null) {
            TicketResponse ticket = getTicketDetails(ticketId);
            return List.of(ticket);
        }
        return ticketRepository.findAll().stream()
                .map(ticket -> getTicketDetails(ticket.getId()))
                .collect(Collectors.toList());
    }

    public List<TicketRaisedBy> getTicketsRaisedByUser(Long userId) {
        return ticketRaisedByRepository.findByUserId(userId);
    }

    public List<TicketRaisedBy> getTicketsRaisedByStaff(Long staffId) {
        return ticketRaisedByRepository.findByStaffId(staffId);
    }

    public List<TicketAssignedTo> getTicketsAssignedToStaff(Long staffId) {
        return ticketAssignedToRepository.findByStaffId(staffId);
    }

    public List<Ticket> filterTicketsByStatus(Ticket.TicketStatus status) {
        if (status == null) {
            return ticketRepository.findAll();
        }
        return ticketRepository.findByStatus(status);
    }

    public List<Ticket> filterTicketsByPriority(Ticket.TicketPriority priority) {
        if (priority == null) {
            return ticketRepository.findAll();
        }
        return ticketRepository.findByPriority(priority);
    }
}