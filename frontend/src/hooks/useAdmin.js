import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

export const useAdminAnalytics = () =>
  useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/admin/analytics').then((r) => r.data),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

export const useAdminProperties = (params = {}) =>
  useQuery({
    queryKey: ['admin-properties', params],
    queryFn: () => api.get('/admin/properties', { params }).then((r) => r.data),
    retry: 1,
  });

export const useApproveProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isApproved }) =>
      api.patch(`/admin/properties/${id}/approve`, { isApproved }).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-properties'] });
      qc.invalidateQueries({ queryKey: ['admin-analytics'] });
      toast.success(vars.isApproved ? 'Огласот е одобрен' : 'Огласот е одбиен');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка'),
  });
};

export const useDeleteAdminProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/properties/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Огласот е избришан');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка'),
  });
};

export const useAdminBookings = (params = {}) =>
  useQuery({
    queryKey: ['admin-bookings', params],
    queryFn: () => api.get('/admin/bookings', { params }).then((r) => r.data),
    retry: 1,
  });

export const useUpdateBookingStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(`/admin/bookings/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      qc.invalidateQueries({ queryKey: ['admin-analytics'] });
      toast.success('Статусот е ажуриран');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка'),
  });
};

export const useAdminUsers = () =>
  useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
    retry: 1,
  });
