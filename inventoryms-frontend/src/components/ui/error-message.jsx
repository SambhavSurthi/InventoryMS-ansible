import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const ErrorMessage = ({ 
  message, 
  onClose, 
  className = '',
  variant = 'default' 
}) => {
  if (!message) return null;

  const variants = {
    default: 'bg-red-50 border-red-200 text-red-800',
    destructive: 'bg-red-100 border-red-300 text-red-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className={cn(
      'flex items-center justify-between p-3 border rounded-md',
      variants[variant],
      className
    )}>
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 flex-shrink-0 text-current hover:opacity-75"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
