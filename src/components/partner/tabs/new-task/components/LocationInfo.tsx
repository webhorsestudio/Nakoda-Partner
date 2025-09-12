import React from 'react';
import { MapPinIcon } from 'lucide-react';

interface LocationInfoProps {
  location: string;
}

export default function LocationInfo({ location }: LocationInfoProps) {
  return (
    <div className="flex items-center gap-3">
      <MapPinIcon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground truncate">{location}</span>
    </div>
  );
}
