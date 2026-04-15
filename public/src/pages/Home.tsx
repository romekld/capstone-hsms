import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../lib/api';
import { BARANGAY_OPTIONS } from '../lib/barangays';
import { Announcement, Service } from '../types/announcement';
import { healthPrograms } from '../lib/healthPrograms';
import { Footer } from '../components/Footer';
import { AppSelect } from '../components/ui/app-select';
import {
  ArrowRight,
  Activity,
  Shield,
  Heart,
  Clock,
  MapPin,
  Phone,
} from 'lucide-react';

const HOME_BARANGAY_OPTIONS = [
  { label: 'All Barangays', value: 'all' },
  ...BARANGAY_OPTIONS
    .map((barangay) => ({
      label: barangay,
      value: barangay,
    })),
];

export function Home() {
  const [featuredAnnouncements, setFeaturedAnnouncements] = useState<Announcement[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBarangay, setSelectedBarangay] = useState('all');

  const fallbackAnnouncements = [
    {
      id: 901,
      title: 'Quarterly Polio Vaccination Drive',
      summary: 'Health workers will run a barangay-wide vaccination drive this week for children below five years old.',
      date: 'March 18, 2026',
      image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 902,
      title: 'Dengue Prevention Week',
      summary: 'Free fogging and mosquito habitat checks will be conducted in priority zones with high case counts.',
      date: 'March 11, 2026',
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 903,
      title: 'Free Optical Mission',
      summary: 'Residents may register for eye screening and reading glasses distribution at the CHO outreach desk.',
      date: 'March 6, 2026',
      image: 'https://images.unsplash.com/photo-1580281657527-47f249e8f4df?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const serviceIcons = [Activity, Heart, Shield, Clock, MapPin, Phone];

  const formatPublishedDate = (dateString: string) => {
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return 'Recent update';

    return parsed.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const scrollToLatestAnnouncements = () => {
    const section = document.getElementById('latest-announcements');
    if (!section) return;

    const navOffset = 96;
    const top = section.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const announcementsResponse = await publicApi.getAnnouncements(1, 3);
        const servicesResponse = await publicApi.getServices();
        
        setFeaturedAnnouncements(announcementsResponse.data.slice(0, 3));
        setFeaturedServices(servicesResponse.data.slice(0, 6));
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]"></span>
            <span className="h-3 w-3 rounded-full bg-primary/80 animate-bounce [animation-delay:-0.15s]"></span>
            <span className="h-3 w-3 rounded-full bg-primary animate-bounce"></span>
          </div>
          <p className="text-muted-foreground">Loading health services...</p>
        </div>
      </div>
    );
  }

  const displayedProgramCards = healthPrograms.slice(0, 4);

  const announcementRows = featuredAnnouncements.length > 0
    ? featuredAnnouncements.map((announcement, index) => ({
        id: announcement.id,
        title: announcement.title,
        summary: announcement.summary || `${announcement.content.slice(0, 110)}...`,
        date: formatPublishedDate(announcement.published_at),
        image: announcement.image_url || fallbackAnnouncements[index % fallbackAnnouncements.length].image,
      }))
    : fallbackAnnouncements;

  return (
    <div className="min-h-screen bg-[#edf2f3]">
      <section className="relative overflow-hidden pb-14 pt-10 lg:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-4 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl"></div>
          <div className="absolute right-8 top-14 h-44 w-44 rounded-full bg-cyan-300/25 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="font-main text-xs font-semibold uppercase tracking-[0.28em] text-emerald-800/70">
                  Community Health Network
                </p>
                <h1 className="font-main text-4xl font-extrabold leading-[0.95] text-emerald-950 md:text-6xl lg:text-7xl">
                  City Health Office II,
                  <span className="block text-emerald-700"> Serving Every Barangay</span>
                </h1>
                <p className="max-w-xl text-base text-emerald-900/70 md:text-lg">
                  Access essential medical services, health programs, and coordinated outreach built for every barangay in Dasmariñas City.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-full max-w-sm space-y-2">
                  <label htmlFor="service-category" className="font-main text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800/75">
                    Select Barangay
                  </label>
                  <AppSelect
                    id="service-category"
                    value={selectedBarangay}
                    onValueChange={setSelectedBarangay}
                    options={HOME_BARANGAY_OPTIONS}
                    className="w-full rounded-xl border border-transparent bg-white/90 px-4 py-3 text-sm font-medium text-emerald-900 shadow-md shadow-emerald-900/5 ring-0 transition focus:shadow-lg"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
                  >
                    See all services
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={scrollToLatestAnnouncements}
                    className="inline-flex items-center rounded-xl bg-white/80 px-5 py-3 text-sm font-semibold text-emerald-900 shadow-md shadow-emerald-900/5 transition hover:bg-white"
                  >
                    Latest announcements
                  </button>
                </div>
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-900 via-cyan-700 to-emerald-500 p-6 shadow-2xl shadow-cyan-900/25">
              <img
                src="https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?auto=format&fit=crop&w=1300&q=80"
                alt="Healthcare professionals at work"
                className="h-full min-h-[300px] w-full rounded-2xl object-cover opacity-75"
                loading="lazy"
              />

              <div className="absolute bottom-6 left-6 rounded-2xl bg-emerald-200/90 px-4 py-3 shadow-xl shadow-emerald-950/20 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-950/70">Certified Care</p>
                <p className="font-main text-sm font-bold text-emerald-950">
                  {featuredServices[0]?.name || 'Prenatal Care'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 lg:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-main text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/75">Services • CHO2</p>
              <h2 className="font-main text-3xl font-extrabold text-emerald-950 md:text-4xl">Core Health Programs</h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-50 transition hover:bg-emerald-800"
            >
              See all services
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {displayedProgramCards.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayedProgramCards.map((program, index) => {
                const Icon = serviceIcons[index % serviceIcons.length];

                return (
                  <Link
                    key={program.id}
                    to="/services"
                    className="block rounded-2xl bg-white/90 p-5 shadow-sm shadow-emerald-900/10 transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="font-main text-lg font-bold text-emerald-950">{program.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-emerald-900/70">{program.description}</p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/85 p-6 text-sm text-emerald-900/70 shadow-sm shadow-emerald-900/10">
              No services available for this category right now.
            </div>
          )}
        </div>
      </section>

      <section id="latest-announcements" className="pb-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.4fr_1fr] lg:gap-10 lg:px-8">
          <div className="space-y-3">
            <p className="font-main text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/75">Updates • Newsfeed</p>
            <h2 className="font-main text-3xl font-extrabold text-emerald-950 md:text-4xl">Latest Health Announcements</h2>
            <p className="text-sm leading-6 text-emerald-900/70">
              Read real-time advisories, outreach notices, and service updates from City Health Office II.
            </p>
            <Link
              to="/announcements"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-50 transition hover:bg-emerald-800"
            >
              See all updates
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {announcementRows.map((announcement) => (
              <Link
                key={announcement.id}
                to={`/announcements#announcement-${announcement.id}`}
                className="group flex gap-3 rounded-xl bg-white/90 p-3 shadow-sm shadow-emerald-900/10 transition hover:bg-white hover:shadow-md"
              >
                <img
                  src={announcement.image}
                  alt={announcement.title}
                  className="h-16 w-16 rounded-lg object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700/75">{announcement.date}</p>
                  <h3 className="font-main text-sm font-bold text-emerald-950 transition group-hover:text-emerald-700 md:text-base">
                    {announcement.title}
                  </h3>
                  <p className="mt-1 text-xs text-emerald-900/65 md:text-sm">{announcement.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
