import api from './client';

export const getTransactions = async () => {
  const { data } = await api.get('/payments/transactions');
  return data as { transactions: any[] };
};

export const deposit = async (amount: number, currency = 'USD') => {
  const { data } = await api.post('/payments/deposit', { amount, currency });
  return data as { transaction: any; paymentIntentClientSecret?: string };
};

export const withdraw = async (amount: number, currency = 'USD') => {
  const { data } = await api.post('/payments/withdraw', { amount, currency });
  return data as { transaction: any };
};

export const transfer = async (amount: number, receiverId: string, currency = 'USD') => {
  const { data } = await api.post('/payments/transfer', { amount, receiverId, currency });
  return data as { transaction: any };
};
