import api from './client';

export const getRequestsForEntrepreneur = async (entrepreneurId: string) => {
  const { data } = await api.get(`/collaboration/entrepreneur/${entrepreneurId}`);
  return data as { requests: any[] };
};

export const getRequestsFromInvestor = async (investorId: string) => {
  const { data } = await api.get(`/collaboration/investor/${investorId}`);
  return data as { requests: any[] };
};

export const createCollaborationRequest = async (payload: {
  investorId: string;
  entrepreneurId: string;
  message: string;
}) => {
  const { data } = await api.post('/collaboration', payload);
  return data as { request: any };
};

export const updateRequestStatus = async (requestId: string, status: 'pending' | 'accepted' | 'rejected') => {
  const { data } = await api.patch(`/collaboration/${requestId}/status`, { status });
  return data as { request: any };
};
