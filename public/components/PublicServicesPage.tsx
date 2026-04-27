"use client";

import { useEffect, useState } from "react";
import {
  Apple,
  CalendarDays,
  CircleAlert,
  ChevronRight,
  Clock3,
  Heart,
  Leaf,
  MapPin,
  Shield,
  Sparkles,
  Stethoscope,
  Syringe,
  X,
} from "lucide-react";

import { healthPrograms } from "../src/lib/healthPrograms";
import { publicApi } from "../lib/api";

type ServiceItem = {
  id: number | string;
  slug: string;
  name: string;
  description: string;
  category?: string;
  contactInfo?: string;
  operatingHours?: string;
  extraDetails: string[];
};

const SERVICE_DETAIL_MAP: Record<string, string[]> = {
  consultation: [
    "Used for routine checkups, symptom assessment, and follow-up care.",
    "Patients may ask for prescriptions, referrals, or basic health advice.",
    "Walk-ins are typically accepted during regular operating hours.",
  ],
  "animal-bite": [
    "Immediate wound care and exposure risk assessment are prioritized.",
    "Please bring the time of bite and any details about the animal.",
    "Rabies prevention guidance is time-sensitive, so same-day evaluation matters.",
  ],
  "lying-in": [
    "Supports prenatal monitoring and maternal follow-up care.",
    "Patients may be asked to bring maternal records and lab results.",
    "This service focuses on safer pregnancy monitoring and referral support.",
  ],
  "family-planning": [
    "Includes counseling, method selection, and follow-up for reproductive health.",
    "Clients may discuss pills, injectables, implants, condoms, and postpartum options.",
    "Privacy and informed choice are emphasized during each visit.",
  ],
  laboratory: [
    "Provides routine screening and diagnostic testing requested by the station.",
    "Common tests may include blood chemistry, urinalysis, and other routine checks.",
    "Ask the front desk if fasting or other preparation is needed.",
  ],
  "tb-dots": [
    "Focused on tuberculosis screening, treatment monitoring, and adherence support.",
    "Regular follow-up visits help track progress and reduce treatment interruption.",
    "Bring your schedule and medication information if available.",
  ],
  counseling: [
    "For health coaching, emotional support, and family guidance.",
    "May involve one-on-one discussion or referral when needed.",
    "Confidentiality and supportive care are priorities.",
  ],
  "drug-rehab": [
    "Supports referral, recovery planning, and reintegration guidance.",
    "Often coordinated with community support and external partners.",
    "A confidential intake discussion helps determine the safest next step.",
  ],
  immunization: [
    "Provides vaccines for infants, children, adults, and priority groups.",
    "Bring your immunization card or previous vaccination record when available.",
    "Staff may screen for eligibility, timing, and needed catch-up doses.",
  ],
};

function normalizeServiceKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fallbackServices(): ServiceItem[] {
  return healthPrograms.map((program) => ({
    id: program.id,
    slug: program.id,
    name: program.title,
    description: program.description,
    extraDetails: SERVICE_DETAIL_MAP[program.id] ?? ["Services are available during normal operating hours."],
  }));
}

export function PublicServicesPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>(fallbackServices());
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadServices = async () => {
      try {
        const response = await publicApi.getServices();
        if (!mounted) return;

        setServices(
          response.data.length > 0
            ? response.data.map((service) => ({
                id: service.id,
                slug: String(service.id),
                name: service.name,
                description: service.description,
                category: service.category,
                contactInfo: service.contact_info,
                operatingHours: service.operating_hours,
                extraDetails:
                  SERVICE_DETAIL_MAP[normalizeServiceKey(service.name)] ??
                  SERVICE_DETAIL_MAP[normalizeServiceKey(service.category ?? service.name)] ??
                  ["Services are available during normal operating hours."],
              }))
            : fallbackServices()
        );
      } catch {
        if (mounted) {
          setServices(fallbackServices());
        }
      }
    };

    void loadServices();

    return () => {
      mounted = false;
    };
  }, []);

  const programIcons = [
    <Stethoscope className="h-8 w-8" key="stethoscope-1" />,
    <Heart className="h-8 w-8" key="heart-1" />,
    <Apple className="h-8 w-8" key="apple-1" />,
    <Shield className="h-8 w-8" key="shield-1" />,
    <Leaf className="h-8 w-8" key="leaf-1" />,
    <Stethoscope className="h-8 w-8" key="stethoscope-2" />,
    <Heart className="h-8 w-8" key="heart-2" />,
    <Shield className="h-8 w-8" key="shield-2" />,
    <Syringe className="h-8 w-8" key="syringe-1" />,
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0fdf4" }}>
        <div className="relative overflow-hidden" style={{ backgroundColor: "#f0fdf4" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent opacity-50 pointer-events-none" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div
              className={`text-center transform transition-all duration-700 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="inline-flex items-center justify-center mb-4">
                <span
                  className="px-4 py-2 text-sm font-semibold rounded-full"
                  style={{ backgroundColor: "#d1fae5", color: "#052410" }}
                >
                  ✓ Comprehensive Care
                </span>
              </div>
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight w-full"
                style={{ color: "#052410" }}
              >
                Our Health Programs
              </h1>
              <p
                className="text-lg max-w-2xl mx-auto leading-relaxed"
                style={{ color: "#052410" }}
              >
                Delivering quality healthcare services to our community through
                evidence-based programs and professional medical expertise.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((program, index) => (
              <div
                key={program.id}
                className={`group transform transition-all duration-700 ${
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: isLoaded ? `${index * 100}ms` : "0ms",
                }}
              >
                <article
                  id={`service-${program.slug}`}
                  className="relative h-full rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300"
                  style={{
                    backgroundColor: "#f0fdf4",
                    borderColor: "#d1fae5",
                  }}
                >
                  <div
                    className="h-24 relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                    }}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGF0dGVybiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIiBmaWxsPSJ3aGl0ZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')] bg-repeat" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div
                        className="p-3 backdrop-blur-sm rounded-xl text-white"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.25)" }}
                      >
                        {programIcons[index % programIcons.length]}
                      </div>
                    </div>
                  </div>

                  <div className="flex h-[calc(100%-6rem)] flex-col p-6">
                    <h3
                      className="text-xl font-semibold mb-3 group-hover:transition-colors line-clamp-2 duration-300"
                      style={{ color: "#052410" }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.color = "#10b981";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.color = "#052410";
                      }}
                    >
                      {program.name}
                    </h3>

                    <p
                      className="text-sm leading-relaxed mb-6 line-clamp-4 flex-grow"
                      style={{ color: "#052410" }}
                    >
                      {program.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelectedService(program)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 text-white font-medium rounded-lg hover:shadow-lg active:scale-95 transition-all duration-200 group-hover:gap-3"
                      style={{
                        background:
                          "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      }}
                    >
                      Learn More
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  <div
                    className="absolute top-0 left-0 w-full h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                    style={{
                      background:
                        "linear-gradient(to right, #d1fae5, #10b981, transparent)",
                    }}
                  />
                </article>
              </div>
            ))}
          </div>

          <div
            className="mt-20 pt-16"
            style={{ borderTopColor: "#d1fae5", borderTopWidth: "1px" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div
                className="rounded-2xl p-8 border"
                style={{
                  backgroundColor: "#f0fdf4",
                  borderColor: "#d1fae5",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 text-white rounded-lg shrink-0"
                    style={{ backgroundColor: "#059669" }}
                  >
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: "#052410" }}
                    >
                      Quality & Safety
                    </h3>
                    <p className="leading-relaxed" style={{ color: "#052410" }}>
                      All programs are conducted by trained healthcare
                      professionals following international health standards and
                      best practices.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl p-8 border"
                style={{
                  backgroundColor: "#f0fdf4",
                  borderColor: "#d1fae5",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 text-white rounded-lg shrink-0"
                    style={{ backgroundColor: "#10b981" }}
                  >
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: "#052410" }}
                    >
                      Community Focused
                    </h3>
                    <p className="leading-relaxed" style={{ color: "#052410" }}>
                      We prioritize accessible, affordable healthcare services
                      designed to meet the unique needs of our community.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 relative">
            <div
              className="rounded-2xl overflow-hidden shadow-xl"
              style={{
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              }}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGF0dGVybiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIiBmaWxsPSJ3aGl0ZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')] bg-repeat" />
              </div>
              <div className="relative px-6 sm:px-12 py-12">
                <div className="text-center">
                  <div
                    className="inline-flex items-center justify-center p-3 backdrop-blur-sm rounded-full mb-6"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  >
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Need Emergency Care?
                  </h2>
                  <p
                    className="max-w-xl mx-auto mb-8 text-lg"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    Available 24/7 for medical emergencies. Our dedicated team
                    is ready to help you.
                  </p>
                  <button
                    className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-lg hover:shadow-2xl active:scale-95 transition-all duration-200 text-lg"
                    style={{
                      backgroundColor: "#f0fdf4",
                      color: "#059669",
                    }}
                  >
                    Call Emergency Hotline
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {selectedService ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
              onClick={() => setSelectedService(null)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="service-modal-title"
                className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-[0_30px_100px_-30px_rgba(5,36,16,0.45)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-5 sm:px-8">
                  <div>
                    <p className="font-main text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Service details
                    </p>
                    <h2
                      id="service-modal-title"
                      className="mt-2 text-2xl font-bold text-[#052410] sm:text-3xl"
                    >
                      {selectedService.name}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-emerald-800 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-900"
                    aria-label="Close service details"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6 px-6 py-6 sm:px-8">
                  <p className="text-sm leading-7 text-slate-700 sm:text-base">
                    {selectedService.description}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                          Program focus
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-[#052410]">
                        {selectedService.category || "General public service"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <Clock3 className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                          Operating hours
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-[#052410]">
                        {selectedService.operatingHours || "Available during station hours"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                          Visit guidance
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-[#052410]">
                        Walk-ins are accepted unless station staff advise a different schedule.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <CalendarDays className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                          Contact
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-[#052410]">
                        {selectedService.contactInfo || "Ask the front desk for referral details."}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-white p-5">
                    <p className="mb-3 flex items-center gap-2 text-emerald-800">
                      <CircleAlert className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                        Additional details
                      </span>
                    </p>
                    <ul className="space-y-3 text-sm leading-7 text-slate-700">
                      {selectedService.extraDetails.map((detail) => (
                        <li key={detail} className="flex gap-3">
                          <span className="mt-2 h-2 w-2 rounded-full bg-emerald-600" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
  );
}
