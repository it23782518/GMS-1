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

// Status badge component for consistent styling
const StatusBadge = ({ status }) => {
  const styles = {
    OPEN: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
      icon: (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 0h4m-4 0H8m4 0v4" />
        </svg>
      ),
    },
    IN_PROGRESS: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      icon: (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357-2H15" />
        </svg>
      ),
    },
    RESOLVED: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-200",
      icon: (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    CLOSED: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      icon: (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    }
  };

  const style = styles[status] || styles.OPEN;

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border flex items-center ${style.bg} ${style.text} ${style.border}`}>
      {style.icon}
      {status.replace(/_/g, " ")}
    </span>
  );
};

const TicketList = ({ tickets: initialTickets, onUpdate }) => {
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('ticketId'); // 'ticketId' or 'staffId'

  // Status filter options
  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' }
  ];

  // Priority filter options
  const priorityOptions = [
    { value: 'ALL', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' }
  ];

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
        setTickets(Array.isArray(response.data) ? response.data : [response.data]);
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

  const handleAssignTicket = async (ticketId, staffId) => {
    if (!staffId) return;
    try {
      setLoading(true);
      await assignTicket(ticketId, staffId);
      onUpdate();
    } catch (error) {
      console.error('Error assigning ticket:', error);
    } finally {
      setLoading(false);
    }
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
    
    try {
      setLoading(true);
      await updateTicketStatus(ticketId, status);
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the ticket ID consistently
  const getTicketId = (ticket) => ticket.id || ticket.ticketId;

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
          <div className="bg-gray-50 p-4 border-b border-gray-200 overflow-x-auto">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Status</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center shadow-sm ${
                  statusFilter === 'ALL' 
                    ? 'bg-rose-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
                </svg>
                All ({statusCounts.ALL})
              </button>
              
              <button 
                onClick={() => setStatusFilter('OPEN')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center shadow-sm ${
                  statusFilter === 'OPEN' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 0h4m-4 0H8m4 0v4"></path>
                </svg>
                Open ({statusCounts.OPEN})
              </button>
              
              <button 
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center shadow-sm ${
                  statusFilter === 'IN_PROGRESS' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357-2H15"></path>
                </svg>
                In Progress ({statusCounts.IN_PROGRESS})
              </button>
              
              <button 
                onClick={() => setStatusFilter('RESOLVED')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center shadow-sm ${
                  statusFilter === 'RESOLVED' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Resolved ({statusCounts.RESOLVED})
              </button>
              
              <button 
                onClick={() => setStatusFilter('CLOSED')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center shadow-sm ${
                  statusFilter === 'CLOSED' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Closed ({statusCounts.CLOSED})
              </button>
            </div>
          </div>

          {/* Priority Filter Buttons */}
          <div className="bg-gray-50 p-4 border-b border-gray-200 overflow-x-auto">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Priority</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setPriorityFilter('ALL')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center shadow-sm ${
                  priorityFilter === 'ALL' 
                    ? 'bg-rose-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
                </svg>
                All Priorities ({priorityCounts.ALL})
              </button>
              
              <button 
                onClick={() => setPriorityFilter('LOW')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center shadow-sm ${
                  priorityFilter === 'LOW' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                </svg>
                Low ({priorityCounts.LOW})
              </button>
              
              <button 
                onClick={() => setPriorityFilter('MEDIUM')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center shadow-sm ${
                  priorityFilter === 'MEDIUM' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                Medium ({priorityCounts.MEDIUM})
              </button>
              
              <button 
                onClick={() => setPriorityFilter('HIGH')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center shadow-sm ${
                  priorityFilter === 'HIGH' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                High ({priorityCounts.HIGH})
              </button>
            </div>
          </div>

          {/* Enhanced Search UI */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col gap-4">
              <div className="flex space-x-2 mb-1">
                <button
                  onClick={() => setSearchBy('ticketId')}
                  className={`px-3 py-1 text-xs rounded-md ${
                    searchBy === 'ticketId'
                      ? 'bg-rose-100 text-rose-700 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                    </svg>
                    Search by Ticket ID
                  </span>
                </button>
                <button
                  onClick={() => setSearchBy('staffId')}
                  className={`px-3 py-1 text-xs rounded-md ${
                    searchBy === 'staffId'
                      ? 'bg-rose-100 text-rose-700 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Search by Staff ID
                  </span>
                </button>
              </div>
              <div className="flex w-full">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-rose-500 focus:border-rose-500"
                    placeholder={searchBy === 'ticketId' ? "Enter ticket ID..." : "Enter staff ID..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <button
                  className={`px-6 py-3 text-white font-medium rounded-r-lg shadow-md transform transition-all duration-200 min-w-[100px] flex-shrink-0 ${
                    loading
                      ? "bg-rose-400 cursor-not-allowed"
                      : "bg-rose-600 hover:bg-rose-700 focus:ring-4 focus:ring-rose-300"
                  }`}
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                      Search
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={resetAll}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 text-sm font-medium flex items-center"
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357-2H15"></path>
                </svg>
                Reset All Filters
              </button>
            </div>
          </div>

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

          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block overflow-x-auto rounded-lg mb-0">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs text-white uppercase bg-gradient-to-r from-rose-700 to-rose-600 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets && tickets.length > 0 ? (
                  tickets.map((ticket, index) => (
                    <React.Fragment key={getTicketId(ticket) || Math.random()}>
                      <tr className={`border-b hover:bg-rose-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 font-medium text-gray-900">{getTicketId(ticket)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {ticket.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="px-6 py-4">{formatDate(ticket.createdAt)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setExpandedTicket(expandedTicket === getTicketId(ticket) ? null : getTicketId(ticket))}
                            className="px-4 py-2 bg-rose-600 text-white rounded-lg shadow hover:bg-rose-700 focus:ring-4 focus:ring-rose-300 transition-all duration-200 text-xs flex items-center justify-center"
                          >
                            {expandedTicket === getTicketId(ticket) ? (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                                Hide Details
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                View Details
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                      {expandedTicket === getTicketId(ticket) && (
                        <tr>
                          <td colSpan="5" className="px-0 py-0 border-b">
                            <div className="bg-gray-50 p-6 shadow-inner border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">Ticket Information</h4>
                                  <div className="space-y-2">
                                    <p className="flex justify-between">
                                      <span className="text-sm font-medium text-gray-500">ID:</span>
                                      <span className="text-sm text-gray-900">{getTicketId(ticket)}</span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span className="text-sm font-medium text-gray-500">Priority:</span>
                                      <span className="text-sm text-gray-900">{ticket.priority}</span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span className="text-sm font-medium text-gray-500">Created:</span>
                                      <span className="text-sm text-gray-900">{formatDate(ticket.createdAt)}</span>
                                    </p>
                                    {ticket.updatedAt && (
                                      <p className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-500">Updated:</span>
                                        <span className="text-sm text-gray-900">{formatDate(ticket.updatedAt)}</span>
                                      </p>
                                    )}
                                  </div>
                                  <div className="mt-4 pt-3 border-t border-gray-100">
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Description:</h5>
                                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md">{ticket.description}</p>
                                  </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">User & Assignment</h4>
                                  <div className="space-y-2">
                                    <p className="flex justify-between">
                                      <span className="text-sm font-medium text-gray-500">Assigned To:</span>
                                      <span className="text-sm text-gray-900">{getAssignedToInfo(ticket)}</span>
                                    </p>
                                  </div>

                                  <div className="mt-4 pt-3 border-t border-gray-100">
                                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Update Ticket:</h5>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Assign Ticket</label>
                                        <div className="flex">
                                          <input
                                            type="text"
                                            placeholder="Staff ID"
                                            id={`staff-${getTicketId(ticket)}`}
                                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5"
                                          />
                                          <button
                                            onClick={() => handleAssignTicket(
                                              getTicketId(ticket), 
                                              document.getElementById(`staff-${getTicketId(ticket)}`).value
                                            )}
                                            className="bg-green-600 text-white rounded-r-lg px-3 py-2 hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-colors"
                                            disabled={loading}
                                          >
                                            {loading ? (
                                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                              </svg>
                                            ) : (
                                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                              </svg>
                                            )}
                                          </button>
                                        </div>
                                      </div>

                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Update Status</label>
                                        <div className="flex">
                                          <select
                                            onChange={(e) => handleStatusChange(getTicketId(ticket), e.target.value)}
                                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5"
                                            value={selectedStatuses[getTicketId(ticket)] || ""}
                                          >
                                            <option value="" disabled>Select Status</option>
                                            <option value="OPEN">Open</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="RESOLVED">Resolved</option>
                                            <option value="CLOSED">Closed</option>
                                          </select>
                                          <button
                                            onClick={() => handleUpdateStatus(getTicketId(ticket))}
                                            className="bg-blue-600 text-white rounded-r-lg px-3 py-2 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors"
                                            disabled={!selectedStatuses[getTicketId(ticket)] || loading}
                                          >
                                            {loading ? (
                                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                              </svg>
                                            ) : (
                                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357-2H15"></path>
                                              </svg>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-5 rounded-full mb-4">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets found</h3>
                        <p className="text-gray-500 mb-4">There are currently no support tickets matching your filters.</p>
                        {(statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                          <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Visible only on mobile */}
          <div className="md:hidden p-4">
            {tickets && tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={getTicketId(ticket) || Math.random()} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-medium text-gray-500">ID: {getTicketId(ticket)}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ticket.type}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(ticket.createdAt)}</span>
                    </div>

                    <p className="text-sm text-gray-800 mb-3 pb-3 border-b border-gray-100">
                      {ticket.description 
                        ? `${ticket.description.substring(0, 100)}${ticket.description.length > 100 ? '...' : ''}`
                        : 'No description provided'}
                    </p>

                    <div className="mb-3">
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Assigned to:</p>
                      <p className="text-sm font-medium">{getAssignedToInfo(ticket)}</p>
                    </div>

                    <button
                      onClick={() => setExpandedTicket(expandedTicket === getTicketId(ticket) ? null : getTicketId(ticket))}
                      className="w-full px-4 py-2 bg-rose-600 text-white rounded-lg shadow hover:bg-rose-700 focus:ring-4 focus:ring-rose-300 transition-all duration-200 text-sm flex items-center justify-center"
                    >
                      {expandedTicket === getTicketId(ticket) ? (
                        <>
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                          </svg>
                          Hide Actions
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                          Show Actions
                        </>
                      )}
                    </button>

                    {expandedTicket === getTicketId(ticket) && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="block text-xs font-medium text-gray-700 mb-2">Assign Ticket</label>
                          <div className="flex">
                            <input
                              type="text"
                              placeholder="Staff ID"
                              id={`mobile-staff-${getTicketId(ticket)}`}
                              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5"
                            />
                            <button
                              onClick={() => handleAssignTicket(
                                getTicketId(ticket), 
                                document.getElementById(`mobile-staff-${getTicketId(ticket)}`).value
                              )}
                              className="bg-green-600 text-white rounded-r-lg px-3 py-2 hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-colors"
                              disabled={loading}
                            >
                              {loading ? 'Loading...' : 'Assign'}
                            </button>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="block text-xs font-medium text-gray-700 mb-2">Update Status</label>
                          <div className="flex">
                            <select
                              onChange={(e) => handleStatusChange(getTicketId(ticket), e.target.value)}
                              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5"
                              value={selectedStatuses[getTicketId(ticket)] || ""}
                            >
                              <option value="" disabled>Select Status</option>
                              <option value="OPEN">Open</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="RESOLVED">Resolved</option>
                              <option value="CLOSED">Closed</option>
                            </select>
                            <button
                              onClick={() => handleUpdateStatus(getTicketId(ticket))}
                              className="bg-blue-600 text-white rounded-r-lg px-3 py-2 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors"
                              disabled={!selectedStatuses[getTicketId(ticket)] || loading}
                            >
                              {loading ? 'Loading...' : 'Update'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-gray-100 p-5 rounded-full mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets found</h3>
                <p className="text-gray-500 mb-4 text-center">There are currently no support tickets in the system.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for raised by information based on the DTO structure
function getRaisedByInfo(ticket) {
  const name = ticket.raisedByName || 'Unknown';
  const id = ticket.raisedById || 'N/A';
  const type = ticket.raisedByType || 'N/A';
  
  return `${name} (${type} ID: ${id})`;
}

// Helper function for assigned to information based on the DTO structure
function getAssignedToInfo(ticket) {
  if (!ticket.assignedToId && !ticket.assignedToName) {
    return 'Not assigned';
  }
  
  const name = ticket.assignedToName || 'Unknown';
  const id = ticket.assignedToId || 'N/A';
  
  return `${name} (Staff ID: ${id})`;
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (e) {
    return dateString;
  }
}

export default TicketList;