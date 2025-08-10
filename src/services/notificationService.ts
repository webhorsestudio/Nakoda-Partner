import toast from "react-hot-toast";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationOptions {
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

class NotificationService {
  // Success notification
  success(message: string, options?: NotificationOptions) {
    return toast.success(message, {
      duration: options?.duration || 3000,
      style: {
        background: '#10B981',
        color: '#fff',
        border: '1px solid #059669',
      },
    });
  }

  // Error notification
  error(message: string, options?: NotificationOptions) {
    return toast.error(message, {
      duration: options?.duration || 5000,
      style: {
        background: '#EF4444',
        color: '#fff',
        border: '1px solid #DC2626',
      },
    });
  }

  // Warning notification
  warning(message: string, options?: NotificationOptions) {
    return toast(message, {
      duration: options?.duration || 4000,
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
        border: '1px solid #D97706',
      },
    });
  }

  // Info notification
  info(message: string, options?: NotificationOptions) {
    return toast(message, {
      duration: options?.duration || 4000,
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
        border: '1px solid #2563EB',
      },
    });
  }

  // Loading notification
  loading(message: string) {
    return toast.loading(message, {
      style: {
        background: '#6B7280',
        color: '#fff',
        border: '1px solid #4B5563',
      },
    });
  }

  // Dismiss specific toast
  dismiss(toastId: string) {
    toast.dismiss(toastId);
  }

  // Dismiss all toasts
  dismissAll() {
    toast.dismiss();
  }

  // Promise-based notification
  async promise<T>(
    promise: Promise<T>,
    {
      loading = "Loading...",
      success = "Success!",
      error = "Something went wrong!",
    }: {
      loading?: string;
      success?: string;
      error?: string;
    } = {}
  ): Promise<T> {
    const loadingToast = this.loading(loading);
    
    try {
      const result = await promise;
      toast.dismiss(loadingToast);
      this.success(success);
      return result;
    } catch (err) {
      toast.dismiss(loadingToast);
      this.error(error);
      throw err;
    }
  }
}

export const notificationService = new NotificationService();
