import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ApplicationStatus } from '../backend';
import { toast } from 'sonner';

interface UpdateApplicationStatusParams {
  applicationId: bigint;
  newStatus: ApplicationStatus;
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateApplicationStatusParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateApplicationStatus(params.applicationId, params.newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanApplications'] });
      toast.success('Application status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}

