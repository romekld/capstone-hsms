import { Building2, Phone, Mail, MapPin, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="gradient-divider-top bg-emerald-950 text-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Organization Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Building2 className="h-10 w-10 text-primary" />
              <div>
                <span className="text-xl font-bold">CHO2</span>
                <span className="block text-sm text-emerald-200">City Health Office II</span>
              </div>
            </div>
            <p className="text-emerald-200 mb-4 max-w-md">
              Committed to providing quality healthcare services to the residents of Dasmariñas City.
              Your health is our priority.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-emerald-200 hover:text-emerald-50 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/announcements" className="text-emerald-200 hover:text-emerald-50 transition-colors">
                  Announcements
                </a>
              </li>
              <li>
                <a href="/services" className="text-emerald-200 hover:text-emerald-50 transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="/about" className="text-emerald-200 hover:text-emerald-50 transition-colors">
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-emerald-200">Dasmariñas City, Cavite</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-emerald-200">(046) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-emerald-200">cho2@dasma.gov.ph</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-emerald-200">Mon-Fri: 8:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="gradient-divider-top mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-sm text-emerald-300/80">
              © 2024 City Health Office II. All rights reserved.
            </p>
            <p className="text-sm text-emerald-300/80">
              Powered by Project LINK HSMS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
