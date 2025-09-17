import { useState, useMemo } from 'react';
import { OngoingTask } from '@/components/partner/tabs/ongoing/types';
import { usePartnerAuth } from './usePartnerAuth';

interface UseTaskFilteringProps {
  tasks: OngoingTask[];
}

interface UseTaskFilteringReturn {
  selectedFilter: string;
  filteredTasks: OngoingTask[];
  setSelectedFilter: (filter: string) => void;
  availableFilters: Array<{ id: string; label: string }>;
}

export function useTaskFiltering({ tasks }: UseTaskFilteringProps): UseTaskFilteringReturn {
  const { partnerInfo } = usePartnerAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Get only partner's service type
  const availableFilters = useMemo(() => {
    const filters = [{ id: 'all', label: 'All Services' }];
    
    // Add only partner's service type
    if (partnerInfo?.service_type) {
      filters.push({ 
        id: partnerInfo.service_type.toLowerCase().replace(/\s+/g, '-'), 
        label: partnerInfo.service_type 
      });
    }
    
    return filters;
  }, [partnerInfo?.service_type]);

  const filteredTasks = useMemo(() => {
    if (selectedFilter === 'all') {
      return tasks;
    }
    
    // Convert filter ID back to service type for comparison
    const serviceType = availableFilters.find(f => f.id === selectedFilter)?.label;
    if (!serviceType) return tasks;
    
    return tasks.filter(task => task.serviceType === serviceType);
  }, [tasks, selectedFilter, availableFilters]);

  return {
    selectedFilter,
    filteredTasks,
    setSelectedFilter,
    availableFilters
  };
}
