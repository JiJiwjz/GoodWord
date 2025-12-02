import { useToastStore } from '../../store';
import { X, CheckCircle, XCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast. id}
          className={clsx(
            'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] animate-slide-in',
            {
              'bg-green-50 text-green-800 border border-green-200': toast.type === 'success',
              'bg-red-50 text-red-800 border border-red-200': toast.type === 'error',
              'bg-blue-50 text-blue-800 border border-blue-200': toast.type === 'info',
            }
          )}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5" />}
          {toast. type === 'info' && <Info className="w-5 h-5" />}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-black/10 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
