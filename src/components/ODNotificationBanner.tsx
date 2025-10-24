import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle, Clock, Info } from 'lucide-react';

interface ODNotificationBannerProps {
  type?: 'info' | 'warning' | 'error';
  className?: string;
}

export function ODNotificationBanner({ type = 'info', className = '' }: ODNotificationBannerProps) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <Alert className={`${getStyles()} ${className}`}>
      {getIcon()}
      <AlertTitle className="flex items-center space-x-2">
        <Clock className="h-4 w-4" />
        <span>Important: OD Submission Policy</span>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          <p className="font-medium">
            All OD requests must be submitted at least <strong>3 days in advance</strong> of the event date.
          </p>
          <p className="text-sm">
            Late submissions will <strong>not be accepted</strong>. Plan ahead and submit your requests early to ensure proper approval workflow.
          </p>
          <div className="text-xs mt-2 p-2 bg-white/60 rounded border">
            <strong>Example:</strong> For an event on Friday, submit your OD request by Tuesday or earlier.
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}