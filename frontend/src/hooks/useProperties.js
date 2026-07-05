import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const useProperties = (params = {}) =>
  useQuery({
    queryKey: ['properties', params],
    queryFn: () =>
      api.get('/properties', { params }).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });

export const useProperty = (id) =>
  useQuery({
    queryKey: ['property', id],
    queryFn: () => api.get(`/properties/${id}`).then((r) => r.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

export const useMyProperties = () =>
  useQuery({
    queryKey: ['my-properties'],
    queryFn: () => api.get('/properties/owner/me').then((r) => r.data),
  });

export const useCities = () =>
  useQuery({
    queryKey: ['cities'],
    queryFn: () => api.get('/properties/cities').then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

export const useAvailability = (propertyId, year, month) =>
  useQuery({
    queryKey: ['availability', propertyId, year, month],
    queryFn: () =>
      api.get(`/properties/${propertyId}/availability`, { params: { year, month } }).then((r) => r.data),
    enabled: !!propertyId && !!year && !!month,
  });

export const useCreateProperty = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data) => api.post('/properties', data).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['my-properties'] });
      toast.success('Огласот е создаден! Чека одобрување.');
      navigate(`/owner/properties/${data.id}/images`);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка при создавање'),
  });
};

export const useUpdateProperty = (id) => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data) => api.put(`/properties/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-properties'] });
      qc.invalidateQueries({ queryKey: ['property', id] });
      toast.success('Огласот е ажуриран');
      navigate('/owner/properties');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка при ажурирање'),
  });
};

export const useDeleteProperty = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/properties/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-properties'] });
      toast.success('Огласот е избришан');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка при бришење'),
  });
};

export const useUploadImages = (propertyId) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (files) => {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      return api.post(`/properties/${propertyId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property', propertyId] });
      toast.success('Сликите се прикачени');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка при прикачување'),
  });
};

export const useDeleteImage = (propertyId) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (imageId) =>
      api.delete(`/properties/${propertyId}/images/${imageId}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property', propertyId] });
      toast.success('Сликата е избришана');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка'),
  });
};
