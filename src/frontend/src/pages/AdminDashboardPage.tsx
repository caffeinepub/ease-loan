import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useIsCallerAdmin';
import { useGetAllLoanApplications } from '../hooks/useGetAllLoanApplications';
import { useUpdateApplicationStatus } from '../hooks/useUpdateApplicationStatus';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { ApplicationStatus } from '../backend';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminDashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: applications, isLoading: applicationsLoading } = useGetAllLoanApplications();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateApplicationStatus();

  const isAuthenticated = !!identity;

  if (!isAuthenticated || (isAdminLoading === false && !isAdmin)) {
    return <AccessDeniedScreen />;
  }

  if (isAdminLoading || applicationsLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const pendingCount = applications?.filter(app => app.status === ApplicationStatus.pending).length || 0;
  const approvedCount = applications?.filter(app => app.status === ApplicationStatus.approved).length || 0;
  const rejectedCount = applications?.filter(app => app.status === ApplicationStatus.rejected).length || 0;
  const totalAmount = applications?.reduce((sum, app) => sum + app.loanAmount, 0) || 0;

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.pending:
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case ApplicationStatus.approved:
        return <Badge className="gap-1 bg-green-600 hover:bg-green-700"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>;
      case ApplicationStatus.rejected:
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleStatusChange = (applicationId: bigint, newStatus: string) => {
    updateStatus({
      applicationId,
      newStatus: newStatus as ApplicationStatus,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Manage and review all loan applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Applications
            </CardDescription>
            <CardTitle className="text-3xl">{applications?.length || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardDescription>
            <CardTitle className="text-3xl text-secondary">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Approved
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{approvedCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Amount
            </CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalAmount)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
          <CardDescription>
            Review and manage all submitted loan applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!applications || applications.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No loan applications have been submitted yet.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Loan Amount</TableHead>
                    <TableHead>Income</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.applicationId.toString()}>
                      <TableCell className="font-medium">#{app.applicationId.toString()}</TableCell>
                      <TableCell className="font-medium">{app.applicantName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {app.contactInfo}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {formatCurrency(app.loanAmount)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatCurrency(app.income)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {app.loanPurpose}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(app.applicationDate)}
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={app.status}
                          onValueChange={(value) => handleStatusChange(app.applicationId, value)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ApplicationStatus.pending}>Pending</SelectItem>
                            <SelectItem value={ApplicationStatus.approved}>Approved</SelectItem>
                            <SelectItem value={ApplicationStatus.rejected}>Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

