import toast from 'react-hot-toast';

export const useToast = () => {
  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);
  const loading = (message: string) => toast.loading(message);
  const dismiss = (toastId: string) => toast.dismiss(toastId);

  return { success, error, loading, dismiss };
};