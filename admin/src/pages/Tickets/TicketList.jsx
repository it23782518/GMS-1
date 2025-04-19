import React, { useState, useEffect } from 'react';
import { 
  assignTicket, 
  updateTicketStatus, 
  filterTicketsByStatus, 
  filterTicketsByPriority,
  searchTicketsById,
  searchTicketsByStaffId
} from '../../services/api';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../../components/TicketList/ConfirmationModal';
import StatusChangePreview from '../../components/TicketList/StatusChangePreview';

// Import our component files
import StatusBadge from '../../components/TicketList/StatusBadge';
import FilterButtons from '../../components/TicketList/FilterButtons';
import SearchComponent from '../../components/TicketList/SearchComponent';
import TicketTable from '../../components/TicketList/TicketTable';
import MobileTicketCard from '../../components/TicketList/MobileTicketCard';

const TicketList = ({ tickets: initialTickets, onUpdate }) => {
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('ticketId'); // 'ticketId' or 'staffId'
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState(null);
  const [modalConfirmText, setModalConfirmText] = useState('Confirm');

  // Helper functions directly in the component
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const getTicketId = (ticket) => ticket.id || ticket.ticketId;

  const getRaisedByInfo = (ticket) => {
    const name = ticket.raisedByName || 'Unknown';
    const id = ticket.raisedById || 'N/A';
    const type = ticket.raisedByType || 'N/A';
    
    return `${name} (${type} ID: ${id})`;
  };

  const getAssignedToInfo = (ticket) => {
    if (!ticket.assignedToId && !ticket.assignedToName) {
      return 'Not assigned';
    }
    
    const name = ticket.assignedToName || 'Unknown';
    const id = ticket.assignedToId || 'N/A';
    
    return `${name} (Staff ID: ${id})`;
  };

  // Calculate status counts for filter badges
  const getStatusCounts = () => {
    const counts = {
      ALL: initialTickets?.length || 0,
      OPEN: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      CLOSED: 0
    };
    
    initialTickets?.forEach(ticket => {
      if (counts[ticket.status] !== undefined) {
        counts[ticket.status]++;
      }
    });
    
    return counts;
  };
  
  // Calculate priority counts for filter badges
  const getPriorityCounts = () => {
    const counts = {
      ALL: initialTickets?.length || 0,
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0
    };
    
    initialTickets?.forEach(ticket => {
      if (counts[ticket.priority] !== undefined) {
        counts[ticket.priority]++;
      }
    });
    
    return counts;
  };
  
  const statusCounts = getStatusCounts();
  const priorityCounts = getPriorityCounts();

  // Initialize tickets from props
  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [statusFilter, priorityFilter]);

  // Apply filters function
  const applyFilters = async () => {
    setLoading(true);
    try {
      let filteredTickets = [...initialTickets];
      
      // Apply status filter
      if (statusFilter !== 'ALL') {
        const response = await filterTicketsByStatus(statusFilter);
        filteredTickets = response.data;
      }
      
      // Apply priority filter on top of status filter if both are active
      if (priorityFilter !== 'ALL') {
        if (statusFilter === 'ALL') {
          const response = await filterTicketsByPriority(priorityFilter);
          filteredTickets = response.data;
        } else {
          // If already filtered by status, apply client-side filtering for priority
          filteredTickets = filteredTickets.filter(ticket => ticket.priority === priorityFilter);
        }
      }
      
      setTickets(filteredTickets);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search function
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setTickets(initialTickets);
      return;
    }

    setLoading(true);
    try {
      let response;
      if (searchBy === 'ticketId') {
        response = await searchTicketsById(searchTerm);
      } else if (searchBy === 'staffId') {
        response = await searchTicketsByStaffId(searchTerm);
      }

      if (response && response.data) {
        // Ensure each ticket has a status property
        const processedTickets = Array.isArray(response.data) ? response.data : [response.data];
        
        // Make sure each ticket has at least the required properties to prevent errors
        const validTickets = processedTickets.map(ticket => ({
          ...ticket,
          status: ticket.status || 'UNKNOWN',
          priority: ticket.priority || 'UNKNOWN',
          type: ticket.type || 'UNKNOWN',
          createdAt: ticket.createdAt || new Date().toISOString()
        }));
        
        setTickets(validTickets);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error searching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setTickets(initialTickets);
  };

  // Reset all
  const resetAll = () => {
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setSearchTerm('');
    setTickets(initialTickets);
  };

  const showConfirmationModal = (title, message, action, confirmText = 'Confirm') => {
    setModalTitle(title);
    setModalMessage(message);
    setModalAction(() => action);
    setModalConfirmText(confirmText);
    setModalOpen(true);
  };

  const handleAssignTicket = async (ticketId, staffId) => {
    if (!staffId) return;
    
    showConfirmationModal(
      'Confirm Assignment',
      `Are you sure you want to assign ticket #${ticketId} to staff member ${staffId}?`,
      async () => {
        try {
          setLoading(true);
          await assignTicket(ticketId, staffId);
          onUpdate();
        } catch (error) {
          console.error('Error assigning ticket:', error);
        } finally {
          setLoading(false);
        }
      },
      'Assign Ticket'
    );
  };

  const handleStatusChange = (ticketId, status) => {
    setSelectedStatuses(prev => ({
      ...prev,
      [ticketId]: status
    }));
  };

  const handleUpdateStatus = async (ticketId) => {
    const status = selectedStatuses[ticketId];
    if (!status) return;
    
    showConfirmationModal(
      'Confirm Status Update',
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Are you sure you want to update the status of ticket #{ticketId} to {status.replace(/_/g, " ")}?</p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <StatusChangePreview currentStatus={status} />
        </div>
      </div>,
      async () => {
        try {
          setLoading(true);
          await updateTicketStatus(ticketId, status);
          onUpdate();
        } catch (error) {
          console.error('Error updating status:', error);
        } finally {
          setLoading(false);
        }
      },
      'Update Status'
    );
  };

  return (
    <div className="bg-gray-50 py-6 rounded-lg">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-700 to-rose-500 p-6 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-white bg-opacity-30 p-2 rounded-lg mr-3 shadow-inner">
                <svg className="w-6 h-6 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">
                Tickets
              </h1>
            </div>
            <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white border-opacity-20">
              <svg className="w-5 h-5 text-red opacity-80 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
              <span className="text-red font-medium">Total: {initialTickets?.length || 0} tickets</span>
            </div>
          </div>

          {/* Status Filter Buttons */}
          <FilterButtons 
            type="status" 
            currentFilter={statusFilter} 
            setFilter={setStatusFilter} 
            counts={statusCounts} 
          />

          {/* Priority Filter Buttons */}
          <FilterButtons 
            type="priority" 
            currentFilter={priorityFilter} 
            setFilter={setPriorityFilter} 
            counts={priorityCounts} 
          />

          {/* Search Component */}
          <SearchComponent
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchBy={searchBy}
            setSearchBy={setSearchBy}
            handleSearch={handleSearch}
            resetAll={resetAll}
            loading={loading}
          />

          {/* Loading indicator */}
          {loading && (
            <div className="p-4 flex justify-center">
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading tickets...</span>
              </div>
            </div>
          )}

          {/* Desktop Table View */}
          <TicketTable
            tickets={tickets}
            expandedTicket={expandedTicket}
            setExpandedTicket={setExpandedTicket}
            handleStatusChange={handleStatusChange}
            handleUpdateStatus={handleUpdateStatus}
            handleAssignTicket={handleAssignTicket}
            selectedStatuses={selectedStatuses}
            loading={loading}
            resetFilters={resetFilters}
            formatDate={formatDate}
            getTicketId={getTicketId}
          />

          {/* Mobile Card View */}
          <MobileTicketCard
            tickets={tickets}
            expandedTicket={expandedTicket}
            setExpandedTicket={setExpandedTicket}
            handleStatusChange={handleStatusChange}
            handleUpdateStatus={handleUpdateStatus}
            handleAssignTicket={handleAssignTicket}
            selectedStatuses={selectedStatuses}
            loading={loading}
            resetFilters={resetFilters}
            formatDate={formatDate}
            getTicketId={getTicketId}
          />
        </div>
      </div>

      {/* Add ConfirmationModal component */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={modalAction}
        title={modalTitle}
        message={modalMessage}
        confirmButtonText={modalConfirmText}
      />
    </div>
  );
};

export default TicketList;