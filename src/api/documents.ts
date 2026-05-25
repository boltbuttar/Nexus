import api from './client';

export const getDocuments = async (ownerId?: string) => {
  const { data } = await api.get('/documents', { params: { ownerId } });
  return data as { documents: any[] };
};

export const uploadDocument = async (file: File, ownerId?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (ownerId) {
    formData.append('ownerId', ownerId);
  }

  const { data } = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data as { document: any };
};

export const updateDocument = async (id: string, updates: { shared?: boolean; status?: 'draft' | 'signed' }) => {
  const { data } = await api.patch(`/documents/${id}`, updates);
  return data as { document: any };
};

export const deleteDocument = async (id: string) => {
  const { data } = await api.delete(`/documents/${id}`);
  return data as { message: string };
};

export const uploadSignature = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('signature', file);

  const { data } = await api.post(`/documents/${id}/signature`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data as { document: any };
};
