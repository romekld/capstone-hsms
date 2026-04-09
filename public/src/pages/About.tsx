import { Award, BookOpen, Building2, Clock, Mail, MapPin, PenLine, Phone, Users } from 'lucide-react';
import { Footer } from '../components/Footer';

export function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-600 text-white rounded-full p-4">
              <Building2 className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About City Health Office II
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Committed to providing quality healthcare services to the residents of Dasmariñas City. 
            Your health and well-being are our top priorities.
          </p>
        </div>

        {/* Mission and Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-4">
              <Award className="h-8 w-8 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To provide accessible, quality, and comprehensive healthcare services to all residents of Dasmariñas City. 
              We strive to promote health, prevent disease, and enhance the overall well-being of our community 
              through compassionate care and innovative health programs.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To be the leading health office in Cavite, recognized for excellence in public health service delivery, 
              innovative health programs, and commitment to community wellness. We envision a healthy Dasmariñas 
              where every resident has access to quality healthcare.
            </p>
          </div>
        </div>

        {/* Blog */}
        <section className="mb-16">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm">
              <BookOpen className="h-4 w-4" />
              Community Blog
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Stories from CHO II
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-lg text-gray-600">
              A closer look at the office, the people it serves, and the commitment behind every health service.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-[0_20px_60px_-30px_rgba(16,185,129,0.45)]">
              <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  <PenLine className="h-4 w-4" />
                  Office Profile
                </div>
                <h3 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Serving Dasmariñas at the community level
                </h3>
              </div>
              <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
                <p className="text-lg leading-8 text-gray-700 text-balance">
                  City Health Office II (CHO II), located in Barangay Sta. Cruz I, Area E, City of Dasmariñas, Cavite, is committed to promoting and protecting the health and well-being of the community. The office serves a population of approximately 164,691 residents across 32 barangays.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-50 px-5 py-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Population Served</p>
                    <p className="font-main mt-2 text-2xl font-bold text-emerald-950">164,691</p>
                    <p className="mt-1 text-sm text-gray-600">Residents across 32 barangays</p>
                  </div>
                  <div className="rounded-2xl bg-teal-50 px-5 py-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Community Coverage</p>
                    <p className="font-main mt-2 text-2xl font-bold text-teal-950">32 Barangays</p>
                    <p className="mt-1 text-sm text-gray-600">Supported through local health access points</p>
                  </div>
                </div>
                <p className="text-base leading-8 text-gray-700 text-balance">
                  CHO II operates through a network of dedicated healthcare professionals, with each barangay supported by one assigned nurse or midwife and an average of five Barangay Health Workers. Together, they ensure that essential health services are accessible at the community level.
                </p>
              </div>
            </article>

            <aside className="space-y-6">
              <article className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.5)]">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                  <Award className="h-4 w-4" />
                  Our Commitment
                </div>
                <h3 className="mt-4 text-2xl font-bold text-white">A better system for a growing city</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300 text-balance">
                  We are dedicated to delivering efficient, accessible, and high-quality healthcare services. As we continue to serve our growing community, CHO II recognizes the importance of improving coordination, reducing delays, and enhancing service delivery through innovation and better systems.
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-300 text-balance">
                  Our goal is to continuously evolve and adopt solutions that support faster, more reliable, and data-driven healthcare for every resident of Dasmariñas.
                </p>
              </article>

              <article className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Community-first care</h3>
                    <p className="text-sm text-gray-600">Built around accessibility and continuity</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">Assigned support</p>
                    <p className="mt-1 text-sm text-gray-600">One nurse or midwife per barangay</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">Frontline network</p>
                    <p className="mt-1 text-sm text-gray-600">Average of five Barangay Health Workers</p>
                  </div>
                </div>
              </article>
            </aside>
          </div>
        </section>

        {/* Contact Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Location</p>
                  <p className="text-gray-600">
                    Dasmariñas City, Cavite, Philippines
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Hotline</p>
                  <p className="text-gray-600">(046) 123-4567</p>
                  <p className="text-gray-600">Emergency: (046) 123-4568</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p className="text-gray-600">cho2@dasma.gov.ph</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Office Hours</p>
                  <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                  <p className="text-gray-600">Saturday: 8:00 AM - 12:00 PM</p>
                  <p className="text-gray-600">Sunday: Closed</p>
                  <p className="text-emerald-600 font-medium">Emergency Services: 24/7</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-emerald-900 mb-6">
              Visit Us Today
            </h2>
            <p className="text-emerald-700 mb-6">
              Your health is our priority. Visit any of our health centers or call our hotline 
              for immediate assistance. Our dedicated healthcare professionals are ready to serve you.
            </p>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-emerald-900 mb-2">Main Health Center</h3>
                <p className="text-gray-600 text-sm">
                  Located at the city proper with comprehensive medical facilities
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-emerald-900 mb-2">Satellite Centers</h3>
                <p className="text-gray-600 text-sm">
                  Multiple locations across Dasmariñas for accessible healthcare
                </p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button className="bg-emerald-700 text-white px-6 py-3 rounded-md font-medium hover:bg-emerald-800 transition-colors">
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
