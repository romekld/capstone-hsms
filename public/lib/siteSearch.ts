import { healthPrograms } from "../src/lib/healthPrograms";
import {
  PUBLIC_ANNOUNCEMENT_FEED,
  getPublicAnnouncementSummary,
} from "../src/lib/publicAnnouncementsFeed";

export type SiteSearchCategory =
  | "Page"
  | "Program"
  | "Announcement"
  | "Contact"
  | "Reference";

export interface SiteSearchEntry {
  id: string;
  title: string;
  summary: string;
  href: string;
  category: SiteSearchCategory;
  keywords: string[];
}

export interface SiteSearchResult extends SiteSearchEntry {
  score: number;
}

const PAGE_ENTRIES: SiteSearchEntry[] = [
  {
    id: "home",
    title: "Home page",
    summary:
      "City Health Office II overview with featured services, barangay selection, and the latest health announcements.",
    href: "/",
    category: "Page",
    keywords: ["home", "overview", "barangay", "featured services", "announcements"],
  },
  {
    id: "home-services",
    title: "Core health programs",
    summary:
      "Quick access to consultation, animal bite, lying-in, family planning, laboratory, TB DOTS, counseling, drug rehab, and immunization.",
    href: "/services",
    category: "Page",
    keywords: ["services", "programs", "consultation", "immunization", "tb dots"],
  },
  {
    id: "home-announcements",
    title: "Latest health announcements",
    summary:
      "Recent updates, advisories, and outreach notices highlighted on the home page.",
    href: "/announcements",
    category: "Page",
    keywords: ["home", "announcements", "updates", "newsfeed"],
  },
  {
    id: "about-mission",
    title: "About the mission",
    summary:
      "Accessible, quality, and comprehensive healthcare services for residents of Dasmariñas City.",
    href: "/about",
    category: "Page",
    keywords: ["about", "mission", "healthcare", "community"],
  },
  {
    id: "about-vision",
    title: "About the vision",
    summary:
      "A leading health office recognized for excellence in public health service delivery and community wellness.",
    href: "/about",
    category: "Page",
    keywords: ["about", "vision", "public health", "community wellness"],
  },
  {
    id: "about-contact",
    title: "Contact information",
    summary:
      "Location, hotline, email, office hours, and emergency details for City Health Office II.",
    href: "/about",
    category: "Contact",
    keywords: ["contact", "hotline", "email", "office hours", "emergency"],
  },
];

const PROGRAM_ENTRIES: SiteSearchEntry[] = healthPrograms.map((program) => ({
  id: `program-${program.id}`,
  title: program.title,
  summary: program.description,
  href: `/services#service-${program.id}`,
  category: "Program",
  keywords: [program.id, program.title, program.description, "service", "health program"],
}));

const ANNOUNCEMENT_ENTRIES: SiteSearchEntry[] = PUBLIC_ANNOUNCEMENT_FEED.map((announcement) => ({
  id: announcement.id,
  title: announcement.title,
  summary: getPublicAnnouncementSummary(announcement),
  href: `/announcements#announcement-${announcement.id}`,
  category: "Announcement",
  keywords: [
    announcement.title,
    announcement.body,
    announcement.barangay,
    announcement.type,
    "announcement",
    "update",
  ],
}));

export const FEATURED_SITE_SEARCH_ENTRIES: SiteSearchEntry[] = [
  PAGE_ENTRIES[0],
  PAGE_ENTRIES[1],
  PAGE_ENTRIES[2],
  PAGE_ENTRIES[3],
  PAGE_ENTRIES[4],
  PAGE_ENTRIES[5],
];

export const SITE_SEARCH_ENTRIES: SiteSearchEntry[] = [
  ...PAGE_ENTRIES,
  ...PROGRAM_ENTRIES,
  ...ANNOUNCEMENT_ENTRIES,
];

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function scoreEntry(entry: SiteSearchEntry, query: string) {
  if (query.length === 0) {
    return 0;
  }

  const normalizedTitle = normalizeText(entry.title);
  const normalizedSummary = normalizeText(entry.summary);
  const normalizedKeywords = entry.keywords.map(normalizeText).join(" ");

  let score = 0;

  if (normalizedTitle === query) {
    score += 100;
  } else if (normalizedTitle.includes(query)) {
    score += 70;
  }

  if (normalizedSummary.includes(query)) {
    score += 35;
  }

  if (normalizedKeywords.includes(query)) {
    score += 20;
  }

  for (const token of query.split(" ")) {
    if (!token) continue;

    if (normalizedTitle.includes(token)) {
      score += 10;
    }
    if (normalizedSummary.includes(token)) {
      score += 6;
    }
    if (normalizedKeywords.includes(token)) {
      score += 4;
    }
  }

  return score;
}

export function searchSiteContent(query: string, limit = 8): SiteSearchResult[] {
  const normalizedQuery = normalizeText(query);

  if (normalizedQuery.length === 0) {
    return FEATURED_SITE_SEARCH_ENTRIES.map((entry) => ({
      ...entry,
      score: 0,
    })).slice(0, limit);
  }

  return SITE_SEARCH_ENTRIES.map((entry) => ({
    ...entry,
    score: scoreEntry(entry, normalizedQuery),
  }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.title.localeCompare(right.title);
    })
    .slice(0, limit);
}