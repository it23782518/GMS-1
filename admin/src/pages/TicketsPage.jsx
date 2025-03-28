// src/pages/TicketsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  getAllTickets,
  searchTicketsById,
  searchTicketsByStaffId,
} from '../services/api';
import AddTicketForm from './Tickets/AddTicketForm';
import TicketList from './Tickets/TicketList';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllTickets();
      setTickets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets. Please try again later.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {showAddForm ? (
          <AddTicketForm
            onClose={() => setShowAddForm(false)}
            onTicketAdded={fetchTickets}
          />
        ) : (
          <>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg shadow hover:bg-rose-700 focus:ring-4 focus:ring-rose-300 transition-all duration-200 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Create New Ticket
              </button>
            </div>

            {error && (
              <div className="mb-6 text-rose-600 p-4 bg-rose-50 border-l-4 border-rose-600 rounded-md flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="bg-white p-5 rounded-lg shadow-md flex items-center">
                  <svg className="animate-spin h-8 w-8 text-rose-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-lg font-medium text-gray-700">Loading tickets...</span>
                </div>
              </div>
            ) : (
              <TicketList tickets={tickets} onUpdate={fetchTickets} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;