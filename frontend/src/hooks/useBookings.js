import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

export const useMyBookings = (params = {}) =>
  useQuery({
    queryKey: ['my-bookings', params],
    queryFn: () => api.get('/bookings/my', { params }).then((r) => r.data),
  });

export const useOwnerBookings = (params = {}) =>
  useQuery({
    queryKey: ['owner-bookings', params],
    queryFn: () => api.get('/bookings/owner', { params }).then((r) => r.data),
  });

export const usePropertyBookings = (propertyId) =>
  useQuery({
    queryKey: ['property-bookings', propertyId],
    queryFn: () => api.get(`/bookings/property/${propertyId}`).then((r) => r.data),
    enabled: !!propertyId,
  });

export const useBooking = (id) =>
  useQuery({
    queryKey: ['booking', id],
    queryFn: () => api.get(`/bookings/${id}`).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateBooking = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/bookings', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Резервацијата е успешно направена!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка при резервација'),
  });
};

export const useUpdateBookingStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, cancellationReason }) =>
      api.patch(`/bookings/${id}/status`, { status, cancellationReason }).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      qc.invalidateQueries({ queryKey: ['owner-bookings'] });
      qc.invalidateQueries({ queryKey: ['booking', data.id] });
      const msgs = { confirmed: 'Резервацијата е потврдена', cancelled: 'Резервацијата е откажана', completed: 'Резервацијата е завршена' };
      toast.success(msgs[data.status] || 'Статусот е ажуриран');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка'),
  });
};
