package com.example.Backend.controller;

import com.example.Backend.dto.TicketDTO;
import com.example.Backend.dto.TicketResponse;
import com.example.Backend.model.Ticket;
import com.example.Backend.model.TicketRaisedBy;
import com.example.Backend.model.TicketAssignedTo;
import com.example.Backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody TicketDTO ticketDTO) {
        try {
            if (ticketDTO.getType() == null || ticketDTO.getDescription() == null) {
                return ResponseEntity.badRequest().body("Type and description are required");
            }
            Ticket createdTicket = ticketService.createTicket(ticketDTO);
            return ResponseEntity.ok(createdTicket);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{ticketId}/assign")
    public ResponseEntity<?> assignTicket(@PathVariable Long ticketId, @RequestBody TicketDTO ticketDTO) {
        try {
            if (ticketDTO.getStaffId() == null) {
                return ResponseEntity.badRequest().body("Staff ID is required for assignment");
            }
            Ticket assignedTicket = ticketService.assignTicket(ticketId, ticketDTO.getStaffId());
            return ResponseEntity.ok(assignedTicket);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{ticketId}/status")
    public ResponseEntity<?> updateTicketStatus(@PathVariable Long ticketId, @RequestBody TicketDTO ticketDTO) {
        try {
            if (ticketDTO.getStatus() == null) {
                return ResponseEntity.badRequest().body("Status is required");
            }
            Ticket updatedTicket = ticketService.updateTicketStatus(ticketId, ticketDTO.getStatus());
            return ResponseEntity.ok(updatedTicket);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTicketsWithDetails() {
        return ResponseEntity.ok(ticketService.getAllTicketsWithDetails());
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<?> getTicketDetails(@PathVariable Long ticketId) {
        try {
            TicketResponse ticketDetails = ticketService.getTicketDetails(ticketId);
            return ResponseEntity.ok(ticketDetails);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<TicketResponse>> getTickets(@RequestParam(required = false) Long ticketId) {
        return ResponseEntity.ok(ticketService.getTickets(ticketId));
    }

    @GetMapping("/raised-by/user/{userId}")
    public ResponseEntity<List<TicketRaisedBy>> getTicketsRaisedByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ticketService.getTicketsRaisedByUser(userId));
    }

    @GetMapping("/raised-by/staff/{staffId}")
    public ResponseEntity<List<TicketRaisedBy>> getTicketsRaisedByStaff(@PathVariable Long staffId) {
        return ResponseEntity.ok(ticketService.getTicketsRaisedByStaff(staffId));
    }

    @GetMapping("/assigned-to/staff/{staffId}")
    public ResponseEntity<List<TicketAssignedTo>> getTicketsAssignedToStaff(@PathVariable Long staffId) {
        return ResponseEntity.ok(ticketService.getTicketsAssignedToStaff(staffId));
    }

    @GetMapping("/filter-by-status")
    public ResponseEntity<List<Ticket>> filterTicketsByStatus(@RequestParam(required = false) Ticket.TicketStatus status) {
        return ResponseEntity.ok(ticketService.filterTicketsByStatus(status));
    }

    @GetMapping("/filter-by-priority")
    public ResponseEntity<List<Ticket>> filterTicketsByPriority(
            @RequestParam(required = false) Ticket.TicketPriority priority) {
        return ResponseEntity.ok(ticketService.filterTicketsByPriority(priority));
    }
}