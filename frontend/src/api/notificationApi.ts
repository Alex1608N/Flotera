import api from './vehicleApi';
import { User } from './userApi';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: () => api.get<Notification[]>('/notifications').then(res => res.data),
  getUnreadCount: () => api.get<number>('/notifications/unread-count').then(res => res.data),
  markAsRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  triggerScan: () => api.post('/notifications/test-scan'),
};
