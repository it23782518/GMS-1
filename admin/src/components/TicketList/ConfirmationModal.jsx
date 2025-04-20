import React, { useEffect, useRef } from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmButtonText = "Confirm" }) => {
  const modalRef = useRef(null);
  
  // Prevent scrolling when modal is open and ensure it's visible in the viewport
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Determine if we need to adjust modal position for visibility
      const positionModal = () => {
        if (modalRef.current) {
          const viewportHeight = window.innerHeight;
          const modalHeight = modalRef.current.offsetHeight;
          const modalRect = modalRef.current.getBoundingClientRect();
          
          // Check if modal is partially or completely out of viewport
          if (modalRect.top < 20 || modalRect.bottom > viewportHeight - 20) {
            window.scrollTo({
              top: window.pageYOffset + modalRect.top - (viewportHeight - modalHeight) / 2,
              behavior: 'auto' // Use 'auto' to avoid animation
            });
          }
        }
      };
      
      // Run once after modal is rendered
      setTimeout(positionModal, 50);
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;
  
  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-auto bg-black/30 backdrop-filter backdrop-blur-[6px]"
      onClick={handleBackdropClick}
    >
      <div className="flex items-center justify-center min-h-screen w-full py-10">
        <div
          ref={modalRef}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto my-auto overflow-hidden border border-gray-100 animate-fadeIn"
          style={{ maxHeight: 'calc(100vh - 40px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Body */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            {typeof message === 'string' ? (
              <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
            ) : (
              message
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end p-5 bg-gray-50 border-t border-gray-200 sticky bottom-0 z-10">
            <button
              className="px-4 py-2 mr-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;
