export type PublicAnnouncementType = "Notice" | "Advisory" | "Event";

export interface PublicAnnouncementSeed {
  id: string;
  type: PublicAnnouncementType;
  barangay: string;
  postedAt: string;
  title: string;
  body: string;
  imageUrl?: string;
  image_url?: string;
}

export const PUBLIC_ANNOUNCEMENT_FEED: PublicAnnouncementSeed[] = [
  {
    id: "ann-001",
    type: "Notice",
    barangay: "San Nicolas I",
    postedAt: "2026-04-15T15:45:00+08:00",
    title: "Prenatal consultation hours moved to Friday morning",
    body:
      "Starting April 15, 2026, prenatal consultation at the San Nicolas I Barangay Health Station will begin at 8:00 AM every Friday instead of 1:00 PM.\n\nPatients scheduled for blood pressure monitoring, fetal heart tone assessment, or routine prenatal follow-up are advised to arrive at least 15 minutes early and bring their maternal record booklet for faster triage.",
    imageUrl:
      "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "ann-002",
    type: "Advisory",
    barangay: "Salawag",
    postedAt: "2026-04-15T11:10:00+08:00",
    title: "Heat index advisory for home visits and outdoor queues",
    body:
      "Because of the expected high heat index this week, all waiting areas for immunization and outpatient consultations in Salawag should prioritize shaded seating, drinking water access, and shorter outdoor queues.\n\nParents with infants, senior citizens, and pregnant patients are encouraged to use the covered waiting zone beside the health station and avoid late-morning walk-ins whenever possible.",
  },
  {
    id: "ann-003",
    type: "Event",
    barangay: "Santa Fe",
    postedAt: "2026-04-14T16:25:00+08:00",
    title: "Saturday catch-up immunization drive this April 18",
    body:
      "A catch-up immunization event will be held on April 18, 2026 from 8:30 AM to 2:30 PM at the Santa Fe covered court.\n\nChildren with incomplete routine vaccines may receive missed doses after screening by station staff. Please bring the child health card, drinking water, and a small towel. Priority lanes will be available for children under two years old and families from nearby puroks.",
    image_url:
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "ann-004",
    type: "Advisory",
    barangay: "Burol II",
    postedAt: "2026-04-14T09:05:00+08:00",
    title: "Immediate reporting reminder for fever with rash clusters",
    body:
      "Community volunteers and station staff serving Burol II are reminded to report any suspected cluster of fever with rash on the same day to the CHO II surveillance desk.\n\nUse the rapid notification channel before end of shift, especially if two or more cases are observed in the same classroom, purok, or daycare setting.\n\nThis reminder is for early detection only and should be paired with standard clinical assessment and isolation guidance.",
  },
  {
    id: "ann-005",
    type: "Notice",
    barangay: "San Simon (Barangay 7)",
    postedAt: "2026-04-13T13:40:00+08:00",
    title: "Weight monitoring resumes at the station lobby",
    body:
      "Monthly weight monitoring for children 0 to 59 months in San Simon resumes at the station lobby beginning April 16, 2026.\n\nParents should bring the child growth card and arrive according to the purok schedule already posted at the station entrance. Children with recent fever, cough, or diarrhea may still be assessed, but they will be guided to the side evaluation area first.",
  },
  {
    id: "ann-006",
    type: "Event",
    barangay: "Victoria Reyes",
    postedAt: "2026-04-13T08:20:00+08:00",
    title: "Family planning counseling block scheduled for Wednesday",
    body:
      "On April 16, 2026, Victoria Reyes Barangay Health Station will hold a focused family planning counseling block from 1:00 PM to 4:00 PM.\n\nClients interested in pills, injectables, implants, or postpartum family planning counseling may attend. New clients should bring a valid ID and be prepared for blood pressure screening before method selection. Returning clients should bring their existing follow-up card for continuity of records.",
  },
  {
    id: "ann-007",
    type: "Notice",
    barangay: "San Andres I",
    postedAt: "2026-04-12T17:55:00+08:00",
    title: "April reporting cut-off for station summaries",
    body:
      "All encoded station summaries affecting San Andres I service coverage must be finalized before 5:00 PM on April 20, 2026 so the city consolidation team can complete the monthly review window on time.\n\nPlease verify patient counts, late validations, and returned records before the cut-off to avoid discrepancies during PHN consolidation.",
  },
  {
    id: "ann-008",
    type: "Advisory",
    barangay: "San Dionisio",
    postedAt: "2026-04-12T10:15:00+08:00",
    title: "Temporary triage flow for patients with cough and fever",
    body:
      "Beginning today, patients from San Dionisio reporting cough, fever, or breathing difficulty will be screened first at the side triage desk before entering the main consultation area.\n\nThis temporary flow is meant to reduce crowding and keep well-child services separated from symptomatic cases.\n\nStaff on morning duty should reinforce masking for symptomatic patients and direct companions to the outer waiting seats unless they are needed for clinical assistance.",
  },
];

export function getPublicAnnouncementImage(post: PublicAnnouncementSeed) {
  return post.imageUrl ?? post.image_url ?? null;
}

export function getPublicAnnouncementSummary(post: PublicAnnouncementSeed, limit = 110) {
  const normalizedBody = post.body.replace(/\s+/g, " ").trim();
  if (normalizedBody.length <= limit) {
    return normalizedBody;
  }

  return `${normalizedBody.slice(0, limit).trimEnd()}...`;
}