import Link from 'next/link';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

import { Cho2Logo } from './Cho2Logo';

export function Footer() {
  return (
    <footer className="gradient-divider-top bg-emerald-950 text-emerald-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4 flex items-center space-x-3">
              <Cho2Logo className="h-11 w-11 shrink-0" />
              <div>
                <span className="font-main text-xl font-bold">CHO2</span>
                <span className="font-subtext block text-sm text-emerald-200">City Health Office II</span>
              </div>
            </div>
            <p className="font-subtext mb-4 max-w-md text-emerald-200">
              Committed to providing quality healthcare services to the residents of Dasmariñas City.
              Your health is our priority.
            </p>
          </div>

          <div>
            <h3 className="font-main mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="font-subtext text-emerald-200 transition-colors hover:text-emerald-50">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="font-subtext text-emerald-200 transition-colors hover:text-emerald-50">
                  Announcements
                </Link>
              </li>
              <li>
                <Link href="/services" className="font-subtext text-emerald-200 transition-colors hover:text-emerald-50">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="font-subtext text-emerald-200 transition-colors hover:text-emerald-50">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-main mb-4 text-lg font-semibold text-white">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-subtext text-emerald-200">Dasmariñas City, Cavite</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-subtext text-emerald-200">(046) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-subtext text-emerald-200">cho2@dasma.gov.ph</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-subtext text-emerald-200">Mon-Fri: 8:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="gradient-divider-top mt-8 pt-8">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <p className="font-subtext text-sm text-emerald-300/80">
              © 2024 City Health Office II. All rights reserved.
            </p>
            <p className="font-subtext text-sm text-emerald-300/80">
              Powered by Project LINK HSMS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
