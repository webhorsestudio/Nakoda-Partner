import { useMemo } from 'react';
import { OngoingTask } from '@/components/partner/tabs/ongoing/types';

interface UseTaskStatisticsProps {
  tasks: OngoingTask[];
}

interface UseTaskStatisticsReturn {
  totalTasks: number;
  activeTasks: number;
  completedToday: number;
  assignedTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  cancelledTasks: number;
}

export function useTaskStatistics({ tasks }: UseTaskStatisticsProps): UseTaskStatisticsReturn {
  const statistics = useMemo(() => {
    const totalTasks = tasks.length;
    
    const activeTasks = tasks.filter(task => 
      task.status === 'in-progress' || task.status === 'assigned'
    ).length;
    
    const completedToday = tasks.filter(task => 
      task.status === 'completed'
    ).length;
    
    const assignedTasks = tasks.filter(task => 
      task.status === 'assigned'
    ).length;
    
    const inProgressTasks = tasks.filter(task => 
      task.status === 'in-progress'
    ).length;
    
    const completedTasks = tasks.filter(task => 
      task.status === 'completed'
    ).length;
    
    const cancelledTasks = tasks.filter(task => 
      task.status === 'cancelled'
    ).length;

    return {
      totalTasks,
      activeTasks,
      completedToday,
      assignedTasks,
      inProgressTasks,
      completedTasks,
      cancelledTasks
    };
  }, [tasks]);

  return statistics;
}
