import { Award, Building2, Clock, Mail, MapPin, Phone, Users } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-emerald-600 p-4 text-white">
              <Building2 className="h-12 w-12" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            About City Health Office II
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600">
            Committed to providing quality healthcare services to the residents of Dasmariñas City.
            Your health and well-being are our top priorities.
          </p>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-8 shadow-md">
            <div className="mb-4 flex items-center">
              <Award className="mr-3 h-8 w-8 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="leading-relaxed text-gray-600">
              To provide accessible, quality, and comprehensive healthcare services to all residents of Dasmariñas City.
              We strive to promote health, prevent disease, and enhance the overall well-being of our community
              through compassionate care and innovative health programs.
            </p>
          </div>

          <div className="rounded-lg bg-white p-8 shadow-md">
            <div className="mb-4 flex items-center">
              <Users className="mr-3 h-8 w-8 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="leading-relaxed text-gray-600">
              To be the leading health office in Cavite, recognized for excellence in public health service delivery,
              innovative health programs, and commitment to community wellness. We envision a healthy Dasmariñas
              where every resident has access to quality healthcare.
            </p>
          </div>
        </div>

        <div className="mb-16 rounded-2xl bg-white p-8 shadow-md sm:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">About Us</h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              City Health Office II serves as one of the primary public health service hubs in Dasmariñas City,
              supporting communities through preventive care, essential health programs, and local health coordination.
              CHO II works closely with barangay health stations, health workers, and city partners to bring reliable
              and responsive healthcare closer to residents.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              City Population
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-900 sm:text-4xl">703,141 residents</p>
            <p className="mt-2 text-sm leading-6 text-emerald-800/90">
              Latest official PSA census count for Dasmariñas City as of May 1, 2020.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <article className="rounded-xl border border-emerald-100 bg-emerald-50 p-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                <Building2 className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-900">Public Health Leadership</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-800/90">
                CHO II helps lead community-based health programs, supports frontline service delivery, and strengthens
                preventive healthcare across its assigned coverage areas.
              </p>
            </article>

            <article className="rounded-xl border border-emerald-100 bg-emerald-50 p-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-900">Community Reach</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-800/90">
                With Dasmariñas City officially counted at 703,141 residents in the 2020 PSA Census, CHO II helps make
                healthcare services more accessible through coordination with barangay health stations, nurses,
                midwives, and community health workers.
              </p>
            </article>

            <article className="rounded-xl border border-emerald-100 bg-emerald-50 p-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-900">Resident-Focused Care</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-800/90">
                From health education and maternal care support to immunization, disease monitoring, and wellness
                campaigns, CHO II is dedicated to helping residents stay informed, protected, and cared for.
              </p>
            </article>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold text-gray-900">Location</p>
                  <p className="text-gray-600">
                    Dasmariñas City, Cavite, Philippines
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold text-gray-900">Hotline</p>
                  <p className="text-gray-600">(046) 123-4567</p>
                  <p className="text-gray-600">Emergency: (046) 123-4568</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p className="text-gray-600">cho2@dasma.gov.ph</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold text-gray-900">Office Hours</p>
                  <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                  <p className="text-gray-600">Saturday: 8:00 AM - 12:00 PM</p>
                  <p className="text-gray-600">Sunday: Closed</p>
                  <p className="font-medium text-emerald-600">Emergency Services: 24/7</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-emerald-50 p-8">
            <h2 className="mb-6 text-2xl font-bold text-emerald-900">
              Visit Us Today
            </h2>
            <p className="mb-6 text-emerald-700">
              Your health is our priority. Visit any of our health centers or call our hotline
              for immediate assistance. Our dedicated healthcare professionals are ready to serve you.
            </p>
            <div className="space-y-4">
              <div className="rounded-lg bg-white p-4">
                <h3 className="mb-2 font-semibold text-emerald-900">Main Health Center</h3>
                <p className="text-sm text-gray-600">
                  Located at the city proper with comprehensive medical facilities
                </p>
              </div>
              <div className="rounded-lg bg-white p-4">
                <h3 className="mb-2 font-semibold text-emerald-900">Satellite Centers</h3>
                <p className="text-sm text-gray-600">
                  Multiple locations across Dasmariñas for accessible healthcare
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button className="rounded-md bg-emerald-700 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-800">
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
