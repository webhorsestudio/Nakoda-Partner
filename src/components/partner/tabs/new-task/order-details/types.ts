export interface Task {
  id: string;
  title: string;
  customerName: string;
  location: string;
  amount: number;
  duration: string;
  serviceType: string;
  priority: string;
  isExclusive: boolean;
  countdown: string;
  description: string;
  requirements: string;
  advanceAmount: number;
  commission: string;
}

export interface OrderDetails extends Task {
  // Extended task information
  orderNumber: string;
  orderDate: string;
  orderTime: string;
  serviceDate: string;
  serviceTime: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  category: string;
  subcategory?: string;
  
  // Customer details
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  customerCity: string;
  customerPinCode: string;
  
  // Service details
  serviceInstructions: string;
  specialRequirements?: string;
  estimatedDuration: string;
  
  // Financial details
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  commissionPercentage: string;
  commissionAmount: number;
  taxesAndFees: number;
  
  // Partner details
  assignedPartner?: string;
  partnerNotes?: string;
  
  // Additional info
  isUrgent: boolean;
  isExclusive: boolean;
  tags: string[];
  attachments?: string[];
}

export interface OrderDetailsProps {
  orderId: string;
  onClose: () => void;
  onAcceptOrder: (orderId: string) => void;
}

export interface OrderDetailsHeaderProps {
  order: OrderDetails;
  onClose?: () => void;
}

export interface CustomerInfoSectionProps {
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    pinCode: string;
  };
}

export interface ServiceDetailsSectionProps {
  service: {
    title: string;
    category: string;
    subcategory?: string;
    description: string;
    instructions: string;
    requirements: string;
    specialRequirements?: string;
    estimatedDuration: string;
    serviceDate: string;
    serviceTime: string;
  };
}

export interface FinancialDetailsSectionProps {
  financial: {
    totalAmount: number;
    advanceAmount: number;
  };
}

export interface OrderActionsProps {
  orderId: string;
  status: string;
  onAcceptOrder: (orderId: string) => void;
  onClose?: () => void;
  isAccepting?: boolean;
}
