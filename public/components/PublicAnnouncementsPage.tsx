"use client";

import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { EyeOff, MapPin, RotateCcw, Search, Trash2, X } from "lucide-react";

import { BARANGAY_OPTIONS } from "../src/lib/barangays";
import {
  PUBLIC_ANNOUNCEMENT_FEED,
  getPublicAnnouncementImage,
} from "../src/lib/publicAnnouncementsFeed";

type AnnouncementType = "Notice" | "Advisory" | "Event";
type SortOption = "newest" | "oldest" | "author";

interface AnnouncementPost {
  id: string;
  author: string;
  role: string;
  type: AnnouncementType;
  barangay: string;
  postedAt: string;
  title: string;
  body: string;
}

type AnnouncementSeed = Omit<AnnouncementPost, "author" | "role">;

const OFFICIAL_POST_AUTHOR = "CHO 2 Administrator";
const OFFICIAL_POST_ROLE = "Official CHO II Announcement";

const ANNOUNCEMENT_SEED: AnnouncementSeed[] = PUBLIC_ANNOUNCEMENT_FEED;

const ANNOUNCEMENTS: AnnouncementPost[] = ANNOUNCEMENT_SEED.map((post) => ({
  ...post,
  author: OFFICIAL_POST_AUTHOR,
  role: OFFICIAL_POST_ROLE,
}));

const PREVIEW_LIMIT = 250;
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});
const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const TYPE_OPTIONS: Array<"all" | AnnouncementType> = [
  "all",
  "Notice",
  "Advisory",
  "Event",
];
const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "author", label: "Poster name A-Z" },
];
const ANNOUNCEMENTS_BARANGAY_OPTIONS = ["all", ...BARANGAY_OPTIONS];

const TYPE_BADGE_STYLES: Record<AnnouncementType, string> = {
  Notice: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Advisory: "border-green-200 bg-green-50 text-green-800",
  Event: "border-teal-200 bg-teal-50 text-teal-800",
};

function formatPostedAt(value: string) {
  const date = new Date(value);
  return `${DATE_FORMATTER.format(date)}, ${TIME_FORMATTER.format(date)}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PublicAnnouncementsPage() {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [posts, setPosts] = useState(ANNOUNCEMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | AnnouncementType>("all");
  const [selectedBarangay, setSelectedBarangay] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  useEffect(() => {
    const focusSearchFromHash = () => {
      if (window.location.hash !== "#announcement-search") {
        return;
      }

      window.requestAnimationFrame(() => {
        const input = searchInputRef.current;
        if (!input) return;

        input.focus();
        input.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    };

    focusSearchFromHash();
    window.addEventListener("hashchange", focusSearchFromHash);

    return () => {
      window.removeEventListener("hashchange", focusSearchFromHash);
    };
  }, []);

  const normalizedSearch = deferredSearchTerm.trim().toLowerCase();
  const filteredAnnouncements = [...posts]
    .filter((post) => !hiddenIds.includes(post.id))
    .filter((post) => {
      const searchableText = [
        post.author,
        post.role,
        post.type,
        post.barangay,
        post.title,
        post.body,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 || searchableText.includes(normalizedSearch);
      const matchesType = selectedType === "all" || post.type === selectedType;
      const matchesBarangay =
        selectedBarangay === "all" || post.barangay === selectedBarangay;

      return matchesSearch && matchesType && matchesBarangay;
    })
    .sort((left, right) => {
      if (sortBy === "author") return left.author.localeCompare(right.author);
      if (sortBy === "oldest") {
        return (
          new Date(left.postedAt).getTime() -
          new Date(right.postedAt).getTime()
        );
      }
      return new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime();
    });

  const hiddenCount = hiddenIds.length;

  function clearFilters() {
    startTransition(() => {
      setSearchTerm("");
      setSelectedType("all");
      setSelectedBarangay("all");
      setSortBy("newest");
      setOpenMenuId(null);
    });
  }

  function restoreHiddenPosts() {
    startTransition(() => {
      setHiddenIds([]);
      setOpenMenuId(null);
    });
  }

  function restoreSampleFeed() {
    startTransition(() => {
      setPosts(ANNOUNCEMENTS);
      setHiddenIds([]);
      setExpandedIds([]);
      setOpenMenuId(null);
      setSearchTerm("");
      setSelectedType("all");
      setSelectedBarangay("all");
      setSortBy("newest");
    });
  }

  function toggleExpanded(postId: string) {
    setExpandedIds((currentIds) =>
      currentIds.includes(postId)
        ? currentIds.filter((id) => id !== postId)
        : [...currentIds, postId]
    );
  }

  function hidePost(postId: string) {
    startTransition(() => {
      setHiddenIds((currentIds) =>
        currentIds.includes(postId) ? currentIds : [...currentIds, postId]
      );
      setOpenMenuId(null);
    });
  }

  function removePost(postId: string) {
    startTransition(() => {
      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId)
      );
      setHiddenIds((currentIds) => currentIds.filter((id) => id !== postId));
      setExpandedIds((currentIds) => currentIds.filter((id) => id !== postId));
      setOpenMenuId(null);
    });
  }

  return (
    <div className="min-h-screen bg-emerald-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-emerald-50 p-5 shadow-[0_24px_70px_-48px_rgba(5,36,16,0.18)] sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <div>
                <span className="font-subtext inline-flex min-h-9 items-center rounded-full border border-emerald-200 bg-emerald-100 px-4 text-xs font-bold uppercase tracking-[0.2em] text-[#052410]">
                  Public announcement board
                </span>
                <h1 className="font-main mt-4 text-[clamp(2.2rem,5vw,4rem)] leading-[0.88] font-bold tracking-[-0.04em] text-[#052410]">
                  Announcements, Dasmarineños.
                </h1>
                <p className="font-subtext mt-4 max-w-4xl text-base leading-8 text-emerald-950/80 sm:text-lg">
                  Browse notices, advisories, and events in a clean view-only
                  layout. Every card keeps the poster name, exact date and time,
                  barangay tag, and post type visible at a glance.
                </p>
              </div>

              <aside className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm">
                <p className="font-subtext text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  About this page
                </p>
                <h2 className="font-main mt-2 text-lg font-semibold leading-snug text-[#052410]">
                  Quick public bulletin for verified health updates
                </h2>
                <p className="font-subtext mt-3 text-sm leading-7 text-emerald-950/80">
                  Use the search and filters to find notices, advisories, and
                  events for your barangay. Posts here are for viewing only and
                  are meant to help residents quickly check official CHO II
                  announcements.
                </p>
              </aside>
            </div>
          </section>

          <section className="sticky top-4 z-20 mt-2 rounded-[1.75rem] border border-emerald-100 bg-emerald-50/95 p-4 shadow-[0_18px_60px_-48px_rgba(5,36,16,0.2)] backdrop-blur sm:top-5 sm:mt-3 sm:p-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_220px_220px_220px]">
              <label className="block">
                <span className="font-main text-sm font-semibold text-[#052410]">
                  Search announcements
                </span>
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                  <input
                    ref={searchInputRef}
                    id="announcement-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      startTransition(() => setSearchTerm(nextValue));
                    }}
                    placeholder="Search by barangay, type, or post content"
                    className="font-main min-h-12 w-full rounded-2xl border border-emerald-100 bg-white py-3 pl-10 pr-4 text-sm text-[#052410] outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </label>

              <label className="block">
                <span className="font-main text-sm font-semibold text-[#052410]">
                  Type
                </span>
                <select
                  value={selectedType}
                  onChange={(event) =>
                    startTransition(() =>
                      setSelectedType(event.target.value as "all" | AnnouncementType)
                    )
                  }
                  className="font-main mt-2 min-h-12 w-full rounded-2xl border border-emerald-100 bg-white px-4 text-sm text-[#052410] outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All types" : option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="font-main text-sm font-semibold text-[#052410]">
                  Barangay
                </span>
                <select
                  value={selectedBarangay}
                  onChange={(event) =>
                    startTransition(() => setSelectedBarangay(event.target.value))
                  }
                  className="font-main mt-2 min-h-12 w-full rounded-2xl border border-emerald-100 bg-white px-4 text-sm text-[#052410] outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  {ANNOUNCEMENTS_BARANGAY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All barangays" : option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="font-main text-sm font-semibold text-[#052410]">
                  Sort by
                </span>
                <select
                  value={sortBy}
                  onChange={(event) =>
                    startTransition(() => setSortBy(event.target.value as SortOption))
                  }
                  className="font-main mt-2 min-h-12 w-full rounded-2xl border border-emerald-100 bg-white px-4 text-sm text-[#052410] outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-emerald-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="font-subtext text-sm text-emerald-950/80">
                {filteredAnnouncements.length}{" "}
                {filteredAnnouncements.length === 1 ? "result" : "results"} shown
                from {posts.length} active posts.
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-main inline-flex min-h-11 items-center justify-center rounded-2xl border border-emerald-200 bg-white px-4 text-sm font-semibold text-[#052410] transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  onClick={restoreSampleFeed}
                  className="font-main inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 text-sm font-semibold text-white transition hover:from-emerald-700 hover:to-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restore sample feed
                </button>
              </div>
            </div>
          </section>

          {hiddenCount > 0 ? (
            <section className="mt-4 flex flex-col gap-3 rounded-[1.5rem] border border-emerald-200 bg-emerald-100/80 p-4 text-sm text-[#052410] sm:flex-row sm:items-center sm:justify-between">
              <p className="font-subtext">
                <span className="font-semibold">{hiddenCount}</span> post
                {hiddenCount === 1 ? "" : "s"} hidden from view.
              </p>
              <button
                type="button"
                onClick={restoreHiddenPosts}
                className="font-main inline-flex min-h-11 items-center justify-center rounded-2xl border border-emerald-200 bg-white px-4 font-semibold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
              >
                Restore hidden posts
              </button>
            </section>
          ) : null}

          <section className="mt-6 space-y-5">
            {filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((announcement) => {
                const isExpanded = expandedIds.includes(announcement.id);
                const isLongPost = announcement.body.length > PREVIEW_LIMIT;
                const visibleBody =
                  isExpanded || !isLongPost
                    ? announcement.body
                    : `${announcement.body.slice(0, PREVIEW_LIMIT).trimEnd()}...`;
                const postImage = getPublicAnnouncementImage(announcement);

                return (
                  <article
                    key={announcement.id}
                    id={`announcement-${announcement.id}`}
                    className="rounded-[1.75rem] border border-emerald-100 bg-white px-4 py-4 shadow-[0_18px_50px_-40px_rgba(5,36,16,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_-38px_rgba(5,36,16,0.26)] sm:px-5 sm:py-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <div className="font-main flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-green-200 text-sm font-bold text-emerald-700">
                          {getInitials(announcement.author)}
                        </div>

                        <div className="min-w-0">
                          <p className="font-main truncate text-base font-semibold text-[#052410]">
                            {announcement.author}
                          </p>
                          <p className="font-subtext truncate text-sm text-emerald-900/70">
                            {announcement.role}
                          </p>
                          <p className="font-subtext mt-1 text-xs font-medium text-emerald-900/70">
                            {formatPostedAt(announcement.postedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId((currentId) =>
                              currentId === announcement.id ? null : announcement.id
                            )
                          }
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
                          aria-label={`Post actions for ${announcement.author}`}
                        >
                          <X className="h-4 w-4" />
                        </button>

                        {openMenuId === announcement.id ? (
                          <div className="absolute right-0 top-12 z-10 min-w-40 rounded-2xl border border-emerald-100 bg-white p-2 shadow-xl">
                            <button
                              type="button"
                              onClick={() => hidePost(announcement.id)}
                              className="font-main flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-[#052410] transition hover:bg-emerald-50"
                            >
                              <EyeOff className="h-4 w-4 text-emerald-700" />
                              Hide post
                            </button>
                            <button
                              type="button"
                              onClick={() => removePost(announcement.id)}
                              className="font-main mt-1 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
                            >
                              <Trash2 className="h-4 w-4 text-emerald-700" />
                              Remove post
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={`font-main inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${TYPE_BADGE_STYLES[announcement.type]}`}
                      >
                        {announcement.type}
                      </span>
                      <span className="font-main inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                        <MapPin className="h-3.5 w-3.5" />
                        {announcement.barangay}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-emerald-100 pt-4">
                      <h2 className="font-main text-lg font-semibold leading-snug text-[#052410]">
                        {announcement.title}
                      </h2>

                      {postImage ? (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50">
                          <img
                            src={postImage}
                            alt={announcement.title}
                            className="h-60 w-full object-cover sm:h-72"
                            loading="lazy"
                          />
                        </div>
                      ) : null}

                      <p className="font-main mt-3 whitespace-pre-line text-[15px] leading-7 text-emerald-950/80">
                        {visibleBody}
                      </p>
                      {isLongPost ? (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(announcement.id)}
                          className="font-main mt-3 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
                        >
                          {isExpanded ? "See less" : "See more"}
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-emerald-200 bg-white px-6 py-12 text-center shadow-sm">
                <Search className="mx-auto h-12 w-12 text-emerald-400" />
                <h3 className="font-main mt-4 text-xl font-semibold text-[#052410]">
                  No announcements matched your filters
                </h3>
                <p className="font-subtext mt-2 text-emerald-950/80">
                  Try another keyword, adjust the type or barangay, or restore
                  the sample feed to show removed posts again.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
  );
}
