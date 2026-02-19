import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

interface SubmitLoanApplicationParams {
  applicantName: string;
  contactInfo: string;
  loanAmount: number;
  loanPurpose: string;
  employmentDetails: string;
  income: number;
}

export function useSubmitLoanApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitLoanApplicationParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitLoanApplication(
        params.applicantName,
        params.contactInfo,
        params.loanAmount,
        params.loanPurpose,
        params.employmentDetails,
        params.income
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanApplications'] });
      toast.success('Application submitted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit application: ${error.message}`);
    },
  });
}

