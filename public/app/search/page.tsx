import { PublicSiteSearch } from "../../components/PublicSiteSearch";

export default function Page({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  return <PublicSiteSearch mode="page" initialQuery={searchParams?.q ?? ""} />;
}
