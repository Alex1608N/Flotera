import api from './vehicleApi'; // reuse the configured axios instance

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'DRIVER';
  profilePictureUrl?: string;
}

export const userApi = {
  getCurrentUser: () => api.get<User>('/users/me').then(res => res.data),
  getAllDrivers: () => api.get<User[]>('/users/drivers').then(res => res.data),
  updateProfilePicture: (profilePictureUrl: string) => api.put<User>('/users/me/profile-picture', { profilePictureUrl }).then(res => res.data),
  updateName: (name: string) => api.put<User>('/users/me/name', { name }).then(res => res.data),
  updateOtherUserProfilePicture: (userId: string, profilePictureUrl: string) => api.put<User>(`/users/${userId}/profile-picture`, { profilePictureUrl }).then(res => res.data),
};
