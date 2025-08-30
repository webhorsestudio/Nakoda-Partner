"use client";

import React, { useState } from 'react';
import { ArrowLeftIcon, PlusIcon, MinusIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function PartnerWalletPage() {
  const router = useRouter();
  const [showAddAmount, setShowAddAmount] = useState(false);
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');

  // Mock data for UI demonstration
  const walletBalance = 2400;
  const pendingBalance = 800;
  const availableBalance = 1600;

  const mockTransactions = [
    {
      id: 1,
      type: 'credit',
      amount: 1200,
      description: 'Order completion - AC Service',
      date: '2024-01-15',
      time: '14:30',
      status: 'completed'
    },
    {
      id: 2,
      type: 'debit',
      amount: 500,
      description: 'Withdrawal to bank account',
      date: '2024-01-14',
      time: '10:15',
      status: 'completed'
    },
    {
      id: 3,
      type: 'credit',
      amount: 800,
      description: 'Order completion - Cleaning Service',
      date: '2024-01-13',
      time: '16:45',
      status: 'completed'
    },
    {
      id: 4,
      type: 'credit',
      amount: 600,
      description: 'Order completion - Plumbing',
      date: '2024-01-12',
      time: '11:20',
      status: 'pending'
    },
    {
      id: 5,
      type: 'debit',
      amount: 300,
      description: 'Service fee deduction',
      date: '2024-01-11',
      time: '09:30',
      status: 'completed'
    }
  ];

  const handleBack = () => {
    router.push('/partner');
  };

  const handleAddAmount = () => {
    if (amount && parseFloat(amount) > 0) {
      console.log(`${transactionType === 'credit' ? 'Adding' : 'Deducting'} ₹${amount}`);
      setAmount('');
      setShowAddAmount(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? (
      <ArrowDownIcon className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowUpIcon className="h-4 w-4 text-red-600" />
    );
  };

  const getTransactionColor = (type: string) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="mr-3"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Wallet</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Balance */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Balance</p>
                <p className="text-2xl font-bold text-blue-900">₹{walletBalance.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">₹</span>
              </div>
            </div>
          </Card>

          {/* Available Balance */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Available</p>
                <p className="text-2xl font-bold text-green-900">₹{availableBalance.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                <ArrowDownIcon className="h-5 w-5 text-white" />
              </div>
            </div>
          </Card>

          {/* Pending Balance */}
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">₹{pendingBalance.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">⏳</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => setShowAddAmount(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Amount
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <MinusIcon className="h-4 w-4 mr-2" />
            Withdraw
          </Button>
        </div>

        {/* Add Amount Modal */}
        {showAddAmount && (
          <Card className="p-6 border-2 border-blue-200 bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Amount</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <div className="flex gap-3">
                  <Button
                    variant={transactionType === 'credit' ? 'default' : 'outline'}
                    onClick={() => setTransactionType('credit')}
                    className="flex-1"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Credit
                  </Button>
                  <Button
                    variant={transactionType === 'debit' ? 'default' : 'outline'}
                    onClick={() => setTransactionType('debit')}
                    className="flex-1"
                  >
                    <MinusIcon className="h-4 w-4 mr-2" />
                    Debit
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleAddAmount}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddAmount(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Transaction History */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {mockTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{transaction.date}</span>
                      <span>•</span>
                      <span>{transaction.time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </span>
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
