import React, { useState } from 'react';
import { addTicket } from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Import components
import Header from '../../components/AddTicket/Header';
import AlertMessage from '../../components/AddTicket/AlertMessage';
import TicketTypeForm from '../../components/AddTicket/TicketTypeForm';
import TicketDetailsForm from '../../components/AddTicket/TicketDetailsForm';
import FormButtons from '../../components/AddTicket/FormButtons';

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
          <Header />
          
          <div className="p-5 sm:p-6 md:p-8">
            <AlertMessage type="error" message={error} />
            <AlertMessage type="success" message={success && "Ticket created successfully! Redirecting to tickets list..."} />
            
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <TicketTypeForm 
                ticketData={ticketData}
                setTicketData={setTicketData}
                isSubmitting={isSubmitting}
              />

              <TicketDetailsForm
                ticketData={ticketData}
                setTicketData={setTicketData}
                isSubmitting={isSubmitting}
              />

              <FormButtons isSubmitting={isSubmitting} />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTicketFormPage;