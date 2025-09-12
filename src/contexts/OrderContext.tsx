import React, { createContext, useContext, ReactNode } from 'react';
import { useGlobalOrders } from '@/hooks/useGlobalOrders';
import { Task, PartnerInfo } from '@/lib/globalOrderManager';

interface OrderContextType {
  orders: Task[];
  isLoading: boolean;
  error: string | null;
  total: number;
  partner: PartnerInfo | null;
  refreshOrders: () => void;
  acceptOrder: (orderId: string) => Promise<boolean>;
  isAccepting: boolean;
  hasNewOrders: boolean;
  newOrdersCount: number;
  dismissNewOrdersNotification: () => void;
  cleanupOldOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
  refreshInterval?: number;
}

export function OrderProvider({ children, refreshInterval = 10000 }: OrderProviderProps) {
  const orderData = useGlobalOrders(refreshInterval);

  return (
    <OrderContext.Provider value={orderData}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
}
