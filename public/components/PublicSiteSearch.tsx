"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Sparkles, X } from "lucide-react";

import {
  FEATURED_SITE_SEARCH_ENTRIES,
  searchSiteContent,
  type SiteSearchCategory,
  type SiteSearchResult,
} from "../lib/siteSearch";

interface PublicSiteSearchProps {
  mode: "dialog" | "page";
  initialQuery?: string;
  onNavigate?: () => void;
  onClose?: () => void;
}

const CATEGORY_STYLES: Record<SiteSearchCategory, string> = {
  Page: "bg-emerald-100 text-emerald-800",
  Program: "bg-teal-100 text-teal-800",
  Announcement: "bg-cyan-100 text-cyan-800",
  Contact: "bg-lime-100 text-lime-800",
  Reference: "bg-stone-100 text-stone-700",
};

function SearchResultCard({
  result,
  onNavigate,
}: {
  result: SiteSearchResult;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={result.href}
      onClick={onNavigate}
      className="group block rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm shadow-emerald-950/5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] ${CATEGORY_STYLES[result.category]}`}>
              {result.category}
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-800/55">
              CHO2
            </span>
          </div>
          <h3 className="mt-3 font-main text-base font-bold text-emerald-950 transition group-hover:text-emerald-700">
            {result.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-emerald-950/70">
            {result.summary}
          </p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-emerald-700 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export function PublicSiteSearch({
  mode,
  initialQuery = "",
  onNavigate,
  onClose,
}: PublicSiteSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => searchSiteContent(deferredQuery), [deferredQuery]);
  const isShowingFeatured = deferredQuery.trim().length === 0;
  const visibleEntries = isShowingFeatured
    ? FEATURED_SITE_SEARCH_ENTRIES.map((entry) => ({
        ...entry,
        score: 0,
      }))
    : results;

  return (
    <section
      className={
        mode === "page"
          ? "mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8"
          : "flex max-h-[82vh] flex-col"
      }
    >
      <div className="rounded-[2rem] border border-emerald-100 bg-[#eef7f3] shadow-[0_28px_90px_-55px_rgba(5,36,16,0.35)]">
        <div className="relative overflow-hidden rounded-[2rem] px-5 py-5 sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-8 top-2 h-24 w-24 rounded-full bg-emerald-300/25 blur-3xl" />
            <div className="absolute right-2 top-4 h-28 w-28 rounded-full bg-cyan-300/25 blur-3xl" />
          </div>

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="font-subtext text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700/80">
                Search the whole site
              </p>
              <h2 className="font-main mt-2 text-2xl font-extrabold text-emerald-950 sm:text-3xl">
                Find services, announcements, and information.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-950/70 sm:text-base">
                Search across the home page, about page, health programs, and public announcements without jumping to the announcement page search.
              </p>
            </div>

            {mode === "dialog" && onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-emerald-700 shadow-sm transition hover:bg-white hover:text-emerald-800"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>

          <label className="relative mt-5 block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search services, updates, contact details, and announcements"
              className="font-main min-h-14 w-full rounded-2xl border border-emerald-100 bg-white px-12 py-3 text-sm text-emerald-950 outline-none transition placeholder:text-emerald-900/35 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
        </div>

        <div className={mode === "page" ? "px-5 pb-6 sm:px-6" : "px-5 pb-5 sm:px-6"}>
          <div className="mt-1 flex items-center justify-between gap-3 border-b border-emerald-100 pb-4">
            <p className="font-subtext text-sm text-emerald-950/70">
              {isShowingFeatured
                ? "Popular destinations and quick links from the site."
                : `${results.length} result${results.length === 1 ? "" : "s"} found for "${query.trim()}".`}
            </p>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
              <Sparkles className="h-3.5 w-3.5" />
              Live index
            </span>
          </div>

          <div className={mode === "dialog" ? "mt-4 max-h-[52vh] space-y-3 overflow-y-auto pr-1" : "mt-4 grid gap-3 md:grid-cols-2"}>
            {visibleEntries.length > 0 ? (
              visibleEntries.map((result) => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  onNavigate={() => {
                    onNavigate?.();
                    onClose?.();
                  }}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/80 p-6 text-center text-sm text-emerald-950/70 md:col-span-2">
                No site content matched your search. Try a different keyword or search for a page name like services, about, or announcements.
              </div>
            )}
          </div>

          {mode === "page" ? (
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-white/80 p-4 text-sm text-emerald-950/70">
              Try searching for program names like consultation or immunization, or announcement topics like vaccination and advisory.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}