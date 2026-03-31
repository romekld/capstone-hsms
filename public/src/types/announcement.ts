export type AnnouncementCategory = 'Health Advisory' | 'Events' | 'Notices';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  published_at: string; // ISO 8601 format
  is_published: boolean;
  author_name: string;
  category?: AnnouncementCategory;
  summary?: string;
  image_url?: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  contact_info: string;
  operating_hours?: string;
}

export interface ApiResponse<T> {
  data: T | T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AnnouncementListResponse extends ApiResponse<Announcement[]> {
  data: Announcement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ServiceListResponse extends ApiResponse<Service[]> {
  data: Service[];
}
