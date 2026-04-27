import { Announcement, Service, AnnouncementListResponse, ServiceListResponse } from '../types/announcement';

export const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "CHO2 Launches New Health Campaign",
    content: "We are excited to announce the launch of our comprehensive health campaign for Dasmariñas City. This initiative focuses on preventive care, health education, and community wellness programs that will benefit all residents.",
    published_at: "2024-03-15T10:00:00Z",
    is_published: true,
    author_name: "Dr. Maria Santos",
    category: "Events",
    summary: "A city-wide preventive care campaign starts this month across all CHO2 community stations.",
    image_url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 2,
    title: "Free Vaccination Schedule Update",
    content: "The vaccination schedule for children and adults has been updated for the month of March. Please visit our health centers during operating hours to avail of free vaccines including flu, COVID-19 boosters, and routine immunizations.",
    published_at: "2024-03-10T14:30:00Z",
    is_published: true,
    author_name: "Nurse Juan Cruz",
    category: "Health Advisory",
    summary: "Updated immunization schedules are now available for children, adults, and senior citizens.",
    image_url: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 3,
    title: "Health Center Holiday Schedule",
    content: "Please be informed of the adjusted operating hours during the upcoming holidays. Our main health center will maintain emergency services while satellite clinics will have modified schedules.",
    published_at: "2024-03-05T09:15:00Z",
    is_published: true,
    author_name: "Admin Office",
    category: "Notices",
    summary: "Satellite clinics will follow holiday operating hours while emergency services stay available.",
    image_url: "https://images.unsplash.com/photo-1486825586573-7131f7991bdd?auto=format&fit=crop&w=1200&q=80"
  }
];

export const mockServices: Service[] = [
  {
    id: 1,
    name: "Maternal Health Services",
    description: "Comprehensive care for expecting mothers including prenatal check-ups, nutritional counseling, and postpartum support. Our dedicated team ensures safe and healthy pregnancy journey for all mothers in Dasmariñas.",
    category: "Primary Care",
    contact_info: "Phone: (046) 123-4567",
    operating_hours: "8:00 AM - 5:00 PM"
  },
  {
    id: 2,
    name: "Child Immunization",
    description: "Free vaccination programs for children from birth to 12 years old. We provide essential vaccines following the Department of Health's immunization schedule to protect your children from preventable diseases.",
    category: "Preventive Care",
    contact_info: "Phone: (046) 123-4568",
    operating_hours: "9:00 AM - 4:00 PM"
  },
  {
    id: 3,
    name: "Dental Health Services",
    description: "Complete dental care including extraction, cleaning, filling, and oral health education. Regular dental check-ups are essential for maintaining overall health and preventing oral diseases.",
    category: "Dental Care",
    contact_info: "Phone: (046) 123-4569",
    operating_hours: "8:00 AM - 5:00 PM"
  },
  {
    id: 4,
    name: "Laboratory Services",
    description: "Diagnostic laboratory tests including blood chemistry, urinalysis, fecalysis, and other essential tests. Our laboratory is equipped with modern equipment for accurate and timely results.",
    category: "Diagnostic Services",
    contact_info: "Phone: (046) 123-4570",
    operating_hours: "7:00 AM - 3:00 PM"
  },
  {
    id: 5,
    name: "Family Planning",
    description: "Comprehensive family planning services including counseling, contraceptive methods, and reproductive health education. We support informed choices for healthy families and responsible parenthood.",
    category: "Reproductive Health",
    contact_info: "Phone: (046) 123-4571",
    operating_hours: "8:00 AM - 5:00 PM"
  }
];

// Mock API responses with pagination structure
export const mockAnnouncementList: AnnouncementListResponse = {
  data: mockAnnouncements,
  pagination: {
    page: 1,
    limit: 20,
    total: mockAnnouncements.length
  }
};

export const mockServiceList: ServiceListResponse = {
  data: mockServices
};
