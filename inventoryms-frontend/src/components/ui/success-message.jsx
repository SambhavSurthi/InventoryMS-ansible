import { CheckCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const SuccessMessage = ({ 
  message, 
  onClose, 
  className = '',
  variant = 'default' 
}) => {
  if (!message) return null;

  const variants = {
    default: 'bg-green-50 border-green-200 text-green-800',
    success: 'bg-green-100 border-green-300 text-green-900',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className={cn(
      'flex items-center justify-between p-3 border rounded-md',
      variants[variant],
      className
    )}>
      <div className="flex items-center space-x-2">
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
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

export default SuccessMessage;
