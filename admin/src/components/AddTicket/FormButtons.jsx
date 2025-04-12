import React from 'react';
import { useNavigate } from 'react-router-dom';

const FormButtons = ({ isSubmitting }) => {
  const navigate = useNavigate();
  
  return (
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
  );
};

export default FormButtons;
