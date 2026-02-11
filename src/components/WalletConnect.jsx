import React, { useState, useEffect } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

/**
 * WalletConnect Component
 * Handles Pera Wallet connection, disconnection, and displays wallet address
 */
const WalletConnect = ({ onWalletChange }) => {
  const [peraWallet] = useState(new PeraWalletConnect());
  const [accountAddress, setAccountAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize wallet connection on component mount
  useEffect(() => {
    // Reconnect to session if exists
    peraWallet.reconnectSession().then((accounts) => {
      if (accounts.length) {
        setAccountAddress(accounts[0]);
        onWalletChange && onWalletChange(accounts[0]);
      }
    });

    // Listen for wallet disconnection
    peraWallet.connector?.on('disconnect', handleDisconnect);

    return () => {
      peraWallet.connector?.off('disconnect', handleDisconnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peraWallet]);

  /**
   * Connect to Pera Wallet
   */
  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const accounts = await peraWallet.connect();
      
      if (accounts.length) {
        setAccountAddress(accounts[0]);
        onWalletChange && onWalletChange(accounts[0]);
        
        // Optional: Send connection info to backend
        try {
          await fetch('/api/wallet/connect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: accounts[0] }),
          });
        } catch (error) {
          console.error('Error notifying backend:', error);
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      if (error?.message?.includes('User rejected')) {
        alert('Wallet connection was cancelled');
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect from Pera Wallet
   */
  const handleDisconnect = () => {
    peraWallet.disconnect();
    setAccountAddress(null);
    onWalletChange && onWalletChange(null);
  };

  /**
   * Format wallet address for display (show first 6 and last 4 characters)
   */
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-connect bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Connection Status Indicator */}
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full ${
                accountAddress ? 'bg-green-500' : 'bg-gray-400'
              }`}
              aria-label={accountAddress ? 'Connected' : 'Disconnected'}
            ></div>
            <span className="ml-2 text-sm font-medium text-gray-700">
              {accountAddress ? 'Connected' : 'Not Connected'}
            </span>
          </div>

          {/* Display Wallet Address */}
          {accountAddress && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Address:</span>
              <code className="transaction-hash bg-gray-100 px-3 py-1 rounded text-sm">
                {formatAddress(accountAddress)}
              </code>
              <span className="text-xs text-gray-500" title={accountAddress}>
                (hover for full address)
              </span>
            </div>
          )}
        </div>

        {/* Connect/Disconnect Button */}
        <div>
          {!accountAddress ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              aria-label="Connect Wallet"
            >
              {isConnecting ? (
                <>
                  <div className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Connecting...</span>
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
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 flex items-center space-x-2"
              aria-label="Disconnect Wallet"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>Disconnect</span>
            </button>
          )}
        </div>
      </div>

      {/* Full Address Tooltip on Hover */}
      {accountAddress && (
        <div className="mt-2 text-xs text-gray-500">
          <span className="font-semibold">Full Address: </span>
          <code className="transaction-hash bg-gray-50 px-2 py-1 rounded">
            {accountAddress}
          </code>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
