export interface OngoingOrderDetails {
  id: string;
  title: string;
  description: string;
  package?: string; // Package field from database
  customerName: string;
  location: string;
  amount: number;
  duration: string;
  serviceType: string;
  orderNumber: string;
  orderDate: string;
  serviceDate: string;
  serviceTime: string;
  status: 'in-progress' | 'completed' | 'cancelled' | 'assigned';
  startTime?: string;
  estimatedEndTime?: string;
  actualStartTime?: string;
  currentPhase: string;
  notes?: string;
  photos?: string[];
  customerPhone: string;
  customerAddress: string;
  advanceAmount: number;
  balanceAmount: number;
  commissionAmount: number;
  mode?: string | null; // Payment mode (COD, online, etc.)
  
  // Additional fields for order details
  customerEmail?: string;
  customerCity: string;
  customerPinCode: string;
  serviceInstructions?: string;
  specialRequirements?: string;
  requirements?: string;
  category: string;
  subcategory?: string;
  
  // Financial details
  totalAmount: number;
  commissionPercentage?: string;
  taxesAndFees?: number;
  
  // Partner details
  assignedPartner?: string;
  partnerNotes?: string;
  
  // Additional info
  isUrgent?: boolean;
  isExclusive?: boolean;
  tags?: string[];
  attachments?: string[];
}

export interface OngoingOrderDetailsProps {
  orderId: string;
  onClose: () => void;
  onStartTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
}

export interface OngoingOrderDetailsHeaderProps {
  order: OngoingOrderDetails;
  onClose: () => void;
}

export interface OngoingCustomerInfoSectionProps {
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    pinCode: string;
  };
  taskId: string;
}

export interface OngoingServiceDetailsSectionProps {
  service: {
    title: string;
    category: string;
    subcategory?: string;
    description: string;
    instructions?: string;
    requirements?: string;
    specialRequirements?: string;
    estimatedDuration: string;
    serviceDate: string;
    serviceTime: string;
    status: 'in-progress' | 'completed' | 'cancelled' | 'assigned';
    startTime?: string;
    estimatedEndTime?: string;
    actualStartTime?: string;
    currentPhase: string;
  };
}

export interface OngoingFinancialDetailsSectionProps {
  financial: {
    totalAmount: number;
    advanceAmount: number;
    balanceAmount: number;
    commissionAmount: number;
    mode?: string | null;
  };
}

export interface OngoingOrderActionsProps {
  serviceDate: string;
  serviceTime: string;
  status: 'in-progress' | 'completed' | 'cancelled' | 'assigned';
  onTaskExpired?: () => void;
  onTaskCompleted?: (taskId: string) => void;
  taskId?: string;
}
