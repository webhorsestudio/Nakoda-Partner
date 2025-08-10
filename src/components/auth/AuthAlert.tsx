import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

interface AuthAlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export default function AuthAlert({ type, message }: AuthAlertProps) {
  const getAlertStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircleIcon,
          className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800",
          iconClassName: "text-green-500",
          iconBg: "bg-green-100"
        };
      case "error":
        return {
          icon: ExclamationTriangleIcon,
          className: "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800",
          iconClassName: "text-red-500",
          iconBg: "bg-red-100"
        };
      case "warning":
        return {
          icon: ExclamationTriangleIcon,
          className: "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800",
          iconClassName: "text-yellow-500",
          iconBg: "bg-yellow-100"
        };
      case "info":
        return {
          icon: InformationCircleIcon,
          className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800",
          iconClassName: "text-blue-500",
          iconBg: "bg-blue-100"
        };
      default:
        return {
          icon: InformationCircleIcon,
          className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800",
          iconClassName: "text-blue-500",
          iconBg: "bg-blue-100"
        };
    }
  };

  const styles = getAlertStyles();
  const Icon = styles.icon;

  return (
    <div className={`rounded-2xl border-2 p-4 ${styles.className} shadow-sm backdrop-blur-sm animate-fade-in-up`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 p-2 rounded-xl ${styles.iconBg}`}>
          <Icon className={`h-5 w-5 ${styles.iconClassName}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}
