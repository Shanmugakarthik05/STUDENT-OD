import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Upload, X, User, AlertTriangle, FileText, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { ODNotificationBanner } from './ODNotificationBanner';
import { TimePeriodSelector } from './TimePeriodSelector';
import { toast } from 'sonner@2.0.3';
import type { ODRequest } from '../App';
import { ALL_DEPARTMENTS, SCOFT_DEPARTMENTS, NON_SCOFT_DEPARTMENTS } from '../App';

interface ODRequestFormProps {
  currentUser: any;
  onSubmit: (requestData: Omit<ODRequest, 'id' | 'status' | 'submittedAt' | 'lastUpdated'>) => void;
  prefillData?: {
    fromDate?: string;
    toDate?: string;
    reason?: string;
    detailedReason?: string;
    description?: string;
  };
}

export function ODRequestForm({ currentUser, onSubmit, prefillData }: ODRequestFormProps) {
  const [formData, setFormData] = useState({
    studentDetails: {
      studentId: currentUser.id,
      studentName: currentUser.name,
      rollNumber: '',
      department: currentUser.department || '',
      year: '',
      phoneNumber: '',
      email: ''
    },
    fromDate: prefillData?.fromDate || '',
    toDate: prefillData?.toDate || '',
    odTime: [] as string[],
    reason: prefillData?.reason || '',
    detailedReason: prefillData?.detailedReason || '',
    description: prefillData?.description || '',
    documents: [] as File[]
  });

  const [dateError, setDateError] = useState<string>('');

  // Load student profile from localStorage on component mount
  useEffect(() => {
    const profileKey = `student_profile_${currentUser.id}`;
    const savedProfile = localStorage.getItem(profileKey);
    
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setFormData(prev => ({
          ...prev,
          studentDetails: {
            studentId: currentUser.id,
            studentName: profile.name || currentUser.name,
            rollNumber: profile.rollNumber || '',
            department: profile.department || currentUser.department || '',
            year: profile.year || '',
            phoneNumber: profile.phoneNumber || '',
            email: profile.email || ''
          }
        }));
      } catch (error) {
        console.error('Error loading student profile:', error);
      }
    }
  }, [currentUser.id, currentUser.name, currentUser.department]);

  const reasonOptions = [
    'Sports Competition',
    'Cultural Event',
    'Academic Conference',
    'Workshop/Seminar',
    'Job Interview',
    'Medical Appointment',
    'Family Emergency',
    'Research Work',
    'Other'
  ];

  // Validate OD date (must be at least 3 days in advance)
  const validateODDate = (fromDate: string, toDate?: string): boolean => {
    if (!fromDate) return false;
    
    const today = new Date();
    const startDate = new Date(fromDate);
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 3) {
      const requiredDate = new Date();
      requiredDate.setDate(today.getDate() + 3);
      setDateError(`OD requests must be submitted at least 3 days in advance. Please select a from date on or after ${requiredDate.toLocaleDateString()}.`);
      return false;
    }
    
    // Validate that toDate is not before fromDate
    if (toDate && new Date(toDate) < new Date(fromDate)) {
      setDateError('To date cannot be before from date.');
      return false;
    }
    
    setDateError('');
    return true;
  };

  const handleFromDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, fromDate: date }));
    if (date) {
      validateODDate(date, formData.toDate);
    } else {
      setDateError('');
    }
  };

  const handleToDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, toDate: date }));
    if (date && formData.fromDate) {
      validateODDate(formData.fromDate, date);
    } else {
      setDateError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.studentDetails.studentName || !formData.studentDetails.rollNumber || 
        !formData.studentDetails.department || !formData.studentDetails.year ||
        !formData.studentDetails.phoneNumber || !formData.studentDetails.email) {
      toast.error('Please fill in all student details');
      return;
    }

    if (!formData.fromDate || !formData.toDate || !formData.odTime.length || !formData.reason || !formData.detailedReason) {
      toast.error('Please fill in all OD request details');
      return;
    }

    // Validate OD dates
    if (!validateODDate(formData.fromDate, formData.toDate)) {
      toast.error('Invalid OD dates. Please check the 3-day advance requirement.');
      return;
    }

    onSubmit(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Important Notice */}
      <ODNotificationBanner type="warning" />

      {/* SECTION 1: STUDENT DETAILS */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50 space-y-1">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <User className="h-5 w-5 text-blue-600" />
            <span>Section 1: Student Details</span>
          </CardTitle>
          <CardDescription>
            All fields marked with <span className="text-red-500">*</span> are required
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentName" className="flex items-center">
                Student Name <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="studentName"
                value={formData.studentDetails.studentName}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  studentDetails: { ...prev.studentDetails, studentName: e.target.value }
                }))}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="flex items-center">
                Roll Number <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="rollNumber"
                value={formData.studentDetails.rollNumber}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  studentDetails: { ...prev.studentDetails, rollNumber: e.target.value }
                }))}
                placeholder="e.g., CSE001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center">
                Department <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select 
                value={formData.studentDetails.department}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  studentDetails: { ...prev.studentDetails, department: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header-scoft" disabled className="font-semibold text-blue-600">
                    SCOFT Departments
                  </SelectItem>
                  {SCOFT_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept} className="pl-4">
                      {dept}
                    </SelectItem>
                  ))}
                  <SelectItem value="header-non-scoft" disabled className="font-semibold text-purple-600">
                    NON-SCOFT Departments
                  </SelectItem>
                  {NON_SCOFT_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept} className="pl-4">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="flex items-center">
                Academic Year <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select 
                value={formData.studentDetails.year}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  studentDetails: { ...prev.studentDetails, year: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st Year</SelectItem>
                  <SelectItem value="2nd">2nd Year</SelectItem>
                  <SelectItem value="3rd">3rd Year</SelectItem>
                  <SelectItem value="4th">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center">
                Phone Number <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.studentDetails.phoneNumber}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  studentDetails: { ...prev.studentDetails, phoneNumber: e.target.value }
                }))}
                placeholder="+91 9876543210"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                Email Address <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.studentDetails.email}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  studentDetails: { ...prev.studentDetails, email: e.target.value }
                }))}
                placeholder="student@college.edu"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* SECTION 2: OD DATE RANGE */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Calendar className="h-5 w-5 text-green-600" />
            <span>Section 2: OD Date Range</span>
          </CardTitle>
          <CardDescription>
            Select from date and to date for your OD request
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate" className="flex items-center">
                From Date <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="fromDate"
                type="date"
                value={formData.fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
                min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                required
                className={dateError ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 3 days from today
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toDate" className="flex items-center">
                To Date <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="toDate"
                type="date"
                value={formData.toDate}
                onChange={(e) => handleToDateChange(e.target.value)}
                min={formData.fromDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                required
                className={dateError ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Same as from date for single day OD
              </p>
            </div>
          </div>

          {dateError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {dateError}
              </AlertDescription>
            </Alert>
          )}

          {formData.fromDate && formData.toDate && !dateError && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Selected Period:</strong> {new Date(formData.fromDate).toLocaleDateString()} 
                {formData.fromDate !== formData.toDate && ` to ${new Date(formData.toDate).toLocaleDateString()}`}
                {formData.fromDate === formData.toDate && ' (Single Day)'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* SECTION 3: TIME PERIODS */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Clock className="h-5 w-5 text-purple-600" />
            <span>Section 3: Time Periods</span>
          </CardTitle>
          <CardDescription>
            Select the time periods you need OD for
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <TimePeriodSelector
            selectedPeriods={formData.odTime}
            onPeriodsChange={(periods) => setFormData(prev => ({ ...prev, odTime: periods }))}
          />
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* SECTION 4: REASON FOR OD */}
      <Card className="border-2 border-orange-200">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <FileText className="h-5 w-5 text-orange-600" />
            <span>Section 4: Reason for OD</span>
          </CardTitle>
          <CardDescription>
            Provide category and detailed reason for your request
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="flex items-center">
              Category <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select 
              value={formData.reason}
              onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason category" />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="detailedReason" className="flex items-center">
              Detailed Reason <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="detailedReason"
              placeholder="Provide specific details about the reason for your OD (e.g., 'Inter-college basketball tournament at Anna University representing college team')"
              value={formData.detailedReason}
              onChange={(e) => setFormData(prev => ({ ...prev, detailedReason: e.target.value }))}
              required
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Include event name, organization, location, and your role
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Additional Information (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add any additional information that may be helpful for approval..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* SECTION 5: SUPPORTING DOCUMENTS */}
      <Card className="border-2 border-indigo-200">
        <CardHeader className="bg-indigo-50">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Upload className="h-5 w-5 text-indigo-600" />
            <span>Section 5: Supporting Documents</span>
          </CardTitle>
          <CardDescription>
            Upload invitation letters, registration proof, or other relevant documents (Optional but recommended)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Card className="border-dashed border-2 bg-gray-50">
            <CardContent className="p-6">
              <div className="text-center">
                <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <div className="text-sm text-gray-600 mb-3">
                  Upload supporting documents (PDF, DOC, JPG, PNG)
                </div>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload">
                  <Button type="button" variant="outline" className="pointer-events-none">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </Label>
                <p className="text-xs text-gray-500 mt-2">
                  Maximum file size: 5MB per file
                </p>
              </div>
            </CardContent>
          </Card>

          {formData.documents.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Files ({formData.documents.length})</Label>
              <div className="space-y-2">
                {formData.documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(file.size / 1024)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary and Submit */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="text-base">Request Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700 mb-2">Student Information:</div>
              <div className="space-y-1 text-xs">
                <div>Name: <span className="font-medium">{formData.studentDetails.studentName || '-'}</span></div>
                <div>Roll No: <span className="font-medium">{formData.studentDetails.rollNumber || '-'}</span></div>
                <div>Department: <span className="font-medium">{formData.studentDetails.department || '-'}</span></div>
                <div>Year: <span className="font-medium">{formData.studentDetails.year || '-'}</span></div>
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-700 mb-2">OD Information:</div>
              <div className="space-y-1 text-xs">
                <div>Dates: <span className="font-medium">
                  {formData.fromDate && formData.toDate 
                    ? `${new Date(formData.fromDate).toLocaleDateString()} - ${new Date(formData.toDate).toLocaleDateString()}`
                    : '-'
                  }
                </span></div>
                <div>Time Periods: <span className="font-medium">{formData.odTime.length || 0} selected</span></div>
                <div>Reason: <span className="font-medium">{formData.reason || '-'}</span></div>
                <div>Documents: <span className="font-medium">{formData.documents.length} file(s)</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 sticky bottom-0 bg-white pb-2 border-t">
        <Button 
          type="submit"
          className="bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Submit OD Request
        </Button>
      </div>
    </form>
  );
}