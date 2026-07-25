import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

export const useAdminStats = () =>
  useQuery({ queryKey: ['admin-stats'], queryFn: () => api.get('/admin/stats').then((r) => r.data) });

export const useAdminProperties = (params = {}) =>
  useQuery({
    queryKey: ['admin-properties', params],
    queryFn: () => api.get('/admin/properties', { params }).then((r) => r.data),
  });

export const useAdminUsers = () =>
  useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
  });

export const useAdminBookings = () =>
  useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => api.get('/admin/bookings').then((r) => r.data),
  });

export const useApproveProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isApproved }) => api.patch(`/admin/properties/${id}/approve`, { isApproved }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-properties'] }); toast.success('Статусот е ажуриран'); },
    onError: () => toast.error('Грешка'),
  });
};

export const useDeleteAdminProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/properties/${id}`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-properties'] }); toast.success('Огласот е избришан'); },
    onError: () => toast.error('Грешка'),
  });
};

export const useToggleUserActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/admin/users/${id}/toggle`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Статусот е ажуриран'); },
    onError: () => toast.error('Грешка'),
  });
};
