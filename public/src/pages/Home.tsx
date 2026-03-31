import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../lib/api';
import { Announcement, Service } from '../types/announcement';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { ServiceCard } from '../components/ServiceCard';
import { NewsletterSignup } from '../components/NewsletterSignup';
import { ContactForm } from '../components/ContactForm';
import { ServiceFinder } from '../components/ServiceFinder';
import { Footer } from '../components/Footer';
import { ArrowRight, Phone, MapPin, Users, Activity, Shield, Heart, Clock, ExternalLink } from 'lucide-react';

export function Home() {
  const [featuredAnnouncements, setFeaturedAnnouncements] = useState<Announcement[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const latestUpdates = [
    {
      id: 101,
      category: 'DASMARIÑAS CHO',
      title: 'Persistent in Bringing Health Care Services to the Community',
      description:
        'In partnership with the Provincial Health Office and OPG-Extension Office, CHO2 conducted a medical and dental mission at San Miguel 1 Covered Court to expand community access to quality care.',
      publishedDate: 'October 1, 2018',
      collage: [
        'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 102,
      category: 'DASMARIÑAS CHO',
      title: 'Caring Close to Home: Healthcare Touches Down in Barangay Langkaan 1, Dasma',
      description:
        'The outreach delivered free medical consultations, check-ups, prescribed medicines, multivitamins, and mosquito repellent lotion for 364 patients in Barangay Langkaan 1.',
      publishedDate: 'December 20, 2023',
      image:
        'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1200&q=80',
    },
  ];

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
        setFeaturedServices(servicesResponse.data.slice(0, 3));
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
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading health services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-background overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[75vh] flex items-center py-12 lg:py-16">
          <div className="max-w-3xl text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance text-foreground">
                City Health Office II
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground text-balance">
                Your Health, Our Priority - Serving Dasmariñas City with Quality Healthcare
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-start">
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/90 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Our Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={scrollToLatestAnnouncements}
                className="inline-flex items-center justify-center px-8 py-4 bg-card text-foreground font-semibold rounded-lg hover:bg-muted transition-all duration-200 border border-border"
              >
                Latest Updates
              </button>

            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

      {/* Emergency Services */}
      <section className="py-16 bg-destructive/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-destructive/10 rounded-full mb-4">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Emergency Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Available 24/7 for urgent medical needs and emergencies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <Phone className="h-8 w-8 text-destructive mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Emergency Hotline</h3>
              <p className="text-2xl font-bold text-destructive mb-1">(046) 123-4567</p>
              <p className="text-sm text-muted-foreground">Available 24/7</p>
            </div>
            <div className="bg-card rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <Activity className="h-8 w-8 text-health-warning mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Urgent Care</h3>
              <p className="text-sm text-muted-foreground mb-2">Non-life threatening emergencies</p>
              <p className="text-sm text-muted-foreground">Mon-Fri: 8AM-8PM</p>
            </div>
            <div className="bg-card rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <Heart className="h-8 w-8 text-health-success mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Medical Advice</h3>
              <p className="text-sm text-muted-foreground mb-2">Telehealth consultation</p>
              <p className="text-sm text-muted-foreground">Daily: 6AM-10PM</p>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-health-warning/45 to-transparent" />

      {/* Featured Announcements */}
      <section id="latest-announcements" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Latest Announcements
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stay updated with the latest news and updates from CHO2
            </p>
            <Link
              to="/announcements"
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View All Announcements
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {latestUpdates.map((item) => (
              <article key={item.id} className="bg-white rounded-xl p-4 md:p-5">
                <div className="mb-4">
                  {item.collage ? (
                    <div className="grid grid-cols-2 gap-2 h-64">
                      {item.collage.map((imageUrl, index) => (
                        <img
                          key={`${item.id}-${index}`}
                          src={imageUrl}
                          alt={`${item.title} scene ${index + 1}`}
                          className="h-full w-full object-cover rounded-lg"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-64 w-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  )}
                </div>

                <p className="text-xs font-bold tracking-wide text-emerald-900 uppercase mb-3">{item.category}</p>

                <h3 className="text-2xl font-bold text-zinc-900 leading-tight line-clamp-2 mb-3">{item.title}</h3>

                <p className="font-subtext text-sm leading-6 text-zinc-600 line-clamp-3 mb-6">{item.description}</p>

                <div className="flex items-center justify-between gap-3">
                  <p className="font-subtext text-sm text-zinc-500">{item.publishedDate}</p>

                  <Link
                    to={`/announcements#announcement-${item.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-800 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                  >
                    Read More
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Featured Services */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Comprehensive healthcare services for the Dasmariñas community
            </p>
            <Link
              to="/services"
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-health-accent/40 to-transparent" />

      {/* Service Finder */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Find the Right Service
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Search and filter through our comprehensive healthcare services
            </p>
          </div>
          
          <ServiceFinder services={featuredServices} />
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

      {/* Quick Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">50,000+</h3>
              <p className="text-muted-foreground">Residents Served</p>
            </div>
            <div className="text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-health-success/10 rounded-xl group-hover:bg-health-success/20 transition-colors">
                  <Clock className="h-8 w-8 text-health-success" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">24/7</h3>
              <p className="text-muted-foreground">Emergency Services</p>
            </div>
            <div className="text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-health-accent/10 rounded-xl group-hover:bg-health-accent/20 transition-colors">
                  <MapPin className="h-8 w-8 text-health-accent" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">5</h3>
              <p className="text-muted-foreground">Health Centers</p>
            </div>
            <div className="text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-secondary rounded-xl group-hover:bg-secondary/80 transition-colors">
                  <Phone className="h-8 w-8 text-secondary-foreground" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">Hotline</h3>
              <p className="text-muted-foreground">(046) 123-4567</p>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-health-accent/45 to-transparent" />

      {/* Newsletter and Contact */}
      <section className="py-16 health-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="animate-fade-in-up">
              <NewsletterSignup />
            </div>
            <div className="animate-fade-in-up animate-stagger-2">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
