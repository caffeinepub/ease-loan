import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { LoanApplication } from '../backend';

export function useGetAllLoanApplications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LoanApplication[]>({
    queryKey: ['loanApplications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLoanApplications();
    },
    enabled: !!actor && !actorFetching,
  });
}

