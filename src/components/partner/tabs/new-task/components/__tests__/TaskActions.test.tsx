import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskActions from '../TaskActions';
import { usePartnerWallet } from '@/hooks/usePartnerWallet';

// Mock the usePartnerWallet hook
jest.mock('@/hooks/usePartnerWallet');
const mockUsePartnerWallet = usePartnerWallet as jest.MockedFunction<typeof usePartnerWallet>;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('TaskActions Component', () => {
  const defaultProps = {
    taskId: 'test-task-123',
    isAccepting: false,
    onAcceptTask: jest.fn(),
    onViewDetails: jest.fn(),
    advanceAmount: 200,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePartnerWallet.mockReturnValue({
      balance: 500,
      fetchBalance: jest.fn(),
      isLoading: false,
    });
  });

  it('renders accept task button for all orders', () => {
    render(<TaskActions {...defaultProps} mode="online" />);
    
    expect(screen.getByText('Accept Task')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('checks wallet balance for all orders including COD', async () => {
    const mockOnAcceptTask = jest.fn();
    mockUsePartnerWallet.mockReturnValue({
      balance: 100, // Insufficient balance
      fetchBalance: jest.fn(),
      isLoading: false,
    });
    
    render(<TaskActions {...defaultProps} mode="cod" onAcceptTask={mockOnAcceptTask} />);
    
    const acceptButton = screen.getByText('Accept Task');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(mockOnAcceptTask).not.toHaveBeenCalled();
      expect(screen.getByText('Insufficient Balance')).toBeInTheDocument();
    });
  });

  it('calls onAcceptTask when wallet balance is sufficient for COD orders', async () => {
    const mockOnAcceptTask = jest.fn();
    mockUsePartnerWallet.mockReturnValue({
      balance: 500, // Sufficient balance
      fetchBalance: jest.fn(),
      isLoading: false,
    });
    
    render(<TaskActions {...defaultProps} mode="cod" onAcceptTask={mockOnAcceptTask} />);
    
    const acceptButton = screen.getByText('Accept Task');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(mockOnAcceptTask).toHaveBeenCalledWith('test-task-123');
    });
  });

  it('calls onAcceptTask when wallet balance is sufficient for "cash on delivery" orders', async () => {
    const mockOnAcceptTask = jest.fn();
    mockUsePartnerWallet.mockReturnValue({
      balance: 500, // Sufficient balance
      fetchBalance: jest.fn(),
      isLoading: false,
    });
    
    render(<TaskActions {...defaultProps} mode="cash on delivery" onAcceptTask={mockOnAcceptTask} />);
    
    const acceptButton = screen.getByText('Accept Task');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(mockOnAcceptTask).toHaveBeenCalledWith('test-task-123');
    });
  });

  it('calls onAcceptTask when wallet balance is sufficient for "cash" orders', async () => {
    const mockOnAcceptTask = jest.fn();
    mockUsePartnerWallet.mockReturnValue({
      balance: 500, // Sufficient balance
      fetchBalance: jest.fn(),
      isLoading: false,
    });
    
    render(<TaskActions {...defaultProps} mode="cash" onAcceptTask={mockOnAcceptTask} />);
    
    const acceptButton = screen.getByText('Accept Task');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(mockOnAcceptTask).toHaveBeenCalledWith('test-task-123');
    });
  });

  it('handles case insensitive mode values', async () => {
    const mockOnAcceptTask = jest.fn();
    mockUsePartnerWallet.mockReturnValue({
      balance: 500, // Sufficient balance
      fetchBalance: jest.fn(),
      isLoading: false,
    });
    
    render(<TaskActions {...defaultProps} mode="COD" onAcceptTask={mockOnAcceptTask} />);
    
    const acceptButton = screen.getByText('Accept Task');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(mockOnAcceptTask).toHaveBeenCalledWith('test-task-123');
    });
  });

  it('shows insufficient balance modal when balance is low', async () => {
    const mockOnAcceptTask = jest.fn();
    mockUsePartnerWallet.mockReturnValue({
      balance: 100, // Insufficient balance
      fetchBalance: jest.fn(),
      isLoading: false,
    });
    
    render(<TaskActions {...defaultProps} mode="online" onAcceptTask={mockOnAcceptTask} />);
    
    const acceptButton = screen.getByText('Accept Task');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(screen.getByText('Insufficient Balance')).toBeInTheDocument();
      expect(screen.getByText('You need ₹200 to accept this task')).toBeInTheDocument();
      expect(screen.getByText('Your current balance: ₹100')).toBeInTheDocument();
    });
  });

  it('handles wallet loading state', () => {
    mockUsePartnerWallet.mockReturnValue({
      balance: null,
      fetchBalance: jest.fn(),
      isLoading: true,
    });
    
    render(<TaskActions {...defaultProps} mode="online" />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accept task/i })).toBeDisabled();
  });

  it('handles null mode gracefully', async () => {
    const mockOnAcceptTask = jest.fn();
    mockUsePartnerWallet.mockReturnValue({
      balance: 500, // Sufficient balance
      fetchBalance: jest.fn(),
      isLoading: false,
    });
    
    render(<TaskActions {...defaultProps} mode={null} onAcceptTask={mockOnAcceptTask} />);
    
    const acceptButton = screen.getByText('Accept Task');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(mockOnAcceptTask).toHaveBeenCalledWith('test-task-123');
    });
  });

  it('handles undefined mode gracefully', async () => {
    const mockOnAcceptTask = jest.fn();
    mockUsePartnerWallet.mockReturnValue({
      balance: 500, // Sufficient balance
      fetchBalance: jest.fn(),
      isLoading: false,
    });
    
    render(<TaskActions {...defaultProps} mode={undefined} onAcceptTask={mockOnAcceptTask} />);
    
    const acceptButton = screen.getByText('Accept Task');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(mockOnAcceptTask).toHaveBeenCalledWith('test-task-123');
    });
  });
});
