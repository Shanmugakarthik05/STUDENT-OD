import React from 'react';
import { Progress } from './ui/progress';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface StatusTrackerProps {
  status: string;
}

export function StatusTracker({ status }: StatusTrackerProps) {
  const getProgress = () => {
    switch (status) {
      case 'submitted':
        return 25;
      case 'mentor_approved':
        return 50;
      case 'completed':
        return 75;
      case 'certificate_uploaded':
        return 85;
      case 'certificate_approved':
        return 100;
      case 'mentor_rejected':
        return 0;
      default:
        return 0;
    }
  };

  const getSteps = () => {
    const steps = [
      { label: 'Submitted', status: 'submitted' },
      { label: 'Mentor Review', status: 'mentor_review' },
      { label: 'HOD Review', status: 'hod_review' },
      { label: 'Final Decision', status: 'approved' }
    ];

    return steps.map((step, index) => {
      let stepStatus: 'completed' | 'current' | 'pending' | 'rejected' = 'pending';
      
      if (status === 'rejected' || status === 'mentor_rejected') {
        stepStatus = index === 0 ? 'completed' : 'rejected';
      } else if (status === 'submitted' && index === 0) {
        stepStatus = 'current';
      } else if (status === 'mentor_review' && index <= 1) {
        stepStatus = index === 1 ? 'current' : 'completed';
      } else if ((status === 'mentor_approved' || status === 'hod_review') && index <= 2) {
        stepStatus = index === 2 ? 'current' : 'completed';
      } else if (status === 'approved') {
        stepStatus = 'completed';
      }
      
      return { ...step, stepStatus };
    });
  };

  const steps = getSteps();
  const progress = getProgress();
  const isRejected = status === 'rejected' || status === 'mentor_rejected';

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div key={step.status} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step.stepStatus === 'completed' 
                ? 'bg-green-500 border-green-500 text-white' 
                : step.stepStatus === 'current'
                ? 'bg-blue-500 border-blue-500 text-white'
                : step.stepStatus === 'rejected'
                ? 'bg-red-500 border-red-500 text-white'
                : 'bg-gray-200 border-gray-300 text-gray-500'
            }`}>
              {step.stepStatus === 'completed' && <CheckCircle className="w-4 h-4" />}
              {step.stepStatus === 'current' && <Clock className="w-4 h-4" />}
              {step.stepStatus === 'rejected' && <XCircle className="w-4 h-4" />}
              {step.stepStatus === 'pending' && <span className="text-xs">{index + 1}</span>}
            </div>
            <span className="text-xs mt-1 text-center">{step.label}</span>
          </div>
        ))}
      </div>
      
      <Progress 
        value={progress} 
        className={`h-2 ${isRejected ? 'bg-red-100' : ''}`}
      />
      
      <div className="text-xs text-center mt-1 text-muted-foreground">
        {isRejected ? 'Request Rejected' : `${progress}% Complete`}
      </div>
    </div>
  );
}