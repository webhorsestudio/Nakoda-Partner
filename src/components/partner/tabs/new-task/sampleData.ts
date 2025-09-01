import { Task } from './types';

export const sampleTasks: Task[] = [
  {
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
    commission: '25%'
  },
  {
    id: '2',
    title: 'Plumbing Repair',
    customerName: 'Rajesh Kumar',
    location: 'Bandra East, Mumbai',
    amount: 1800,
    duration: '2-3 hours',
    serviceType: 'Plumbing',
    priority: 'medium',
    isExclusive: false,
    countdown: '1:30:15',
    description: 'Fix leaking tap and replace bathroom faucet. Customer has materials ready.',
    requirements: 'Basic plumbing tools, replacement parts if needed',
    advanceAmount: 800,
    commission: '20%'
  },
  {
    id: '3',
    title: 'Electrical Installation',
    customerName: 'Priya Sharma',
    location: 'Juhu, Mumbai',
    amount: 3200,
    duration: '4-5 hours',
    serviceType: 'Electrical',
    priority: 'high',
    isExclusive: true,
    countdown: '4:15:45',
    description: 'Install new ceiling fan, replace old switches, and add new power outlets.',
    requirements: 'Electrical tools, safety equipment, new fixtures provided by customer',
    advanceAmount: 1500,
    commission: '30%'
  },
  {
    id: '4',
    title: 'Carpentry Work',
    customerName: 'Amit Patel',
    location: 'Powai, Mumbai',
    amount: 2200,
    duration: '3-4 hours',
    serviceType: 'Carpentry',
    priority: 'low',
    isExclusive: false,
    countdown: '5:20:10',
    description: 'Assemble new furniture, fix loose cabinet doors, and install curtain rods.',
    requirements: 'Basic carpentry tools, customer has all materials',
    advanceAmount: 1000,
    commission: '22%'
  }
];
