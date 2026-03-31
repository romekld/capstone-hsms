import { useMemo, useState } from 'react';
import { Footer } from '../components/Footer';
import { CalendarDays, Search } from 'lucide-react';

type FeedCategory = 'Advisory' | 'Event' | 'Notice';

interface FeedAnnouncement {
  id: number;
  title: string;
  summary: string;
  datePosted: string;
  category: FeedCategory;
  barangay: string;
  image?: string;
}

const ANNOUNCEMENTS: FeedAnnouncement[] = [
  {
    id: 1,
    title: 'Dengue Prevention Advisory for Rainy Season',
    summary:
      'Weekly fogging schedules and clean-up reminders are active in high-risk areas. Households are advised to remove standing water and cover water containers.',
    datePosted: 'March 29, 2026',
    category: 'Advisory',
    barangay: 'Barangay Salawag',
    image:
      'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    title: 'Free Pediatric Check-Up Caravan',
    summary:
      'The mobile health team will provide free check-ups, vitamins, and growth monitoring for children ages 0 to 12 this Saturday.',
    datePosted: 'March 27, 2026',
    category: 'Event',
    barangay: 'Barangay Salitran II',
    image:
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    title: 'Temporary Clinic Hours Adjustment',
    summary:
      'Main health center will operate from 7:00 AM to 3:00 PM on April 2 due to facility disinfection. Emergency desk remains available 24/7.',
    datePosted: 'March 25, 2026',
    category: 'Notice',
    barangay: 'Barangay Sampaloc III',
  },
  {
    id: 4,
    title: 'Senior Citizens Flu Vaccination Drive',
    summary:
      'Priority slots for senior citizens are open from April 4 to April 8. Bring your health card and valid ID for registration.',
    datePosted: 'March 22, 2026',
    category: 'Advisory',
    barangay: 'Barangay San Agustin I',
    image:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    title: 'Nutrition Month Community Workshop',
    summary:
      'Join barangay nutrition scholars for practical meal planning and healthy cooking demonstrations for families and caregivers.',
    datePosted: 'March 20, 2026',
    category: 'Event',
    barangay: 'Barangay Langkaan II',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 6,
    title: 'Water Quality Testing Results Posted',
    summary:
      'Recent testing confirms safe levels in all monitored public wells. Follow-up inspections are scheduled next month.',
    datePosted: 'March 18, 2026',
    category: 'Notice',
    barangay: 'Barangay Paliparan I',
  },
];

const CATEGORY_STYLES: Record<FeedCategory, string> = {
  Advisory: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  Event: 'bg-teal-100 text-teal-800 border border-teal-200',
  Notice: 'bg-lime-100 text-lime-800 border border-lime-200',
};

export function Announcements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('All Barangays');

  const barangays = useMemo(
    () => ['All Barangays', ...new Set(ANNOUNCEMENTS.map((item) => item.barangay)).values()],
    []
  );

  const filteredAnnouncements = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return ANNOUNCEMENTS
      .filter((announcement) => {
        const searchableText = [
          announcement.title,
          announcement.summary,
          announcement.category,
          announcement.barangay,
        ]
          .join(' ')
          .toLowerCase();

        const matchesSearch =
          normalizedSearch.length === 0 || searchableText.includes(normalizedSearch);

        const matchesBarangay =
          selectedBarangay === 'All Barangays' || announcement.barangay === selectedBarangay;

        return matchesSearch && matchesBarangay;
      });
  }, [searchTerm, selectedBarangay]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_-10%_-20%,rgba(16,185,129,0.14),transparent_45%),radial-gradient(circle_at_110%_-5%,rgba(20,184,166,0.12),transparent_45%),linear-gradient(180deg,#f8fcf9_0%,#edf5ef_100%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <section className="rounded-3xl border border-emerald-100/70 bg-white/90 shadow-sm p-8 lg:p-10 animate-fade-in-down">
          <p className="text-sm font-semibold tracking-[0.18em] uppercase text-emerald-700 mb-3">City Health Office Bulletin</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-emerald-950 mb-4 text-balance">Announcements Feed</h1>
          <p className="text-lg text-emerald-900/75 leading-relaxed max-w-3xl">
            Stay updated on advisories, events, and official notices for your barangay through a clear and accessible public information feed.
          </p>
        </section>

        <section className="sticky top-16 z-20 rounded-2xl border border-emerald-100 bg-white/85 backdrop-blur-lg shadow-sm p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label htmlFor="barangay-filter" className="text-sm font-semibold text-emerald-900">
                Filter by Barangay
              </label>
              <select
                id="barangay-filter"
                value={selectedBarangay}
                onChange={(e) => setSelectedBarangay(e.target.value)}
                className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
              >
                {barangays.map((barangay) => (
                  <option key={barangay} value={barangay}>
                    {barangay}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <label htmlFor="announcement-search" className="text-sm font-semibold text-emerald-900">
                Search
              </label>
              <div className="relative mt-2">
                <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/70" />
                <input
                  id="announcement-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search announcements..."
                  className="w-full rounded-xl border border-emerald-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-600 mt-4">
            {filteredAnnouncements.length} {filteredAnnouncements.length === 1 ? 'result' : 'results'} shown
          </p>
        </section>

        {filteredAnnouncements.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAnnouncements.map((announcement, index) => (
              <article
                key={announcement.id}
                className="group overflow-hidden rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {announcement.image ? (
                  <img
                    src={announcement.image}
                    alt={`${announcement.title} thumbnail`}
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-48 w-full bg-[linear-gradient(145deg,#d8efe0,#edf7f0)] flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-emerald-800 font-semibold">Health Office Update</p>
                      <p className="text-sm text-emerald-700/80 mt-1">No image provided</p>
                    </div>
                  </div>
                )}

                <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${CATEGORY_STYLES[announcement.category]}`}
                    >
                      {announcement.category}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium inline-flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {announcement.datePosted}
                    </p>
                  </div>

                  <h2 className="text-xl font-semibold leading-snug text-emerald-950">{announcement.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 flex-1">{announcement.summary}</p>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-emerald-800">{announcement.barangay}</p>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="text-center py-12">
            <CalendarDays className="h-12 w-12 text-emerald-700/60 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-emerald-950 mb-2">No announcements found</h3>
            <p className="text-slate-600">
              Try a different keyword or barangay filter, or check back later for new updates.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
