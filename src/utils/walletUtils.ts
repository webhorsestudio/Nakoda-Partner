export const getTransactionColor = (type: string) => {
  return type === 'credit' ? 'text-green-600' : 'text-red-600';
};

export const getStatusConfig = (status: string) => {
  const statusConfig = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  };
  
  return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString()}`;
};

export const validateAmount = (amount: string): boolean => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0;
};

export const validateWithdrawAmount = (amount: string, maxAmount: number): boolean => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= maxAmount;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
