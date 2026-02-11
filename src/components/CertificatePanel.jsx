import React, { useState } from 'react';

/**
 * CertificatePanel Component
 * Allows users to verify certificates by ID
 */
const CertificatePanel = ({ walletAddress }) => {
  const [certificateId, setCertificateId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState(null);
  const [certificateDetails, setCertificateDetails] = useState(null);

  /**
   * Handle certificate verification
   */
  const handleVerify = async (e) => {
    e.preventDefault();

    // Clear previous results
    setMessage(null);
    setCertificateDetails(null);

    // Validate certificate ID
    if (!certificateId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a certificate ID' });
      return;
    }

    try {
      setIsVerifying(true);

      // Verify certificate with backend
      const response = await fetch('/api/certificate/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateId: certificateId.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.valid) {
          setMessage({ 
            type: 'success', 
            text: 'Certificate verified successfully!' 
          });
          setCertificateDetails(data.certificate);
        } else {
          setMessage({ 
            type: 'error', 
            text: 'Certificate not found or invalid' 
          });
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to verify certificate. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="certificate-panel bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <svg
          className="w-6 h-6 mr-2 text-success"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
        Certificate Verification
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Form */}
        <div className="verification-form">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Verify Certificate
          </h3>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label
                htmlFor="certificate-id"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Certificate ID *
              </label>
              <input
                id="certificate-id"
                type="text"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                placeholder="Enter certificate ID (e.g., CERT-2024-001)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-success focus:border-transparent outline-none transition"
                aria-required="true"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the unique certificate identifier to verify its authenticity
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-success hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              aria-label="Verify Certificate"
            >
              {isVerifying ? (
                <>
                  <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Verifying...</span>
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Verify Certificate</span>
                </>
              )}
            </button>
          </form>

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
        </div>

        {/* Certificate Details */}
        <div className="certificate-details">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Certificate Details
          </h3>

          {!certificateDetails ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-3 text-gray-400"
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
              <p className="text-gray-600">
                Enter a certificate ID and click verify to view details
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
              {/* Valid Badge */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">VERIFIED</span>
                </div>
              </div>

              {/* Certificate Information */}
              <div className="space-y-3 bg-white rounded-lg p-4 border border-green-200">
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Certificate ID
                  </p>
                  <p className="font-semibold text-gray-800">
                    {certificateDetails.id}
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Recipient Name
                  </p>
                  <p className="font-semibold text-gray-800">
                    {certificateDetails.recipientName || 'N/A'}
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Course/Program
                  </p>
                  <p className="font-semibold text-gray-800">
                    {certificateDetails.course || certificateDetails.program || 'N/A'}
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Issue Date
                  </p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(certificateDetails.issueDate)}
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Issuing Authority
                  </p>
                  <p className="font-semibold text-gray-800">
                    {certificateDetails.issuer || 'TrustChain Campus'}
                  </p>
                </div>

                {certificateDetails.transactionHash && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Blockchain Transaction
                    </p>
                    <code className="transaction-hash bg-gray-50 px-2 py-1 rounded block text-xs text-gray-700">
                      {certificateDetails.transactionHash}
                    </code>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              {certificateDetails.description && (
                <div className="mt-4 bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-700">
                    {certificateDetails.description}
                  </p>
                </div>
              )}
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
              About Certificate Verification
            </p>
            <p className="text-sm text-blue-800">
              All certificates are stored on the Algorand blockchain, ensuring
              they cannot be forged or tampered with. Verification is instant
              and permanent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePanel;
