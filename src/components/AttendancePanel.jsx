import React, { useState, useEffect } from 'react';

/**
 * AttendancePanel Component
 * Allows users to mark attendance and view attendance history
 */
const AttendancePanel = ({ walletAddress }) => {
  const [isMarking, setIsMarking] = useState(false);
  const [message, setMessage] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState(null);

  /**
   * Fetch attendance status on component mount
   */
  useEffect(() => {
    if (walletAddress) {
      fetchAttendanceStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  /**
   * Fetch attendance status from backend
   */
  const fetchAttendanceStatus = async () => {
    try {
      const response = await fetch(`/api/attendance?walletAddress=${walletAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        setAttendanceStatus(data.status);
        setAttendanceHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    }
  };

  /**
   * Handle marking attendance
   */
  const handleMarkAttendance = async () => {
    // Clear previous messages
    setMessage(null);
    setTransactionHash(null);

    // Check if wallet is connected
    if (!walletAddress) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' });
      return;
    }

    try {
      setIsMarking(true);

      // Submit attendance to backend
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Attendance marked successfully!' 
        });
        setTransactionHash(data.transactionHash || data.txId || 'TX-' + Date.now());
        
        // Refresh attendance status
        await fetchAttendanceStatus();
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to mark attendance. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsMarking(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="attendance-panel bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <svg
          className="w-6 h-6 mr-2 text-warning"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Attendance System
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mark Attendance Section */}
        <div className="mark-attendance">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Mark Your Attendance
          </h3>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
            {/* Current Status */}
            {attendanceStatus && (
              <div className="mb-4 p-3 bg-white rounded-lg border border-yellow-300">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Current Status:
                </p>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    attendanceStatus === 'present' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="font-semibold text-gray-800 capitalize">
                    {attendanceStatus || 'Not Marked'}
                  </span>
                </div>
              </div>
            )}

            {/* Mark Attendance Button */}
            <button
              onClick={handleMarkAttendance}
              disabled={isMarking || !walletAddress}
              className="w-full bg-warning hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              aria-label="Mark Attendance"
            >
              {isMarking ? (
                <>
                  <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Marking...</span>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Mark Attendance Now</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-600 mt-3 text-center">
              Click the button to record your attendance on the blockchain
            </p>
          </div>

          {/* Status Messages */}
          {message && (
            <div
              className={`fade-in mt-4 p-4 rounded-lg ${
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
            <div className="fade-in mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                Transaction Hash:
              </p>
              <code className="transaction-hash bg-white px-3 py-2 rounded block text-blue-900">
                {transactionHash}
              </code>
            </div>
          )}
        </div>

        {/* Attendance History Section */}
        <div className="attendance-history">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Attendance History
          </h3>

          {!walletAddress ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">
                Connect your wallet to view attendance history
              </p>
            </div>
          ) : attendanceHistory.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-gray-400"
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
              <p className="text-gray-600">No attendance records yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Mark your attendance to get started
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {attendanceHistory.map((record, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="font-semibold text-gray-800">
                          Present
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(record.timestamp)}
                      </span>
                    </div>
                    {record.txHash && (
                      <code className="transaction-hash bg-gray-50 px-2 py-1 rounded block text-xs text-gray-700">
                        TX: {record.txHash.slice(0, 20)}...
                      </code>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              How it works
            </p>
            <p className="text-sm text-blue-800">
              Your attendance is recorded on the Algorand blockchain, ensuring
              transparency and immutability. Each attendance record is verified
              and timestamped.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePanel;
