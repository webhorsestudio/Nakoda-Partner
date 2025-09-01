import { OrderDetails } from './types';

export const sampleOrderDetails: OrderDetails = {
  id: '1',
  title: 'Deep Cleaning Service',
  customerName: 'Sarah Johnson',
  location: 'Andheri West, Mumbai',
  amount: 2500,
  duration: '3-4 hours',
  serviceType: 'Cleaning',
  priority: 'high',
  isExclusive: true,
  countdown: '2:45:30',
  description: 'Complete deep cleaning of 2BHK apartment including kitchen, bathrooms, and living areas.',
  requirements: 'Professional cleaning equipment, eco-friendly products',
  advanceAmount: 1000,
  commission: '25%',
  
  // Extended order information
  orderNumber: 'NUS87638',
  orderDate: '2025-01-09',
  orderTime: '14:30',
  serviceDate: '2025-01-12',
  serviceTime: '09:00',
  status: 'pending',
  category: 'Home Services',
  subcategory: 'Deep Cleaning',
  
  // Customer details
  customerPhone: '+91 98765 43210',
  customerEmail: 'sarah.johnson@email.com',
  customerAddress: 'Flat 502, Building A, Sunshine Apartments, Andheri West',
  customerCity: 'Mumbai',
  customerPinCode: '400058',
  
  // Service details
  serviceInstructions: 'Focus on kitchen grease removal, bathroom sanitization, and living area dusting. Use eco-friendly cleaning products only.',
  specialRequirements: 'Customer has a pet cat - please ensure no cleaning products are harmful to pets.',
  estimatedDuration: '3-4 hours',
  
  // Financial details
  totalAmount: 2500,
  balanceAmount: 1500,
  commissionPercentage: '25%',
  commissionAmount: 625,
  taxesAndFees: 150,
  
  // Partner details
  assignedPartner: undefined,
  partnerNotes: undefined,
  
  // Additional info
  isUrgent: true,
  tags: ['Deep Cleaning', 'Eco-friendly', 'Pet-friendly', 'Urgent'],
  attachments: ['cleaning-checklist.pdf', 'apartment-layout.jpg']
};
