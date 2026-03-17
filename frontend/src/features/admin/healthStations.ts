export interface HealthStation {
  id: number;
  name: string;
}

// Seeded in Phase 1 (01-03-PLAN). IDs match alembic seed order 1-32.
// Update from actual DB if IDs differ — check with:
// docker-compose exec db psql -U hsms_user -d hsms -c "SELECT id, name FROM health_stations ORDER BY id"
export const HEALTH_STATIONS: HealthStation[] = [
  { id: 1, name: "Burol BHS" },
  { id: 2, name: "Burol I BHS" },
  { id: 3, name: "Burol II BHS" },
  { id: 4, name: "Burol III BHS" },
  { id: 5, name: "Datu Esmael BHS" },
  { id: 6, name: "Emmanuel Bergado I BHS" },
  { id: 7, name: "Emmanuel Bergado II BHS" },
  { id: 8, name: "Fatima I BHS" },
  { id: 9, name: "Fatima II BHS" },
  { id: 10, name: "Fatima III BHS" },
  { id: 11, name: "Francisco I BHS" },
  { id: 12, name: "Francisco II BHS" },
  { id: 13, name: "Habay I BHS" },
  { id: 14, name: "Habay II BHS" },
  { id: 15, name: "Halang BHS" },
  { id: 16, name: "Lantic BHS" },
  { id: 17, name: "Mabolo I BHS" },
  { id: 18, name: "Mabolo II BHS" },
  { id: 19, name: "Mabolo III BHS" },
  { id: 20, name: "Malagasang I-A BHS" },
  { id: 21, name: "Malagasang I-B BHS" },
  { id: 22, name: "Malagasang I-C BHS" },
  { id: 23, name: "Malagasang I-D BHS" },
  { id: 24, name: "Malagasang I-E BHS" },
  { id: 25, name: "Malagasang I-F BHS" },
  { id: 26, name: "Malagasang I-G BHS" },
  { id: 27, name: "Malagasang II-A BHS" },
  { id: 28, name: "Malagasang II-B BHS" },
  { id: 29, name: "Malagasang II-C BHS" },
  { id: 30, name: "Paliparan I BHS" },
  { id: 31, name: "Paliparan II BHS" },
  { id: 32, name: "Paliparan III BHS" },
];
