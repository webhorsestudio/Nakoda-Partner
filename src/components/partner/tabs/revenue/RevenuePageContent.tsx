"use client";

import React, { useState } from 'react';
import { 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { usePartnerRevenue } from '@/hooks/usePartnerRevenue';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface RevenueData {
  date: string;
  earnings: number;
  tasks: number;
  commission: number;
}

interface RevenueStats {
  totalEarnings: number;
  totalTasks: number;
  averageEarnings: number;
  commissionEarned: number;
  pendingAmount: number;
  completedTasks: number;
  monthlyGrowth: number;
  weeklyGrowth: number;
}

interface ServiceBreakdown {
  serviceType: string;
  earnings: number;
  tasks: number;
  percentage: number;
  color: string;
}

export default function RevenuePageContent() {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Use the revenue hook to get data
  const {
    revenueData,
    revenueStats,
    serviceBreakdown,
    recentTransactions,
    isLoadingRevenue,
    isLoadingStats,
    isLoadingTransactions,
    revenueError,
    statsError,
    transactionsError,
    fetchRevenueData,
    refreshAll
  } = usePartnerRevenue();

  // Handle time range changes
  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
    fetchRevenueData(newTimeRange);
  };

  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'transactions', label: 'Transactions', icon: CheckCircleIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
        <select
          value={timeRange}
          onChange={(e) => handleTimeRangeChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {timeRangeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Revenue Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Earnings</p>
              {isLoadingStats ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {revenueStats ? formatCurrency(revenueStats?.totalEarnings || 0) : '₹0'}
                </p>
              )}
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">
              {revenueStats ? `+${revenueStats?.monthlyGrowth}%` : '0%'}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Tasks</p>
              {isLoadingStats ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {revenueStats ? revenueStats?.totalTasks : 0}
                </p>
              )}
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-500">
              {revenueStats ? `${revenueStats?.completedTasks} completed` : '0 completed'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex px-4 sm:px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-2 sm:px-4 border-b-2 font-medium text-sm flex items-center justify-center space-x-1 sm:space-x-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Earnings Chart */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Earnings Trend</h3>
                <div className="h-80">
                  {isLoadingRevenue ? (
                    <div className="h-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                      <div className="text-gray-500">Loading chart...</div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tickFormatter={(value) => `₹${value}`} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          formatCurrency(value), 
                          name === 'earnings' ? 'Earnings' : 'Tasks'
                        ]}
                        labelFormatter={(value) => formatDate(value)}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="earnings" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Service Breakdown */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Breakdown</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serviceBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="percentage"
                        >
                          {serviceBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {serviceBreakdown.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: service.color }}
                          />
                          <span className="font-medium text-gray-900">{service.serviceType}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(service.earnings)}</p>
                          <p className="text-sm text-gray-500">{service.tasks} tasks</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        transaction.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {transaction.status === 'completed' ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <ClockIcon className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.service}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(transaction.amount)}</p>
                      <p className="text-sm text-gray-500">{transaction.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Earnings vs Tasks</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis yAxisId="left" tickFormatter={(value) => `₹${value}`} />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'earnings' ? formatCurrency(value) : value,
                          name === 'earnings' ? 'Earnings' : 'Tasks'
                        ]}
                        labelFormatter={(value) => formatDate(value)}
                      />
                      <Bar yAxisId="left" dataKey="earnings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="tasks" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average per task</span>
                      <span className="font-semibold">{formatCurrency(revenueStats?.averageEarnings || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completion rate</span>
                      <span className="font-semibold">{Math.round(((revenueStats?.completedTasks || 0) / (revenueStats?.totalTasks || 1)) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weekly growth</span>
                      <span className="font-semibold text-green-600">+{revenueStats?.weeklyGrowth || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Financial Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total revenue</span>
                      <span className="font-semibold">{formatCurrency(revenueStats?.totalEarnings || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average per task</span>
                      <span className="font-semibold">{formatCurrency(revenueStats?.averageEarnings || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly growth</span>
                      <span className="font-semibold text-green-600">+{revenueStats?.monthlyGrowth}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
