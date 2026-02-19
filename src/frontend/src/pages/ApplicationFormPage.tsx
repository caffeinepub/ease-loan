import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSubmitLoanApplication } from '../hooks/useLoanApplication';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ApplicationFormPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { mutate: submitApplication, isPending, isSuccess } = useSubmitLoanApplication();

  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    loanAmount: '',
    loanPurpose: '',
    employmentDetails: '',
    income: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAuthenticated = !!identity;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.applicantName.trim()) {
      newErrors.applicantName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.loanAmount.trim()) {
      newErrors.loanAmount = 'Loan amount is required';
    } else if (parseFloat(formData.loanAmount) <= 0) {
      newErrors.loanAmount = 'Loan amount must be greater than 0';
    }

    if (!formData.loanPurpose.trim()) {
      newErrors.loanPurpose = 'Loan purpose is required';
    }

    if (!formData.employmentDetails.trim()) {
      newErrors.employmentDetails = 'Employment details are required';
    }

    if (!formData.income.trim()) {
      newErrors.income = 'Monthly income is required';
    } else if (parseFloat(formData.income) <= 0) {
      newErrors.income = 'Income must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to submit an application');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const contactInfo = `Email: ${formData.email}, Phone: ${formData.phone}`;

    submitApplication({
      applicantName: formData.applicantName.trim(),
      contactInfo,
      loanAmount: parseFloat(formData.loanAmount),
      loanPurpose: formData.loanPurpose.trim(),
      employmentDetails: formData.employmentDetails.trim(),
      income: parseFloat(formData.income),
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto border-2 border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-3xl font-bold mb-4">Application Submitted!</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Thank you for applying with Ease Loan. We've received your application and will review it shortly. 
              Our team will contact you within 24-48 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate({ to: '/' })} size="lg">
                Return to Home
              </Button>
              <Button 
                onClick={() => {
                  setFormData({
                    applicantName: '',
                    email: '',
                    phone: '',
                    loanAmount: '',
                    loanPurpose: '',
                    employmentDetails: '',
                    income: '',
                  });
                  window.location.reload();
                }} 
                variant="outline"
                size="lg"
              >
                Submit Another Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Loan Application</h1>
          <p className="text-muted-foreground text-lg">
            Fill out the form below to apply for a loan. All fields are required.
          </p>
        </div>

        {!isAuthenticated && (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              Please login to submit a loan application. Click the "Login" button in the header to get started.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>
              Please provide accurate information to help us process your application quickly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="applicantName">Full Name *</Label>
                  <Input
                    id="applicantName"
                    value={formData.applicantName}
                    onChange={(e) => handleChange('applicantName', e.target.value)}
                    placeholder="Enter your full name"
                    disabled={isPending}
                    className={errors.applicantName ? 'border-destructive' : ''}
                  />
                  {errors.applicantName && (
                    <p className="text-sm text-destructive">{errors.applicantName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      disabled={isPending}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="9876543210"
                      disabled={isPending}
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Loan Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">Loan Amount (₹) *</Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      value={formData.loanAmount}
                      onChange={(e) => handleChange('loanAmount', e.target.value)}
                      placeholder="50000"
                      min="0"
                      step="1000"
                      disabled={isPending}
                      className={errors.loanAmount ? 'border-destructive' : ''}
                    />
                    {errors.loanAmount && (
                      <p className="text-sm text-destructive">{errors.loanAmount}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="income">Monthly Income (₹) *</Label>
                    <Input
                      id="income"
                      type="number"
                      value={formData.income}
                      onChange={(e) => handleChange('income', e.target.value)}
                      placeholder="30000"
                      min="0"
                      step="1000"
                      disabled={isPending}
                      className={errors.income ? 'border-destructive' : ''}
                    />
                    {errors.income && (
                      <p className="text-sm text-destructive">{errors.income}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanPurpose">Loan Purpose *</Label>
                  <Textarea
                    id="loanPurpose"
                    value={formData.loanPurpose}
                    onChange={(e) => handleChange('loanPurpose', e.target.value)}
                    placeholder="e.g., Home renovation, Business expansion, Education, Medical expenses"
                    rows={3}
                    disabled={isPending}
                    className={errors.loanPurpose ? 'border-destructive' : ''}
                  />
                  {errors.loanPurpose && (
                    <p className="text-sm text-destructive">{errors.loanPurpose}</p>
                  )}
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Employment Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="employmentDetails">Employment Details *</Label>
                  <Textarea
                    id="employmentDetails"
                    value={formData.employmentDetails}
                    onChange={(e) => handleChange('employmentDetails', e.target.value)}
                    placeholder="e.g., Software Engineer at ABC Company, Self-employed business owner, Government employee"
                    rows={3}
                    disabled={isPending}
                    className={errors.employmentDetails ? 'border-destructive' : ''}
                  />
                  {errors.employmentDetails && (
                    <p className="text-sm text-destructive">{errors.employmentDetails}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isPending || !isAuthenticated} 
                  className="flex-1"
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate({ to: '/' })}
                  disabled={isPending}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

