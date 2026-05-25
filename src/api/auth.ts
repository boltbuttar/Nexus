import api from './client';
import { UserRole } from '../types';

export const login = async (email: string, password: string, role: UserRole) => {
  const { data } = await api.post('/auth/login', { email, password, role });
  return data as { token: string; user: any };
};

export const register = async (name: string, email: string, password: string, role: UserRole) => {
  const { data } = await api.post('/auth/register', { name, email, password, role });
  return data as { token: string; user: any };
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data as { user: any };
};

export const forgotPassword = async (email: string) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data as { message: string };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const { data } = await api.post('/auth/reset-password', { token, newPassword });
  return data as { message: string };
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const { data } = await api.post('/auth/change-password', { currentPassword, newPassword });
  return data as { message: string };
};

export const requestOtp = async () => {
  const { data } = await api.post('/auth/request-otp', {});
  return data as { message: string };
};

export const verifyOtp = async (code: string) => {
  const { data } = await api.post('/auth/verify-otp', { code });
  return data as { message: string };
};
