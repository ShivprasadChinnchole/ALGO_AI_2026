import React, { useState } from 'react';
import './App.css';
import WalletConnect from './components/WalletConnect';
import ProposalForm from './components/ProposalForm';
import VotingPanel from './components/VotingPanel';
import AttendancePanel from './components/AttendancePanel';
import CertificatePanel from './components/CertificatePanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';

/**
 * Main App Component
 * TrustChain Campus - Algorand Blockchain Dashboard
 */
function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // App ID for Algorand smart contract
  // TODO: Replace this placeholder with your actual Algorand Application ID
  // You can also use an environment variable: process.env.REACT_APP_ALGORAND_APP_ID
  const APP_ID = process.env.REACT_APP_ALGORAND_APP_ID || '123456789';

  /**
   * Handle wallet connection state changes
   */
  const handleWalletChange = (address) => {
    setWalletAddress(address);
  };

  /**
   * Navigation tabs
   */
  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'proposals', name: 'Proposals', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'voting', name: 'Voting', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'attendance', name: 'Attendance', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'certificates', name: 'Certificates', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { id: 'analytics', name: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <div>
                <h1 className="text-3xl font-bold">TrustChain Campus</h1>
                <p className="text-sm text-purple-200">
                  Algorand Blockchain Governance Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* App ID Display */}
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <p className="text-xs text-purple-200">App ID</p>
                <p className="font-mono font-semibold">{APP_ID}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Wallet Connection */}
        <WalletConnect onWalletChange={handleWalletChange} />

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white border-b-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
                aria-label={`Navigate to ${tab.name}`}
              >
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
                    d={tab.icon}
                  />
                </svg>
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="fade-in">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Welcome to TrustChain Campus
                </h2>
                <p className="text-gray-600 mb-4">
                  A decentralized governance platform built on Algorand blockchain,
                  enabling transparent decision-making, attendance tracking, and
                  certificate verification for educational institutions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Create Proposals
                    </h3>
                    <p className="text-sm text-blue-700">
                      Submit governance proposals for community voting
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">
                      Vote & Participate
                    </h3>
                    <p className="text-sm text-green-700">
                      Cast your vote on active proposals and track attendance
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-2">
                      Verify Certificates
                    </h3>
                    <p className="text-sm text-purple-700">
                      Authenticate educational certificates on the blockchain
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <AnalyticsDashboard walletAddress={walletAddress} />
            </div>
          )}

          {activeTab === 'proposals' && (
            <div className="fade-in">
              <ProposalForm walletAddress={walletAddress} />
            </div>
          )}

          {activeTab === 'voting' && (
            <div className="fade-in">
              <VotingPanel walletAddress={walletAddress} />
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="fade-in">
              <AttendancePanel walletAddress={walletAddress} />
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="fade-in">
              <CertificatePanel walletAddress={walletAddress} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="fade-in">
              <AnalyticsDashboard walletAddress={walletAddress} />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">
                © 2024 TrustChain Campus. Built on Algorand Blockchain.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://algorand.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-300 hover:text-white transition"
              >
                Powered by Algorand
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
