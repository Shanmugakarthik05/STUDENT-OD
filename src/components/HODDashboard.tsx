import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { CheckCircle, XCircle, Search, Filter, BarChart3, TrendingUp, Users, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Chart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CertificateManager } from './CertificateManager';
import type { User, ODRequest, Certificate } from '../App';

interface HODDashboardProps {
  user: User;
  odRequests: ODRequest[];
  setOdRequests: React.Dispatch<React.SetStateAction<ODRequest[]>>;
  certificates: Certificate[];
  setCertificates: React.Dispatch<React.SetStateAction<Certificate[]>>;
}

export function HODDashboard({ user, odRequests, setOdRequests, certificates, setCertificates }: HODDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<ODRequest | null>(null);
  const [feedback, setFeedback] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterReason, setFilterReason] = useState<string>('all');

  // Filter requests for HOD review (mentor approved)
  const hodReviewRequests = odRequests.filter(req => 
    req.studentDetails.department === user.department && 
    ['mentor_approved'].includes(req.status)
  );

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

  // Department statistics
  const departmentRequests = odRequests.filter(req => req.studentDetails.department === user.department);
  const totalRequests = departmentRequests.length;
  const approvedRequests = departmentRequests.filter(req => ['mentor_approved', 'completed', 'certificate_approved'].includes(req.status)).length;
  const pendingRequests = hodReviewRequests.length;
  const rejectedRequests = departmentRequests.filter(req => ['mentor_rejected'].includes(req.status)).length;

  // Analytics data
  const reasonStats = departmentRequests.reduce((acc, req) => {
    acc[req.reason] = (acc[req.reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reasonChartData = Object.entries(reasonStats).map(([reason, count]) => ({
    reason: reason.length > 15 ? reason.substring(0, 15) + '...' : reason,
    count
  }));

  const monthlyStats = departmentRequests.reduce((acc, req) => {
    const month = new Date(req.submittedAt).toLocaleDateString('en-US', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyChartData = Object.entries(monthlyStats).map(([month, count]) => ({
    month,
    count
  }));

  // Filter and search logic
  const filteredRequests = hodReviewRequests.filter(req => {
    const matchesSearch = req.studentDetails.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.studentDetails.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesReason = filterReason === 'all' || req.reason === filterReason;
    
    return matchesSearch && matchesStatus && matchesReason;
  });

  const handleFinalAction = (request: ODRequest, action: 'approve' | 'reject', feedbackText: string) => {
    // For HOD, we don't need to change status since the simplified workflow only requires mentor approval
    // HODs now only manage certificates
    const newStatus: ODRequest['status'] = action === 'approve' ? 'completed' : 'mentor_rejected';
    
    setOdRequests(prev => prev.map(req => 
      req.id === request.id 
        ? { 
            ...req, 
            status: newStatus,
            eventCompletedAt: action === 'approve' ? new Date().toISOString() : undefined,
            lastUpdated: new Date().toISOString()
          }
        : req
    ));

    toast.success(`Request ${action}ed successfully`);
    setSelectedRequest(null);
    setFeedback('');
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1>HOD Dashboard - {user.department}</h1>
          <p className="text-muted-foreground">Departmental oversight and final OD request approvals</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Requests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalRequests}</div>
              <p className="text-xs text-muted-foreground">Department total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-amber-600">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting final approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">{approvedRequests}</div>
              <p className="text-xs text-muted-foreground">Finally approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-red-600">{rejectedRequests}</div>
              <p className="text-xs text-muted-foreground">All rejections</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>OD Requests by Reason</CardTitle>
              <CardDescription>Distribution of OD reasons in your department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reasonChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="reason" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>OD requests over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Final Review Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Final Review Queue</CardTitle>
            <CardDescription>OD requests awaiting your final approval</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name or roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <Select value={filterReason} onValueChange={setFilterReason}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  {Object.keys(reasonStats).map(reason => (
                    <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No requests pending final approval</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Details</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Mentor Approval</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
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
                        <Badge className="bg-green-100 text-green-800">Mentor Approved</Badge>
                        {request.mentorFeedback && (
                          <div className="text-xs text-muted-foreground mt-1">
                            "{request.mentorFeedback}"
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setActionType('approve');
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Final Approve
                              </Button>
                            </DialogTrigger>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setActionType('reject');
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Final Reject
                              </Button>
                            </DialogTrigger>
                          </Dialog>
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
                {actionType === 'approve' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span>{actionType === 'approve' ? 'Final Approval' : 'Final Rejection'}</span>
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
                    {selectedRequest.mentorFeedback && (
                      <p><strong>Mentor Comment:</strong> {selectedRequest.mentorFeedback}</p>
                    )}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">
                  {actionType === 'approve' ? 'Final Approval Comments (Optional)' : 'Rejection Reason (Required)'}
                </Label>
                <Textarea
                  id="feedback"
                  placeholder={
                    actionType === 'approve' 
                      ? 'Add final approval comments...'
                      : 'Please provide reason for final rejection...'
                  }
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required={actionType === 'reject'}
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedRequest && handleFinalAction(selectedRequest, actionType, feedback)}
                  disabled={actionType === 'reject' && !feedback.trim()}
                  className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  {actionType === 'approve' ? 'Grant Final Approval' : 'Final Reject'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}