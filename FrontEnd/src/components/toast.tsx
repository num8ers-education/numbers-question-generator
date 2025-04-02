// src/utils/toast.ts
import toast, { ToastOptions } from 'react-hot-toast';
import ToastWithDismiss from './ToastWithDismiss';

// Common toast styling
const commonToastStyle = {
  padding: '16px',
  borderRadius: '8px',
  background: '#ffffff',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  color: '#1f2937',
  fontSize: '14px',
};

// Custom toast options
const toastOptions: ToastOptions = {
  duration: 3500, // 5 seconds
  position: 'top-right',
  style: commonToastStyle,
};

// Helper functions to show different types of dismissible toasts
export const showToast = {
  // Use base toast function instead of toast.success to avoid double icons
  success: (message: string, options?: ToastOptions) => 
    toast(
      (t) => <ToastWithDismiss t={t} message={message} type="success" />,
      { 
        ...toastOptions, 
        ...options,
        className: 'border-l-4 border-green-500',
      }
    ),
  
  // Use base toast function instead of toast.error to avoid styling conflicts
  error: (message: string, options?: ToastOptions) => 
    toast(
      (t) => <ToastWithDismiss t={t} message={message} type="error" />,
      { 
        ...toastOptions, 
        ...options,
        className: 'border-l-4 border-red-500',
      }
    ),
  
  info: (message: string, options?: ToastOptions) => 
    toast(
      (t) => <ToastWithDismiss t={t} message={message} type="info" />,
      { 
        ...toastOptions, 
        ...options,
        className: 'border-l-4 border-blue-500',
      }
    ),

  // New warning type
  warning: (message: string, options?: ToastOptions) => 
    toast(
      (t) => <ToastWithDismiss t={t} message={message} type="warning" />,
      { 
        ...toastOptions, 
        ...options,
        className: 'border-l-4 border-yellow-500',
      }
    ),
};

// Export the original toast for direct usage if needed
export { toast };