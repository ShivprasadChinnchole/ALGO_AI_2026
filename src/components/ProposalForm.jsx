import React, { useState } from 'react';

/**
 * ProposalForm Component
 * Allows users to create new governance proposals
 */
const ProposalForm = ({ walletAddress }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);

  /**
   * Validate form inputs
   */
  const validateForm = () => {
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a proposal title' });
      return false;
    }
    if (title.trim().length < 5) {
      setMessage({ type: 'error', text: 'Title must be at least 5 characters' });
      return false;
    }
    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Please enter a proposal description' });
      return false;
    }
    if (description.trim().length < 20) {
      setMessage({ type: 'error', text: 'Description must be at least 20 characters' });
      return false;
    }
    return true;
  };

  /**
   * Handle proposal submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage(null);
    setTransactionHash(null);

    // Check if wallet is connected
    if (!walletAddress) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Submit proposal to backend
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          walletAddress,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Proposal created successfully!' });
        setTransactionHash(data.transactionHash || data.txId || 'TX-' + Date.now());
        
        // Clear form
        setTitle('');
        setDescription('');
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to create proposal. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="proposal-form bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <svg
          className="w-6 h-6 mr-2 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Create New Proposal
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label
            htmlFor="proposal-title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Proposal Title *
          </label>
          <input
            id="proposal-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a clear and concise title..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            maxLength={100}
            aria-required="true"
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/100 characters
          </p>
        </div>

        {/* Description Textarea */}
        <div>
          <label
            htmlFor="proposal-description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Proposal Description *
          </label>
          <textarea
            id="proposal-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your proposal in detail..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-vertical"
            maxLength={1000}
            aria-required="true"
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/1000 characters
          </p>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting || !walletAddress}
            className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            aria-label="Submit Proposal"
          >
            {isSubmitting ? (
              <>
                <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Submit Proposal</span>
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {message && (
          <div
            className={`fade-in p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
            role="alert"
          >
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Transaction Hash Display */}
        {transactionHash && (
          <div className="fade-in bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm font-semibold text-blue-800 mb-2">
              Transaction Hash:
            </p>
            <code className="transaction-hash bg-white px-3 py-2 rounded block text-blue-900">
              {transactionHash}
            </code>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProposalForm;
