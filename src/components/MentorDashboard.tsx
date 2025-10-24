import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { CheckCircle, XCircle, MessageSquare, Clock, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { User, ODRequest } from '../App';

interface MentorDashboardProps {
  user: User;
  odRequests: ODRequest[];
  setOdRequests: React.Dispatch<React.SetStateAction<ODRequest[]>>;
}

export function MentorDashboard({ user, odRequests, setOdRequests }: MentorDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<ODRequest | null>(null);
  const [feedback, setFeedback] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'return'>('approve');

  const menteeRequests = odRequests.filter(req => 
    user.mentees?.includes(req.studentDetails.studentId) && 
    ['submitted'].includes(req.status)
  );
  
  const totalMentees = user.mentees?.length || 0;
  const pendingRequests = menteeRequests.length;
  const thisMonthApproved = odRequests.filter(req => 
    user.mentees?.includes(req.studentDetails.studentId) && 
    req.status === 'mentor_approved' &&
    new Date(req.lastUpdated).getMonth() === new Date().getMonth()
  ).length;

  // Helper function to format time periods
  const formatTimePeriod = (odTime: string | string[]) => {
    if (typeof odTime === 'string') {
      if (odTime === 'full-day') {
        return 'Full Day (8:00 AM - 5:00 PM)';
      }
      
      if (odTime.includes('-')) {
        const [start, end] = odTime.split('-');
        const formatTime = (time: string) => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          return `${displayHour}:${minutes} ${ampm}`;
        };
        return `${formatTime(start)} - ${formatTime(end)}`;
      }
      
      return odTime;
    }
    
    if (Array.isArray(odTime) && odTime.length > 0) {
      const timeMap: Record<string, string> = {
        '08:00-09:00': '8-9',
        '09:00-10:00': '9-10', 
        '10:00-11:00': '10-11',
        '11:00-12:00': '11-12',
        '12:00-13:00': '12-1',
        '13:00-14:00': '1-2',
        '14:00-15:00': '2-3',
        '15:00-16:00': '3-4',
        '16:00-17:00': '4-5'
      };
      
      const periods = odTime.map(period => timeMap[period] || period);
      return `Periods: ${periods.join(', ')}`;
    }
    
    return 'No periods';
  };

  const handleAction = (request: ODRequest, action: 'approve' | 'reject' | 'return', feedbackText: string) => {
    let newStatus: ODRequest['status'];
    let feedbackField: 'mentorFeedback' | 'hodFeedback' = 'mentorFeedback';
    
    switch (action) {
      case 'approve':
        newStatus = 'mentor_approved';
        break;
      case 'reject':
        newStatus = 'mentor_rejected';
        break;
      case 'return':
        newStatus = 'submitted';
        break;
      default:
        return;
    }

    setOdRequests(prev => prev.map(req => 
      req.id === request.id 
        ? { 
            ...req, 
            status: newStatus, 
            [feedbackField]: feedbackText,
            mentorSignature: action === 'approve' ? user.name : undefined,
            mentorApprovedAt: action === 'approve' ? new Date().toISOString() : undefined,
            lastUpdated: new Date().toISOString()
          }
        : req
    ));

    toast.success(`Request ${action}ed successfully`);
    setSelectedRequest(null);
    setFeedback('');
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve':
        return <CheckCircle className="h-4 w-4" />;
      case 'reject':
        return <XCircle className="h-4 w-4" />;
      case 'return':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1>Mentor Dashboard</h1>
          <p className="text-muted-foreground">Review and approve OD requests from your mentees</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Mentees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalMentees}</div>
              <p className="text-xs text-muted-foreground">Students under guidance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-amber-600">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting your approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">This Month Approved</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">{thisMonthApproved}</div>
              <p className="text-xs text-muted-foreground">Requests approved</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Required Section */}
        <Card>
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
            <CardDescription>OD requests from your mentees awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            {menteeRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No pending requests from your mentees</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menteeRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div>{request.studentDetails.studentName}</div>
                          <div className="text-sm text-muted-foreground">{request.studentDetails.rollNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>
                            {request.fromDate === request.toDate 
                              ? new Date(request.fromDate).toLocaleDateString()
                              : `${new Date(request.fromDate).toLocaleDateString()} - ${new Date(request.toDate).toLocaleDateString()}`
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">{formatTimePeriod(request.odTime)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{request.reason}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {request.detailedReason}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionType('approve');
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>

                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionType('reject');
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>

                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionType('return');
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Return
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Action Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {getActionIcon(actionType)}
                <span>
                  {actionType === 'approve' && 'Approve Request'}
                  {actionType === 'reject' && 'Reject Request'}
                  {actionType === 'return' && 'Return for Corrections'}
                </span>
              </DialogTitle>
              <DialogDescription>
                {selectedRequest && (
                  <div className="space-y-2">
                    <p><strong>Student:</strong> {selectedRequest.studentDetails.studentName}</p>
                    <p><strong>Date:</strong> {
                      selectedRequest.fromDate === selectedRequest.toDate 
                        ? new Date(selectedRequest.fromDate).toLocaleDateString()
                        : `${new Date(selectedRequest.fromDate).toLocaleDateString()} - ${new Date(selectedRequest.toDate).toLocaleDateString()}`
                    }</p>
                    <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                    <p><strong>Detailed Reason:</strong> {selectedRequest.detailedReason}</p>
                    {selectedRequest.description && <p><strong>Additional Description:</strong> {selectedRequest.description}</p>}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">
                  {actionType === 'approve' ? 'Approval Comments (Optional)' : 'Feedback (Required)'}
                </Label>
                <Textarea
                  id="feedback"
                  placeholder={
                    actionType === 'approve' 
                      ? 'Add any comments for this approval...'
                      : actionType === 'reject'
                      ? 'Please provide reason for rejection...'
                      : 'Please specify what needs to be corrected...'
                  }
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required={actionType !== 'approve'}
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedRequest && handleAction(selectedRequest, actionType, feedback)}
                  disabled={actionType !== 'approve' && !feedback.trim()}
                  className={
                    actionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700'
                      : actionType === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }
                >
                  {actionType === 'approve' && 'Approve Request'}
                  {actionType === 'reject' && 'Reject Request'}
                  {actionType === 'return' && 'Return for Corrections'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}