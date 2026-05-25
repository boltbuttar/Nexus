import api from './client';

export const getConversations = async () => {
  const { data } = await api.get('/messages/conversations');
  return data as { conversations: any[] };
};

export const getMessagesWith = async (userId: string) => {
  const { data } = await api.get(`/messages/with/${userId}`);
  return data as { messages: any[] };
};

export const sendMessage = async (receiverId: string, content: string) => {
  const { data } = await api.post('/messages', { receiverId, content });
  return data as { message: any };
};
