import api from './client';

export const getMeetings = async () => {
  const { data } = await api.get('/meetings');
  return data as { meetings: any[] };
};

export const createMeeting = async (payload: {
  participantId: string;
  title?: string;
  notes?: string;
  location?: string;
  timeZone?: string;
  startTime: string;
  endTime: string;
}) => {
  const { data } = await api.post('/meetings', payload);
  return data as { meeting: any };
};

export const updateMeetingStatus = async (id: string, status: 'accepted' | 'rejected' | 'cancelled') => {
  const { data } = await api.patch(`/meetings/${id}/status`, { status });
  return data as { meeting: any };
};
