import React, { useState } from 'react';
import { searchTicketsByStaffId } from '../../services/ticketApi';
import TicketTable from '../../components/TicketList/TicketTable';
import MobileTicketCard from '../../components/TicketList/MobileTicketCard';

const TicketsAssignedPage = () => {
    
  const [searchId, setSearchId] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState(null);

  const selectedStatuses = {};
  const handleStatusChange = () => {};
  const handleUpdateStatus = () => {};
  const handleAssignTicket = () => {};

  const handleSearch = async () => {
    if (!searchId) {
      setError('Please enter a Staff ID to search');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await searchTicketsByStaffId(searchId);

      const transformedData = Array.isArray(response.data) ? 
        response.data.map(item => ({
          id: item.ticketId,
          ticketId: item.ticketId,
          type: item.ticket.type,
          description: item.ticket.description,
          status: item.ticket.status,
          priority: item.ticket.priority,
          createdAt: item.ticket.createdAt,
          updatedAt: item.ticket.updatedAt,
          // Staff information
          assignedToId: searchId,
          assignedToName: item.staff?.name || 'Unknown',
          staffRole: item.staff?.role || 'N/A',
          staffPhone: item.staff?.phone || 'N/A',
          // Member information
          raisedByMember: item.member ? true : false,
          raisedByName: item.member?.name || (item.staff?.name || 'Unknown'),
          raisedById: item.member?.id || searchId,
        })) : [];

      setTickets(transformedData);
      if (transformedData.length === 0) {
        setError(`No tickets assigned to Staff ID: ${searchId}`);
      }
    } catch (err) {
      console.error('Error fetching assigned tickets:', err);
      setError(`Failed to fetch tickets. ${err.response?.data?.message || err.message || 'Please try again later.'}`);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

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

  const resetFilters = () => {
    setTickets([]);
    setSearchId('');
    setSearched(false);
    setError(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-700 to-rose-500 p-6 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-white bg-opacity-30 p-2 rounded-lg mr-3 shadow-inner">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">
                Tickets Assigned to Staff
              </h1>
            </div>
            <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white border-opacity-20">
              <svg className="w-5 h-5 text-white opacity-80 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
              <span className="text-white font-medium">Total: {tickets?.length || 0} tickets</span>
            </div>
          </div>

          {/* Search Form */}
          <div className="p-6 border-b border-gray-200">
            <div className="space-y-4">
              <div className="flex w-full">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-rose-500 focus:border-rose-500"
                    placeholder="Enter Staff ID..."
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <button
                  className={`px-6 py-3 text-white font-medium rounded-r-lg shadow-md transition-all duration-200 flex-shrink-0 ${
                    loading
                      ? "bg-rose-400 cursor-not-allowed"
                      : "bg-rose-600 hover:bg-rose-700 focus:ring-4 focus:ring-rose-300"
                  }`}
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                      Search
                    </span>
                  )}
                </button>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 text-sm font-medium flex items-center"
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357-2H15"></path>
                  </svg>
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 text-rose-600 p-4 bg-rose-50 border-l-4 border-rose-600 rounded-md flex items-start mx-4 my-4">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{error}</span>
            </div>
          )}

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

          {/* Results */}
          {!loading && tickets.length > 0 && (
            <>
              <div className="p-4 bg-rose-50 border-l-4 border-rose-500 mx-4 my-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h.01a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-rose-700">
                      Showing tickets assigned to staff: 
                      <span className="font-semibold ml-1">
                        {tickets[0].assignedToName} (ID: {searchId})
                        {tickets[0].staffRole && ` - ${tickets[0].staffRole}`}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop Table View  */}
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
                isReadOnly={true}
              />

              {/* Mobile Card View*/}
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
                isReadOnly={true} 
              />
            </>
          )}

          {/* Empty state */}
          {!loading && searched && tickets.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-100 p-5 rounded-full mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets found</h3>
              <p className="text-gray-500 mb-4 text-center">
                There are no tickets assigned to the staff member with ID {searchId}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketsAssignedPage;
