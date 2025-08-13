import { CheckCircleIcon, ClockIcon, XCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    case "in_progress":
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    case "cancelled":
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    case "new":
      return <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />;
    default:
      return <ClockIcon className="h-5 w-5 text-gray-500" />;
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "new":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function formatDateOnly(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  } catch {
    return dateString;
  }
}
