import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Menu, X, Heart, Search, User, Users } from 'lucide-react';
import { Button } from './ui/button';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Announcements', path: '/announcements' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className="navbar-poppins gradient-divider-bottom fixed top-0 left-0 z-50 w-full bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Heart className="h-8 w-8 text-primary fill-primary/20 group-hover:fill-primary/30 transition-colors" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-secondary rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">CHO2</span>
                <span className="text-xs text-muted-foreground">City Health Office II</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'text-emerald-700 font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-md"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            {/* Patient Status button */}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setShowPatientModal(true)}
              className="hidden sm:flex"
            >
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Are you a patient?</span>
            </Button>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="gradient-divider-top md:hidden bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowPatientModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Are you a patient?</span>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Patient Status Modal */}
        {showPatientModal && createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-black/80">
            <div className="relative w-[calc(100%-2rem)] max-w-sm rounded-lg border border-zinc-200 bg-white p-10 shadow-xl">
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setShowPatientModal(false)}
                className="absolute right-4 top-4 rounded-sm p-1 text-gray-500 transition-colors hover:text-gray-800"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Are you a patient?</h2>
                <p className="text-gray-600">Please select your status to continue</p>
              </div>

              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPatientModal(false);
                    console.log('User selected: Patient');
                  }}
                  className="w-full h-12 flex items-center justify-center space-x-2 rounded-lg bg-emerald-600 px-6 font-medium text-white transition-colors hover:bg-emerald-700"
                >
                  <User className="h-5 w-5" />
                  <span>Yes, I'm a Patient</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPatientModal(false);
                    console.log('User selected: Non-Patient');
                  }}
                  className="mt-3 w-full h-12 flex items-center justify-center space-x-2 rounded-lg bg-gray-300 px-6 font-medium text-gray-900 transition-colors hover:bg-gray-400"
                >
                  <Users className="h-5 w-5" />
                  <span>No, I'm not a Patient</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </nav>
  );
}
