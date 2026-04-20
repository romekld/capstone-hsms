import { Announcement } from '../types/announcement';
import { CalendarDays, ChevronRight } from 'lucide-react';

interface AnnouncementCardProps {
  announcement: Announcement;
  onReadMore?: (announcement: Announcement) => void;
  featured?: boolean;
}

const categoryStyles: Record<string, string> = {
  'Health Advisory': 'bg-emerald-50 text-emerald-700',
  Events: 'bg-sky-50 text-sky-700',
  Notices: 'bg-amber-50 text-amber-700',
};

export function AnnouncementCard({ announcement, onReadMore, featured = false }: AnnouncementCardProps) {
  const formattedDate = new Date(announcement.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const category = announcement.category ?? 'Notices';
  const summary = announcement.summary ?? announcement.content;

  return (
    <article
      className={`gradient-outline-soft group overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-within:ring-2 focus-within:ring-emerald-600/40 ${
        featured ? 'shadow-lg' : 'shadow-sm'
      }`}
    >
      <div className="relative h-36 overflow-hidden bg-slate-100 sm:h-40">
        {announcement.image_url ? (
          <img
            src={announcement.image_url}
            alt={`${announcement.title} thumbnail`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.24),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.2),transparent_35%),linear-gradient(145deg,#f1f5f9,#ffffff)]"
          />
        )}

        <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[category] ?? categoryStyles.Notices}`}
          >
            {category}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-900">{announcement.title}</h3>

        <p className="font-subtext line-clamp-3 text-sm leading-6 text-slate-600">{summary}</p>

        <div className="relative flex items-center justify-between gap-3 pt-4">
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.45),transparent)]"
            aria-hidden="true"
          />
          <p className="font-subtext inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-slate-500">
            <CalendarDays className="h-4 w-4" />
            <span>Posted {formattedDate}</span>
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
            onClick={() => onReadMore?.(announcement)}
            aria-label={`Read more about ${announcement.title}`}
          >
            Read More
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
