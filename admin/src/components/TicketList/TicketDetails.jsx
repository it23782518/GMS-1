import React from 'react';

// Helper function moved directly into component
const getAssignedToInfo = (ticket) => {
  if (!ticket.assignedToId && !ticket.assignedToName) {
    return 'Not assigned';
  }
  
  const name = ticket.assignedToName || 'Unknown';
  const id = ticket.assignedToId || 'N/A';
  
  return `${name} (Staff ID: ${id})`;
};

const TicketDetails = ({ 
  ticket, 
  handleStatusChange, 
  handleUpdateStatus, 
  handleAssignTicket, 
  selectedStatuses, 
  loading,
  getTicketId,
  formatDate
}) => {
  return (
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
  );
};

export default TicketDetails;
