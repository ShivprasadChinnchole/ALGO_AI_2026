import React, { useState, useEffect } from 'react';

/**
 * VotingPanel Component
 * Displays proposals and allows users to vote Yes/No
 */
const VotingPanel = ({ walletAddress }) => {
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);

  /**
   * Fetch proposals on component mount
   */
  useEffect(() => {
    fetchProposals();
  }, []);

  /**
   * Fetch all proposals from backend
   */
  const fetchProposals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/proposals');
      
      if (response.ok) {
        const data = await response.json();
        setProposals(data.proposals || []);
      } else {
        console.error('Failed to fetch proposals');
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch proposal details by ID
   */
  const fetchProposalDetails = async (proposalId) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}`);
      
      if (response.ok) {
        const data = await response.json();
        setSelectedProposal(data);
      }
    } catch (error) {
      console.error('Error fetching proposal details:', error);
    }
  };

  /**
   * Handle voting on a proposal
   */
  const handleVote = async (proposalId, vote) => {
    // Clear previous messages
    setMessage(null);
    setTransactionHash(null);

    // Check if wallet is connected
    if (!walletAddress) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' });
      return;
    }

    try {
      setIsVoting(true);

      // Submit vote to backend
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          vote,
          walletAddress,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Vote "${vote}" submitted successfully!` 
        });
        setTransactionHash(data.transactionHash || data.txId || 'TX-' + Date.now());
        
        // Refresh proposal details
        await fetchProposalDetails(proposalId);
        await fetchProposals();
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to submit vote. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsVoting(false);
    }
  };

  /**
   * Select a proposal to view details
   */
  const selectProposal = (proposal) => {
    setSelectedProposal(proposal);
    setMessage(null);
    setTransactionHash(null);
    fetchProposalDetails(proposal.id);
  };

  return (
    <div className="voting-panel bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <svg
          className="w-6 h-6 mr-2 text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        Vote on Proposals
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proposals List */}
        <div className="proposals-list">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Active Proposals
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">Loading proposals...</span>
            </div>
          ) : proposals.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">No proposals available yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Create a proposal to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  onClick={() => selectProposal(proposal)}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition duration-200 ${
                    selectedProposal?.id === proposal.id
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select proposal: ${proposal.title}`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') selectProposal(proposal);
                  }}
                >
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {proposal.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {proposal.description}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Yes: {proposal.yesVotes || 0}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      No: {proposal.noVotes || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Voting Details */}
        <div className="voting-details">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Proposal Details
          </h3>

          {!selectedProposal ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">
                Select a proposal to view details and vote
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                {selectedProposal.title}
              </h4>
              <p className="text-gray-700 mb-4">
                {selectedProposal.description}
              </p>

              {/* Vote Counts */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Yes Votes
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {selectedProposal.yesVotes || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((selectedProposal.yesVotes || 0) /
                          Math.max(
                            (selectedProposal.yesVotes || 0) +
                              (selectedProposal.noVotes || 0),
                            1
                          )) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    No Votes
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {selectedProposal.noVotes || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((selectedProposal.noVotes || 0) /
                          Math.max(
                            (selectedProposal.yesVotes || 0) +
                              (selectedProposal.noVotes || 0),
                            1
                          )) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Vote Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => handleVote(selectedProposal.id, 'yes')}
                  disabled={isVoting || !walletAddress}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  aria-label="Vote Yes"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Vote Yes</span>
                </button>

                <button
                  onClick={() => handleVote(selectedProposal.id, 'no')}
                  disabled={isVoting || !walletAddress}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  aria-label="Vote No"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Vote No</span>
                </button>
              </div>

              {/* Status Messages */}
              {message && (
                <div
                  className={`fade-in p-3 rounded-lg mb-4 ${
                    message.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                  role="alert"
                >
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              )}

              {/* Transaction Hash */}
              {transactionHash && (
                <div className="fade-in bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-blue-800 mb-1">
                    Transaction Hash:
                  </p>
                  <code className="transaction-hash bg-white px-2 py-1 rounded block text-blue-900 text-xs">
                    {transactionHash}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingPanel;
