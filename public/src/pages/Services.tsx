import { useEffect, useState } from 'react';
import { Footer } from '../components/Footer';
import {
  Syringe,
  Heart,
  Apple,
  Shield,
  Leaf,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';
import { healthPrograms } from '../lib/healthPrograms';

export function Services() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsLoaded(true);
  }, []);

  const programIcons = [
    <Stethoscope className="h-8 w-8" />,
    <Heart className="h-8 w-8" />,
    <Apple className="h-8 w-8" />,
    <Shield className="h-8 w-8" />,
    <Leaf className="h-8 w-8" />,
    <Stethoscope className="h-8 w-8" />,
    <Heart className="h-8 w-8" />,
    <Shield className="h-8 w-8" />,
    <Syringe className="h-8 w-8" />,
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div
            className={`text-center transform transition-all duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center justify-center mb-4">
              <span
                className="px-4 py-2 text-sm font-semibold rounded-full"
                style={{ backgroundColor: '#d1fae5', color: '#052410' }}
              >
                ✓ Comprehensive Care
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight w-full" style={{ color: '#052410' }}>
              Our Health Programs
            </h1>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#052410' }}>
              Delivering quality healthcare services to our community through evidence-based programs and professional medical expertise.
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {healthPrograms.map((program, index) => (
            <div
              key={program.id}
              className={`group transform transition-all duration-700 ${
                isLoaded
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: isLoaded ? `${index * 100}ms` : '0ms',
              }}
            >
              <article
                className="relative h-full rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: '#f0fdf4',
                  borderColor: '#d1fae5',
                }}
              >
                {/* Icon Background - Gradient from sage to warm gray */}
                <div
                  className="h-24 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, #059669 0%, #10b981 100%)`,
                  }}
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGF0dGVybiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIiBmaWxsPSJ3aGl0ZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')] bg-repeat" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div
                      className="p-3 backdrop-blur-sm rounded-xl text-white"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                    >
                      {programIcons[index % programIcons.length]}
                    </div>
                  </div>
                </div>

                <div className="flex h-[calc(100%-6rem)] flex-col p-6">
                  <h3
                    className="text-xl font-semibold mb-3 group-hover:transition-colors line-clamp-2 duration-300"
                    style={{
                      color: '#052410',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#10b981')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#052410')}
                  >
                    {program.title}
                  </h3>

                  <p className="text-sm leading-relaxed mb-6 line-clamp-4 flex-grow" style={{ color: '#052410' }}>
                    {program.description}
                  </p>

                  {/* Learn More Button */}
                  <button
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 text-white font-medium rounded-lg hover:shadow-lg active:scale-95 transition-all duration-200 group-hover:gap-3"
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    }}
                  >
                    Learn More
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Hover Accent Line */}
                <div
                  className="absolute top-0 left-0 w-full h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{
                    background: 'linear-gradient(to right, #d1fae5, #10b981, transparent)',
                  }}
                />
              </article>
            </div>
          ))}
        </div>

        {/* Additional Services Section */}
        <div className="mt-20 pt-16" style={{ borderTopColor: '#d1fae5', borderTopWidth: '1px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Info Box 1 */}
            <div
              className="rounded-2xl p-8 border"
              style={{
                backgroundColor: '#f0fdf4',
                borderColor: '#d1fae5',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 text-white rounded-lg shrink-0"
                  style={{ backgroundColor: '#059669' }}
                >
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#052410' }}>
                    Quality & Safety
                  </h3>
                  <p className="leading-relaxed" style={{ color: '#052410' }}>
                    All programs are conducted by trained healthcare professionals following international health standards and best practices.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box 2 */}
            <div
              className="rounded-2xl p-8 border"
              style={{
                backgroundColor: '#f0fdf4',
                borderColor: '#d1fae5',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 text-white rounded-lg shrink-0"
                  style={{ backgroundColor: '#10b981' }}
                >
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#052410' }}>
                    Community Focused
                  </h3>
                  <p className="leading-relaxed" style={{ color: '#052410' }}>
                    We prioritize accessible, affordable healthcare services designed to meet the unique needs of our community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Section */}
        <div className="mt-20 relative">
          <div
            className="rounded-2xl overflow-hidden shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGF0dGVybiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIiBmaWxsPSJ3aGl0ZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')] bg-repeat" />
            </div>
            <div className="relative px-6 sm:px-12 py-12">
              <div className="text-center">
                <div
                  className="inline-flex items-center justify-center p-3 backdrop-blur-sm rounded-full mb-6"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Need Emergency Care?
                </h2>
                <p className="max-w-xl mx-auto mb-8 text-lg" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Available 24/7 for medical emergencies. Our dedicated team is ready to help you.
                </p>
                <button
                  className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-lg hover:shadow-2xl active:scale-95 transition-all duration-200 text-lg"
                  style={{
                    backgroundColor: '#f0fdf4',
                    color: '#059669',
                  }}
                >
                  Call Emergency Hotline
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
