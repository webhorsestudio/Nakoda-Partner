import React from 'react';
import { render, screen } from '@testing-library/react';
import FinancialInfo from '../FinancialInfo';

describe('FinancialInfo Component', () => {
  const defaultProps = {
    amount: 1000,
    advanceAmount: 200,
  };

  it('renders advance amount for all orders', () => {
    render(<FinancialInfo {...defaultProps} mode="online" />);
    
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
    expect(screen.getByText('₹200')).toBeInTheDocument();
    expect(screen.getByText('Advance')).toBeInTheDocument();
    expect(screen.queryByText('Not Required (COD)')).not.toBeInTheDocument();
  });

  it('renders advance amount for COD orders (no special treatment)', () => {
    render(<FinancialInfo {...defaultProps} mode="cod" />);
    
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
    expect(screen.getByText('₹200')).toBeInTheDocument();
    expect(screen.queryByText('Not Required (COD)')).not.toBeInTheDocument();
    
    // Check that advance amount has normal styling (not strikethrough)
    const advanceElement = screen.getByText('₹200');
    expect(advanceElement).toHaveClass('text-blue-700');
    expect(advanceElement).not.toHaveClass('line-through', 'text-gray-400');
  });

  it('renders advance amount for "cash on delivery" orders (no special treatment)', () => {
    render(<FinancialInfo {...defaultProps} mode="cash on delivery" />);
    
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
    expect(screen.getByText('₹200')).toBeInTheDocument();
    expect(screen.queryByText('Not Required (COD)')).not.toBeInTheDocument();
    
    const advanceElement = screen.getByText('₹200');
    expect(advanceElement).toHaveClass('text-blue-700');
    expect(advanceElement).not.toHaveClass('line-through', 'text-gray-400');
  });

  it('renders advance amount for "cash" orders (no special treatment)', () => {
    render(<FinancialInfo {...defaultProps} mode="cash" />);
    
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
    expect(screen.getByText('₹200')).toBeInTheDocument();
    expect(screen.queryByText('Not Required (COD)')).not.toBeInTheDocument();
    
    const advanceElement = screen.getByText('₹200');
    expect(advanceElement).toHaveClass('text-blue-700');
    expect(advanceElement).not.toHaveClass('line-through', 'text-gray-400');
  });

  it('handles case insensitive mode values', () => {
    render(<FinancialInfo {...defaultProps} mode="COD" />);
    
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
    expect(screen.getByText('₹200')).toBeInTheDocument();
    expect(screen.queryByText('Not Required (COD)')).not.toBeInTheDocument();
    
    const advanceElement = screen.getByText('₹200');
    expect(advanceElement).toHaveClass('text-blue-700');
    expect(advanceElement).not.toHaveClass('line-through', 'text-gray-400');
  });

  it('handles null mode gracefully', () => {
    render(<FinancialInfo {...defaultProps} mode={null} />);
    
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
    expect(screen.getByText('₹200')).toBeInTheDocument();
    expect(screen.queryByText('Not Required (COD)')).not.toBeInTheDocument();
  });

  it('handles undefined mode gracefully', () => {
    render(<FinancialInfo {...defaultProps} mode={undefined} />);
    
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
    expect(screen.getByText('₹200')).toBeInTheDocument();
    expect(screen.queryByText('Not Required (COD)')).not.toBeInTheDocument();
  });
});