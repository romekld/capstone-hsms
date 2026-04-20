import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Phone, Search, X } from 'lucide-react';
import { Cho2Logo } from './Cho2Logo';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Announcements', path: '/announcements' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
  ];

  function handleSearchClick() {
    setIsMenuOpen(false);

    if (location.pathname === '/announcements') {
      const input = document.getElementById('announcement-search') as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    navigate('/announcements#announcement-search');
  }

  return (
    <nav className="gradient-divider-bottom sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="group flex items-center space-x-3">
              <div className="relative shrink-0">
                <Cho2Logo className="h-11 w-11 transition-transform duration-200 group-hover:scale-[1.03]" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-main text-xl font-bold text-foreground">CHO2</span>
                <span className="font-subtext text-xs text-muted-foreground">City Health Office II</span>
              </div>
            </Link>
          </div>

          <div className="hidden items-center space-x-8 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`font-main relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'font-semibold text-emerald-700'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <div className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-md"></div>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleSearchClick}
              aria-label="Search announcements"
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </button>

            <a
              href="tel:(046)123-4567"
              className="hidden items-center space-x-2 rounded-md bg-secondary px-3 py-2 text-secondary-foreground transition-colors hover:bg-secondary/80 sm:flex"
            >
              <Phone className="h-4 w-4" />
              <span className="font-main text-sm font-medium">Emergency</span>
            </a>

            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="gradient-divider-top bg-background/95 backdrop-blur md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-main block rounded-md px-3 py-2 text-base font-medium transition-all ${
                    isActive(item.path)
                      ? 'border-l-4 border-emerald-600 bg-emerald-50 font-semibold text-emerald-700'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t pt-2">
                <a
                  href="tel:(046)123-4567"
                  className="flex items-center space-x-2 rounded-md bg-emerald-700 px-3 py-2 text-white transition-colors hover:bg-emerald-800"
                >
                  <Phone className="h-4 w-4" />
                  <span className="font-main font-medium">Emergency: (046) 123-4567</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
