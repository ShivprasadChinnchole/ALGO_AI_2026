import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * AnalyticsDashboard Component
 * Displays AI-powered analytics and governance insights
 */
const AnalyticsDashboard = ({ walletAddress }) => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch analytics data on component mount
   */
  useEffect(() => {
    fetchAnalytics();
  }, []);

  /**
   * Fetch analytics from backend
   */
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/analytics');
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Use mock data if backend is not available
        setAnalytics(getMockAnalytics());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use mock data on error
      setAnalytics(getMockAnalytics());
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mock analytics data for demonstration
   */
  const getMockAnalytics = () => ({
    overview: {
      totalProposals: 24,
      totalVotes: 156,
      totalParticipants: 42,
      attendanceRate: 78,
    },
    participationTrend: [
      { month: 'Jan', proposals: 3, votes: 18, attendance: 15 },
      { month: 'Feb', proposals: 5, votes: 32, attendance: 22 },
      { month: 'Mar', proposals: 4, votes: 28, attendance: 19 },
      { month: 'Apr', proposals: 6, votes: 38, attendance: 28 },
      { month: 'May', proposals: 6, votes: 40, attendance: 31 },
    ],
    voteDistribution: [
      { name: 'Yes Votes', value: 98, color: '#10B981' },
      { name: 'No Votes', value: 58, color: '#EF4444' },
    ],
    topContributors: [
      { name: 'Alice', contributions: 12 },
      { name: 'Bob', contributions: 9 },
      { name: 'Charlie', contributions: 7 },
      { name: 'David', contributions: 6 },
      { name: 'Eve', contributions: 5 },
    ],
    insights: [
      {
        title: 'High Engagement',
        description: 'Participation has increased by 23% this month',
        type: 'positive',
      },
      {
        title: 'Proposal Trend',
        description: 'Average proposal approval rate is 62%',
        type: 'neutral',
      },
      {
        title: 'Attendance Alert',
        description: 'Attendance dipped slightly in the past week',
        type: 'warning',
      },
    ],
    predictions: [
      'Expected 8-10 new proposals next month',
      'Voter participation likely to increase by 15%',
      'Attendance rate projected to stabilize at 80%',
    ],
  });

  if (isLoading) {
    return (
      <div className="analytics-dashboard bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center py-12">
          <div className="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-4 text-lg text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <svg
          className="w-6 h-6 mr-2 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        AI Analytics Dashboard
      </h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium mb-1">
                Total Proposals
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {analytics.overview.totalProposals}
              </p>
            </div>
            <svg
              className="w-12 h-12 text-blue-600 opacity-50"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium mb-1">
                Total Votes
              </p>
              <p className="text-3xl font-bold text-green-900">
                {analytics.overview.totalVotes}
              </p>
            </div>
            <svg
              className="w-12 h-12 text-green-600 opacity-50"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium mb-1">
                Participants
              </p>
              <p className="text-3xl font-bold text-purple-900">
                {analytics.overview.totalParticipants}
              </p>
            </div>
            <svg
              className="w-12 h-12 text-purple-600 opacity-50"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium mb-1">
                Attendance Rate
              </p>
              <p className="text-3xl font-bold text-yellow-900">
                {analytics.overview.attendanceRate}%
              </p>
            </div>
            <svg
              className="w-12 h-12 text-yellow-600 opacity-50"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Participation Trend Chart */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Participation Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.participationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="proposals"
                stroke="#0EA5E9"
                strokeWidth={2}
                name="Proposals"
              />
              <Line
                type="monotone"
                dataKey="votes"
                stroke="#8B5CF6"
                strokeWidth={2}
                name="Votes"
              />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="#F59E0B"
                strokeWidth={2}
                name="Attendance"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vote Distribution Chart */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Vote Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.voteDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.voteDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Top Contributors
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.topContributors}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="contributions" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            AI-Powered Insights
          </h3>
          <div className="space-y-3">
            {analytics.insights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  insight.type === 'positive'
                    ? 'bg-green-50 border-green-500'
                    : insight.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <p className="font-semibold text-gray-800 text-sm mb-1">
                  {insight.title}
                </p>
                <p className="text-xs text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          AI Predictions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics.predictions.map((prediction, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 border border-purple-200"
            >
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-purple-600 mr-2 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-gray-700">{prediction}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
