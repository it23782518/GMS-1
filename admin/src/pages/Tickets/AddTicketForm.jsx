import React, { useState } from 'react';
import { addTicket } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

const AddTicketFormPage = () => {
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState({
    type: '',
    description: '',
    priority: 'MEDIUM', // Default value
    staffId: '',
    userId: '',
    assigneeType: 'STAFF' // Default value - new field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare data based on assigneeType
      const dataToSubmit = {
        ...ticketData,
        staffId: ticketData.assigneeType === 'STAFF' && ticketData.staffId ? 
                 parseInt(ticketData.staffId, 10) : null,
        userId: ticketData.assigneeType === 'USER' && ticketData.userId ? 
                parseInt(ticketData.userId, 10) : null,
        assigneeType: ticketData.assigneeType
      };
      
      await addTicket(dataToSubmit);
      setSuccess(true);
      setTicketData({ 
        type: '', 
        description: '', 
        priority: 'MEDIUM', 
        staffId: '',
        userId: '',
        assigneeType: 'STAFF' 
      });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/tickets');
      }, 2000);
      
    } catch (error) {
      console.error('Error adding ticket:', error);
      setError('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-full sm:max-w-3xl">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-5 sm:p-6 md:p-8 relative">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-full bg-blue-300 bg-opacity-20 backdrop-blur-sm"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 rounded-full bg-white bg-opacity-10"></div>
            
            <div className="relative">
              <div className="flex items-center mb-2 sm:mb-3">
                <div className="bg-white bg-opacity-25 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 shadow-inner">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                  </svg>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-sm">
                  Create New Ticket
                </h1>
              </div>
              <p className="text-blue-100 text-sm sm:text-base max-w-md">
                Fill out the form below to create a new support ticket for the system.
              </p>
            </div>
          </div>
          
          <div className="p-5 sm:p-6 md:p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 flex flex-col xs:flex-row items-start xs:items-center shadow-sm animate-fadeIn">
                <div className="rounded-full bg-red-100 p-1.5 sm:p-2 mb-2 xs:mb-0 mr-0 xs:mr-3 flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Error</h3>
                  <p className="text-xs sm:text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 flex flex-col xs:flex-row items-start xs:items-center shadow-sm animate-fadeIn">
                <div className="rounded-full bg-green-100 p-1.5 sm:p-2 mb-2 xs:mb-0 mr-0 xs:mr-3 flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Success</h3>
                  <p className="text-xs sm:text-sm text-green-600">Ticket created successfully! Redirecting to tickets list...</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="p-4 sm:p-6 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Ticket Information
                </h2>
                
                <div className="space-y-4 sm:space-y-5">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="type" className="block text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                      Ticket Type 
                      <span className="text-red-500 ml-1">*</span>
                      <span className="ml-1 sm:ml-2 text-xs text-gray-400 font-normal">(Required)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                        </svg>
                      </div>
                      <input
                        id="type"
                        name="type"
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-all duration-200 shadow-sm hover:border-gray-400"
                        type="text"
                        placeholder="Enter ticket type (e.g., Fix login issue)"
                        value={ticketData.type}
                        onChange={(e) => setTicketData({ ...ticketData, type: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="priority" className="block text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                      Priority 
                      <span className="text-red-500 ml-1">*</span>
                      <span className="ml-1 sm:ml-2 text-xs text-gray-400 font-normal">(Required)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </div>
                      <select
                        id="priority"
                        name="priority"
                        className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block appearance-none transition-all duration-200 shadow-sm hover:border-gray-400"
                        value={ticketData.priority}
                        onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value })}
                        disabled={isSubmitting}
                      >
                        <option value="LOW" className="py-1">LOW</option>
                        <option value="MEDIUM" className="py-1">MEDIUM</option>
                        <option value="HIGH" className="py-1">HIGH</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                  <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium flex items-center ${ticketData.priority === 'LOW' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600'}`}>
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                    Low
                  </div>
                  <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium flex items-center ${ticketData.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-gray-100 text-gray-600'}`}>
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                    </svg>
                    Medium
                  </div>
                  <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium flex items-center ${ticketData.priority === 'HIGH' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-100 text-gray-600'}`}>
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                    High
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Ticket Details
                </h2>
                
                <div className="space-y-4 sm:space-y-5">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="assignee" className="block text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                      Assign by
                      <span className="ml-1 sm:ml-2 text-xs text-gray-400 font-normal">(Optional)</span>
                    </label>
                    
                    <div className="mb-2">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            id="assignStaff"
                            name="assigneeType"
                            type="radio"
                            value="STAFF"
                            checked={ticketData.assigneeType === 'STAFF'}
                            onChange={(e) => setTicketData({ ...ticketData, assigneeType: e.target.value })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={isSubmitting}
                          />
                          <label htmlFor="assignStaff" className="ml-2 block text-sm text-gray-700">
                            Staff
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="assignUser"
                            name="assigneeType"
                            type="radio"
                            value="USER"
                            checked={ticketData.assigneeType === 'USER'}
                            onChange={(e) => setTicketData({ ...ticketData, assigneeType: e.target.value })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={isSubmitting}
                          />
                          <label htmlFor="assignUser" className="ml-2 block text-sm text-gray-700">
                            User
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                      {ticketData.assigneeType === 'STAFF' ? (
                        <input
                          id="staffId"
                          name="staffId"
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-all duration-200 shadow-sm hover:border-gray-400"
                          type="number"
                          placeholder="Enter staff ID (e.g., 2)"
                          value={ticketData.staffId}
                          onChange={(e) => setTicketData({ ...ticketData, staffId: e.target.value })}
                          disabled={isSubmitting}
                        />
                      ) : (
                        <input
                          id="userId"
                          name="userId"
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-all duration-200 shadow-sm hover:border-gray-400"
                          type="number"
                          placeholder="Enter user ID (e.g., 5)"
                          value={ticketData.userId}
                          onChange={(e) => setTicketData({ ...ticketData, userId: e.target.value })}
                          disabled={isSubmitting}
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Leave empty if unassigned. {ticketData.assigneeType === 'STAFF' ? 'Staff' : 'User'} will be responsible for this ticket.</p>
                  </div>
                  
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                      Description 
                      <span className="text-red-500 ml-1">*</span>
                      <span className="ml-1 sm:ml-2 text-xs text-gray-400 font-normal">(Required)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                      </div>
                      <textarea
                        id="description"
                        name="description"
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-all duration-200 shadow-sm hover:border-gray-400"
                        placeholder="Describe the issue in detail..."
                        rows="5"
                        value={ticketData.description}
                        onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                        required
                        disabled={isSubmitting}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 sm:pt-4 flex gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/tickets')}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg sm:rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Cancel
                  </div>
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-700 to-blue-500 text-white font-medium rounded-lg sm:rounded-xl shadow-lg hover:from-blue-800 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Ticket...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Create Ticket
                    </div>
                  )}
                </button>
              </div>
            </form>
            <div className="mt-6 flex justify-center">
              <Link 
                to="/raise-ticket"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Raise New Ticket
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTicketFormPage;