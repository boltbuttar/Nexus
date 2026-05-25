import api from './client';

export const getUsers = async (role?: string, search?: string) => {
  const { data } = await api.get('/users', { params: { role, search } });
  return data as { users: any[] };
};

export const getUser = async (id: string) => {
  const { data } = await api.get(`/users/${id}`);
  return data as { user: any };
};

export const updateMe = async (updates: Record<string, any>) => {
  const { data } = await api.patch('/users/me', updates);
  return data as { user: any };
};
