package com.example.Backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ticket_assigned_to")
public class TicketAssignedTo {
    @Id
    @Column(name = "ticket_id")
    private Long ticketId;

    @ManyToOne
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @OneToOne
    @MapsId
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;

    @Version
    private Long version;

    public Long getTicketId() {
        return ticketId;
    }
    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }
    public Staff getStaff() {
        return staff;
    }
    public void setStaff(Staff staff) {
        this.staff = staff;
    }
    public Ticket getTicket() {
        return ticket;
    }
    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }
    public Long getVersion() {
        return version;
    }
    public void setVersion(Long version) {
        this.version = version;
    }
}