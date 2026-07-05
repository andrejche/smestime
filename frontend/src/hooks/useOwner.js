import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export const useMyListings = () =>
  useQuery({ queryKey: ['owner-listings'], queryFn: () => api.get('/owner/listings').then((r) => r.data) });

export const useMyListing = (id) =>
  useQuery({ queryKey: ['owner-listing', id], queryFn: () => api.get(`/owner/listings/${id}`).then((r) => r.data), enabled: !!id });

export const useCreateListing = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data) => api.post('/owner/listings', data).then((r) => r.data),
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['owner-listings'] }); toast.success('Огласот е создаден! Чека одобрување.'); navigate(`/owner/listings/${data.id}/images`); },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка'),
  });
};

export const useUpdateListing = (id) => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data) => api.put(`/owner/listings/${id}`, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['owner-listings'] }); qc.invalidateQueries({ queryKey: ['owner-listing', id] }); toast.success('Огласот е ажуриран'); navigate('/owner/listings'); },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка'),
  });
};

export const useDeleteListing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/owner/listings/${id}`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['owner-listings'] }); toast.success('Огласот е избришан'); },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка'),
  });
};

export const useUploadListingImages = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files) => {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      return api.post(`/owner/listings/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['owner-listing', id] }); toast.success('Сликите се прикачени'); },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка'),
  });
};

export const useDeleteListingImage = (listingId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId) => api.delete(`/owner/listings/${listingId}/images/${imageId}`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['owner-listing', listingId] }); toast.success('Сликата е избришана'); },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка'),
  });
};

export const useOwnerBookings = (params = {}) =>
  useQuery({ queryKey: ['owner-bookings', params], queryFn: () => api.get('/owner/bookings', { params }).then((r) => r.data) });

export const useOwnerUpdateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => api.patch(`/owner/bookings/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['owner-bookings'] }); toast.success('Статусот е ажуриран'); },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка'),
  });
};

export const useOwnerProfile = () =>
  useQuery({ queryKey: ['owner-profile'], queryFn: () => api.get('/owner/profile').then((r) => r.data) });

export const useUpdateOwnerProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.put('/owner/profile', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['owner-profile'] }); toast.success('Профилот е ажуриран'); },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка'),
  });
};

export const useRenewListing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/owner/listings/${id}/renew`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner-listings'] });
      toast.success('Огласот е обновен и е на врвот!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Грешка'),
  });
};
