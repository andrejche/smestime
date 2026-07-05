import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/auth.store';

export const useLogin = (redirectTo) => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data) => api.post('/auth/login', data).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success('Добредојде!');
      if (redirectTo) {
        navigate(redirectTo);
      } else if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'owner') {
        navigate('/owner');
      } else {
        navigate('/');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Невалидни податоци');
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api.post('/auth/logout').then((r) => r.data),
    onSettled: () => {
      clearAuth();
      navigate('/');
      toast.success('Одјавен');
    },
  });
};

export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data.user),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
