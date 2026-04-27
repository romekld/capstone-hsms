import axios from 'axios';
import { mockAnnouncementList, mockServiceList } from './mockData';
import { Announcement, AnnouncementCategory, AnnouncementListResponse, ServiceListResponse } from '../types/announcement';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance for real API calls
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicApi = {
  getAnnouncements: async (page = 1, limit = 20): Promise<AnnouncementListResponse> => {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockAnnouncementList;
    }
    
    const response = await apiClient.get(`/api/public/announcements?page=${page}&limit=${limit}`);
    return {
      ...response.data,
      data: (response.data?.data ?? []).map(normalizeAnnouncement),
    };
  },
  
  getAnnouncement: async (id: number): Promise<{ data: Announcement }> => {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      const announcement = mockAnnouncementList.data.find(a => a.id === id);
      if (!announcement) {
        throw new Error('Announcement not found');
      }
      return { data: announcement };
    }
    
    const response = await apiClient.get(`/api/public/announcements/${id}`);
    return {
      ...response.data,
      data: normalizeAnnouncement(response.data?.data),
    };
  },
  
  getServices: async (): Promise<ServiceListResponse> => {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockServiceList;
    }
    
    const response = await apiClient.get('/api/public/services');
    return response.data;
  },

  getPublicAnnouncements: async (): Promise<Announcement[]> => {
    const response = await publicApi.getAnnouncements(1, 60);
    return response.data;
  },
};

function normalizeAnnouncement(announcement: Announcement): Announcement {
  const fallbackCategory: AnnouncementCategory = inferCategory(announcement);
  const summary = announcement.summary ?? announcement.content?.slice(0, 140)?.trim();

  return {
    ...announcement,
    category: announcement.category ?? fallbackCategory,
    summary: summary && summary.length > 0 ? `${summary.replace(/\s+/g, ' ').trim()}${summary.length >= 140 ? '...' : ''}` : '',
  };
}

function inferCategory(announcement: Announcement): AnnouncementCategory {
  const text = `${announcement.title} ${announcement.content}`.toLowerCase();

  if (text.includes('vaccine') || text.includes('advisory') || text.includes('health')) {
    return 'Health Advisory';
  }

  if (text.includes('launch') || text.includes('campaign') || text.includes('event') || text.includes('program')) {
    return 'Events';
  }

  return 'Notices';
}
