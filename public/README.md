# CHO2 Public Website

Public-facing website for City Health Office II (CHO2) in Dasmariñas City.

## Overview

This is a React + TypeScript + Vite application that provides online presence for CHO2, featuring:
- Public announcements feed
- Health services information
- About CHO2 page
- Mobile-responsive design
- Mock data support for development

## Tech Stack

- **Framework**: React 19.2.4 + Vite 8.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.2.1
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router v7

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3001`

3. **Build for production**:
   ```bash
   npm run build
   ```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# API Configuration
VITE_API_URL=http://localhost:8000

# Mock Data Toggle (set to false when backend is ready)
VITE_USE_MOCK_DATA=true
```

## Project Structure

```
public/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation header
│   │   ├── Footer.tsx          # Page footer
│   │   ├── AnnouncementCard.tsx # Announcement display card
│   │   └── ServiceCard.tsx      # Service display card
│   ├── lib/
│   │   ├── api.ts              # API integration layer
│   │   └── mockData.ts         # Mock data for development
│   ├── pages/
│   │   ├── Home.tsx            # Landing page
│   │   ├── Announcements.tsx   # Announcements feed
│   │   ├── Services.tsx         # Services listing
│   │   └── About.tsx           # About CHO2
│   ├── types/
│   │   └── announcement.ts     # TypeScript interfaces
│   ├── App.tsx                 # Main application
│   ├── main.tsx                # Application entry
│   ├── vite-env.d.ts           # Vite environment types
│   └── index.css               # Global styles
├── public/
│   └── index.html              # HTML template
├── Dockerfile                  # Production build
├── nginx.conf                  # Nginx configuration
└── package.json               # Dependencies
```

## API Integration

The application supports both mock and real data:

- **Mock Mode**: Uses local data for development
- **Live Mode**: Connects to HSMS backend APIs
- **Endpoints**:
  - `GET /api/public/announcements` - List announcements
  - `GET /api/public/services` - List services

## Pages

### Home (`/`)
- Hero section with CHO2 branding
- Quick stats (residents served, health centers, etc.)
- Featured announcements and services
- Call-to-action buttons

### Announcements (`/announcements`)
- Paginated announcement feed
- Search functionality
- Responsive grid layout
- Loading states

### Services (`/services`)
- Categorized service listings
- Filter by category
- Service cards with contact info
- Emergency services section

### About (`/about`)
- Mission and vision
- Service overview
- Contact information
- Operating hours

## Deployment

### Docker Development

```bash
# Build and run all services
docker-compose up public
```

### Production Build

```bash
# Build Docker image
docker build -t cho2-public .

# Run container
docker run -p 3001:80 cho2-public
```

## Integration with HSMS Backend

When the HSMS backend is ready:

1. **Update environment**:
   ```bash
   VITE_USE_MOCK_DATA=false
   VITE_API_URL=http://backend:8000
   ```

2. **API endpoints should match**:
   - `/api/public/announcements` - Returns paginated announcements
   - `/api/public/services` - Returns service list

3. **CORS configuration** in backend should include:
   - `http://localhost:3001` (development)
   - Production domain when deployed

## Contributing

1. Follow existing code patterns
2. Use TypeScript for type safety
3. Maintain responsive design
4. Test on different screen sizes
5. Keep components modular and reusable

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Android Chrome)

## Performance

- Lighthouse score: 90+ (target)
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Core Web Vitals optimized

## Security

- No PII exposed in public endpoints
- HTTPS in production
- Security headers configured
- Input validation on all forms
