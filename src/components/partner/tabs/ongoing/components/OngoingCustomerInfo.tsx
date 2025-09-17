import React from 'react';
import { UserIcon } from 'lucide-react';

interface OngoingCustomerInfoProps {
  customerName: string;
  customerPhone: string;
}

export default function OngoingCustomerInfo({ customerName, customerPhone }: OngoingCustomerInfoProps) {
  return (
    <div className="flex items-center gap-3">
      <UserIcon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{customerName}</p>
      </div>
    </div>
  );
}
