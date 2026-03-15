# Feature Landscape

**Domain:** Philippine Barangay Health Station Management System (primary care HMIS)
**Researched:** 2026-03-15
**Competitors analyzed:** CHITS (UP Manila/NTCH), iClinicSys (DOH), DHIS2 (generic), OpenSRP (global CHW platform)

---

## Table Stakes

Features users expect from any BHS-level health information system. Missing any of these means health workers will reject the system or revert to paper.

### Patient Records

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Unified Individual Treatment Record (ITR) | Paper ITR is the backbone of every BHS encounter; digitizing it is the minimum viable product. Both CHITS and iClinicSys provide this. | Medium | City-wide search via GIN index on name/birthdate. Must handle Filipino naming conventions (multiple middle names, suffixes like Jr./III). |
| Patient demographics with PSGC-coded address | DOH requires PSGC (Philippine Standard Geographic Code) on all FHSIS submissions. iClinicSys enforces this. | Low | Barangay + purok granularity. Pre-seeded for Dasmarinas City 32 barangays. |
| Patient search (name, birthdate, barangay) | Paper ledgers are unsearchable. Instant search is the #1 cited benefit by CHITS users. | Low | Fuzzy/phonetic search is a differentiator (see below); basic exact search is table stakes. |
| Duplicate patient prevention | A single patient enrolled in prenatal, EPI, NCD, and TB must not have four records. Both CHITS and iClinicSys suffer from duplicate records in practice. | Medium | Match on name + birthdate + barangay. Merge workflow is Phase 2; prevention is Phase 1. |

### Maternal Care (Prenatal / Postpartum)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Prenatal enrollment and visit recording | Replaces the paper Target Client List (TCL) ledger. Every BHS midwife maintains this manually. DOH Soccsksargen already piloted digital pregnancy tracking. | Medium | Capture: LMP, EDD, gravida/para, risk factors, BP, weight, FHR per visit. |
| Auto-calculated next visit date | Paper system relies on midwife memory. Overdue detection is structurally impossible on paper. CHITS does not auto-schedule. | Low | Based on trimester schedule. Continuous overdue flagging, not month-end tally. |
| Postpartum visit tracking (Day 1 / Week 1 / Week 6) | DOH standard postpartum schedule. Currently tracked by hand in the TCL. | Low | Triggered from manual delivery date entry (BHS does not perform deliveries). |
| High-risk pregnancy flagging | DOH maternal death review protocol requires identifying high-risk pregnancies early. iClinicSys captures risk factors but does not auto-flag. | Low | Flag based on age (<18 or >35), grand multiparity, previous C-section, pre-eclampsia history, anemia. |

### Child Health (EPI + Nutrition)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| EPI vaccination recording with dose sequence enforcement | DOH EPI program is the highest-priority child health intervention. FIC (Fully Immunized Child) rate is the #1 child health indicator. | Medium | Enforce vaccine schedule: BCG, Penta 1-2-3, OPV 1-2-3, IPV 1-2, PCV 1-2-3, MMR 1-2, etc. per DOH 2024 schedule. |
| EPI defaulter detection | Finding children who missed scheduled doses is the primary use case for BHW field work. Paper-based defaulter lists take days to compile manually. | Medium | Real-time detection at moment scheduled dose date passes, not at month-end tally. This is a critical workflow improvement over paper. |
| FIC computation | FHSIS M1 requires FIC count. Currently hand-tallied. | Low | Auto-compute from completed dose records per DOH definition. |
| Nutrition assessment with WHO Z-scores (WAZ, HAZ, WHZ) | Operation Timbang Plus (OPT+) is a mandated DOH program. Z-score classification determines nutritional status. WHO Anthro is the global standard. | Medium | Auto-classify: normal, mild underweight, moderate underweight, severe underweight, stunted, wasted, severely wasted per WHO 2006 growth standards. |
| Growth monitoring (longitudinal child record) | BHWs track weight monthly. Paper growth charts are error-prone. | Low | Store weight/height per visit, plot against WHO reference curves. |

### TB-DOTS

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| TB case registration | DOH National TB Program (NTP) requires case registration at treatment facility level. The DOH has ITIS nationally, but BHS-level recording feeds into it. | Medium | Capture: classification (new, relapse, etc.), category, bacteriological status, regimen. |
| Daily DOTS visit recording | DOTS = Directly Observed Treatment, Short-course. Treatment supporter records each dose taken. This is a daily workflow. | Medium | Per-drug tracking (H, R, Z, E, S). Intensive phase (2 months) + continuation phase (4-6 months). |
| Sputum exam schedule tracking | Month 0/2/5/6 sputum exams are mandated for treatment monitoring. Overdue sputum exams are a major NTP compliance gap. | Low | Auto-flag overdue sputum based on treatment start date. |
| Contact tracing records | NTP protocol requires screening household contacts of confirmed TB cases. | Low | Link contacts to index case. Flag for follow-up. |

### NCD Management (HTN/DM)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| HTN + DM enrollment and visit recording | PhilPEN protocol mandates structured management of HTN/DM at primary care level. PhilHealth Primary Care Benefit requires PhilPEN adoption. | Medium | Capture: BP readings, FBS/RBS/HbA1c, medications, complications, lifestyle risk factors. |
| PhilPEN risk stratification | DOH Manual of Operations for PhilPEN specifies cardiovascular risk assessment. iClinicSys captures this but nurses report poor usability. | Medium | WHO/ISH CVD risk chart adapted for Philippines. Color-coded risk level (green/yellow/orange/red). |
| Controlled vs. uncontrolled status per visit | FHSIS M1 NCD indicator requires count of controlled vs. uncontrolled patients. Paper tally is error-prone. | Low | Auto-classify from BP thresholds (HTN) and FBS/HbA1c thresholds (DM). |
| Monthly next-visit auto-calculation | NCD patients need monthly follow-up. Overdue NCD patients are a major FHSIS reporting gap. | Low | Same pattern as prenatal scheduling. |

### Disease Surveillance (PIDSR)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Category I disease case entry with immediate notification | RA 11332 mandates reporting within 24 hours. This is legally required and the core value proposition of Project LINK. | High | Immediate WebSocket broadcast to DSO + CHO. Must work even if DSO is offline (persistent alert queue). |
| Category II disease case entry with weekly batch export | PIDSR protocol for weekly notifiable diseases. DSO compiles every Friday. | Medium | PDF/Excel export formatted for PHO submission. |
| PIDSR validation workflow | DSO must validate case reports before submission. No existing Philippine BHS system provides a digital validation workflow. | Medium | `validated_at` timestamp gap = RA 11332 compliance metric. |
| Notifiable disease list per DOH classification | Must match current DOH Category I and II disease lists. | Low | Seed from AO 2020-0057 / AO 2021-0057 disease list. |

### FHSIS Reporting

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| M1 (Monthly Program Report) auto-generation | The #1 pain point for CHO 2: a single encoder handles 192+ reports/month. CHITS and iClinicSys both attempt FHSIS auto-generation but with incomplete coverage. | High | DOH DM 2024-0007 indicator formulas. Covers maternal care, child health, EPI, NCD, TB indicators. |
| M2 (Morbidity Report) auto-generation | Monthly morbidity by age/sex. Currently hand-tallied from consultation logs. | High | Aggregate morbidity from consultation diagnoses grouped by ICD-10 categories. |
| Q1 (Quarterly Report) auto-generation | Quarterly summary with demographic + environmental data. | Medium | Aggregates M1 indicators + additional quarterly-only indicators. |
| A1 (Annual Report) auto-generation | Annual summary with vital statistics. | Medium | Aggregates Q1 + natality/mortality data. |
| PHIS Coordinator per-indicator verification before export | DOH requires manual verification before PHO submission. Neither CHITS nor iClinicSys provides a structured verification workflow. | Medium | Checkbox per indicator. Export locked until all verified. |
| PDF + Excel export | PHO submission requires both formats. | Low | Formatted per DOH template. |

### User Management & Security

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Role-based access control (7 roles) | Clinical data access must be restricted by role. RA 10173 requires it. | Medium | system_admin, city_health_officer, physician, phis_coordinator, DSO, nurse/midwife, BHW. |
| Barangay data isolation | Nurse at BHS-A must not see BHS-B patient records. CHO-level roles see all. | Medium | Enforced at repository layer, not UI layer. |
| Audit logging (append-only) | RA 10173 Data Privacy Act compliance. | Medium | No PII in log entries. WHO did what, when, to which record. |
| Soft deletes only | RA 10173 compliance. Clinical records must never be permanently deleted. | Low | `deleted_at TIMESTAMPTZ` on all clinical tables. |
| JWT authentication with refresh tokens | Standard modern auth. | Low | Session persistence across browser close. |

### Basic Inventory

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Item catalog (medicines, vaccines, supplies) | Nurses currently track stock in notebooks. Any system claiming to manage a BHS must track supplies. | Low | Seeded from CHO 2 data. |
| Per-BHS stock levels and transaction log | Know what each station has. In/out/adjustment with timestamp + user. | Low | Not full supply chain management -- just current levels. |
| Low-stock alerts on dashboard | Prevent stockouts of critical vaccines and medicines. | Low | Threshold-based alerts. |

---

## Differentiators

Features that set Project LINK apart from CHITS, iClinicSys, and DHIS2. Not expected by users but create significant competitive advantage.

### Offline-First BHW Mobile Entry (PWA)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| IndexedDB + Service Worker offline data entry | **Critical gap in competitors.** iClinicSys claims hybrid offline/online but users report syncing difficulties. CHITS has no true offline mode. BHWs work in areas with zero connectivity. | High | PWA avoids app store distribution. BHW uses phone browser. |
| Background sync on reconnect | Data entered offline flows to server automatically when connectivity returns. OpenSRP (global platform) does this well; no Philippine system does. | High | POST /api/sync/batch. Queue management. Retry logic. |
| Conflict resolution with nurse review queue | Clinical conflicts (same patient, different data) cannot be silently overwritten. This is a patient safety feature no competitor has. | High | Server `updated_at` wins for metadata; clinical field conflicts require nurse approval. |
| Deduplication on sync | BHW might submit same record twice from intermittent connectivity. | Medium | Reject exact duplicate on `patient_id + record_type + date + bhw_id`. |
| BHW approval workflow | BHW records require nurse/midwife approval before becoming official. This enforces clinical oversight. | Medium | Status: PENDING -> APPROVED / REJECTED. Nurse review queue. |

### GIS Disease Mapping

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Barangay-level choropleth map | **No existing Philippine BHS system provides integrated GIS visualization.** DHIS2 has GIS but is not deployed at BHS level in Philippines. DOH PCHRD has used GIS for research (Quezon City dengue mapping) but not as a real-time operational tool. | High | MapLibre GL JS + PostGIS. Color-coded disease incidence by barangay. |
| Purok-level heatmap | Sub-barangay granularity. Puroks are the smallest administrative unit. No competitor offers this. | High | Requires purok-level geocoding. Heat intensity from case density. |
| Disease type / barangay / date range filtering | Interactive exploration for DSO and CHO. | Medium | All spatial responses use ST_AsGeoJSON() (RFC 7946). |
| DBSCAN spatial clustering for outbreak detection | Algorithmic identification of disease clusters that human visual inspection might miss. Research-grade capability in an operational tool. | High | scikit-learn DBSCAN on geocoded case locations. |

### ML Predictive Analytics

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Prophet-based outbreak forecasting per disease per barangay | **No Philippine BHS system offers predictive disease forecasting.** A Cebu City dengue study used similar models for research; Project LINK operationalizes this. | High | Time-series forecasting from historical case data. Weekly/monthly projections. |
| At-risk patient flagging (ML classifier) | Moves from reactive to proactive care. Flag prenatal high-risk, severely wasted children, uncontrolled NCD patients before adverse events. | High | scikit-learn classifier trained on program-specific risk factors. |
| Barangay risk index (composite nightly score) | Single number summarizing health risk per barangay. CHO can prioritize resource allocation. No competitor offers this. | High | Celery nightly job. Composite of disease counts + overdue patients + EPI gaps + NCD uncontrolled rates. |
| Confidence labeling on all ML outputs | Transparent AI. Users know whether predictions come from HISTORICAL, SYNTHETIC, or MIXED data. | Low | Mandatory label prevents overreliance on synthetic-data models. |

### Real-Time Alert System

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| WebSocket-based Category I disease alerts | **Structurally impossible under paper and impractical in CHITS/iClinicSys.** The 24-hour RA 11332 window requires instant notification, not end-of-day batch. | High | Case entry -> INSERT disease_alerts -> WebSocket broadcast to DSO + CHO simultaneously. |
| Persistent unread alert state per user | DSO who was offline when alert fired sees it on next login. No alert is silently lost. | Medium | Per-user read/unread tracking. |
| Severe wasting ML trigger alert | Child classified as severely wasted triggers immediate clinical alert. Currently detected only at monthly OPT+ tally. | Medium | Auto-fires when nutrition Z-score crosses severe wasting threshold. |

### Continuous Overdue Detection

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Real-time overdue detection (not month-end tally) | **Fundamental architectural advantage over paper and CHITS.** Paper systems detect overdue patients when midwife manually reviews ledger (monthly at best). Project LINK detects at the moment a scheduled date passes. | Medium | Applies across all programs: prenatal visits, EPI doses, sputum exams, NCD follow-ups. |
| Overdue patient lists on nurse/midwife dashboard | Actionable: nurse sees which patients to contact today. | Low | Sorted by days overdue. Filterable by program. |
| Overdue metrics feeding barangay risk index | Overdue rates become input to ML risk scoring. | Low | Automatic -- no manual compilation. |

### Supervisory Intelligence (CHO Tier)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| City-wide dashboards for CHO | **CHITS provides facility-level views only.** iClinicSys claims multi-facility but CHO-level aggregation is weak. Project LINK provides true city-wide operational intelligence across 32 BHS. | High | Program coverage rates, disease trends, overdue rates, inventory status -- all aggregated. |
| Cross-BHS comparison | Which barangays are underperforming? Where are EPI defaulter rates highest? | Medium | Enables targeted supervision and resource allocation. |
| FHSIS compliance monitoring | Track which BHS have submitted, which indicators are verified, export status. | Medium | PHIS Coordinator workflow visibility. |

---

## Anti-Features

Features to explicitly NOT build. Critical for scope control within the 4-month capstone constraint.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **PhilHealth billing / eKonsulta integration** | Separate operational domain with its own regulatory complexity. iClinicSys already handles this. Adding billing would double the scope. | Focus on clinical records and public health reporting. PhilHealth integration is a post-deployment concern. |
| **Full supply chain management (PAR, cold chain, expiry/batch, supplier tracking, procurement, AI reorder)** | Inventory management alone could be a full capstone project. Cold chain monitoring requires hardware integration. | Basic stock levels + transaction log + low-stock alerts only. Full inventory is Phase 2. |
| **SMS/push notification for alerts** | Requires SMS gateway integration (Globe/Smart API), per-message costs, and telco-specific compliance. WebSocket is sufficient for in-app users. | WebSocket real-time alerts for Phase 1. SMS fallback is Phase 2. |
| **Family Planning module** | FHSIS M1 MCPR indicator requires FP data, but FP is a complex domain (method-specific tracking, side effects, switching). Accept the M1 gap. | Defer to Phase 2. Document as known FHSIS reporting gap. |
| **Newborn Care / Essential Newborn Care (ENC)** | ENC requires delivery records. BHS does not perform deliveries. Tracking newborn screening results requires hospital interop. | Defer to Phase 2. Newborn appears in EPI module once registered. |
| **IMCI / Sick Child module** | Integrated Management of Childhood Illness is a clinical decision protocol with branching logic. High complexity for low FHSIS impact. | Defer to Phase 2. Sick child consultations captured in general ITR. |
| **Animal Bite / ABTC full PEP tracking** | PEP (Post-Exposure Prophylaxis) dose tracking is a niche module. Rabies death can be reported via PIDSR Category I. | Cover rabies via PIDSR "Unusual Event" category. Full ABTC is Phase 2. |
| **Hospital clinical management** | Out of CHO 2 scope. Hospitals have their own systems (iHOMIS, vendor EMRs). | No hospital features. BHS/CHO scope only. |
| **Cross-CHO patient continuity** | Would require inter-system data sharing, identity federation, and political coordination across CHO 1-5. | Single-CHO deployment. Patient transfers handled manually. |
| **PHO/regional integration (NHDR, iHOMIS API)** | No stable DOH API exists for integration. Would add external dependency with no SLA. | PDF/Excel export for manual PHO submission. API integration is post-deployment. |
| **Online public appointment booking** | Not how BHS works. Patients walk in or BHWs conduct household visits. Adding appointment booking adds UX complexity for zero operational value. | No appointment system. Encounter-based recording only. |
| **Intrapartum/delivery records** | BHS does not perform deliveries. This is hospital/birthing clinic scope. | Record delivery date and outcome from external source for postpartum tracking. |
| **LSTM / deep learning models** | Requires substantial historical data that may not exist. Prophet and scikit-learn are sufficient for Phase 1 forecasting. Training infrastructure for LSTM is overkill. | Prophet for time-series. scikit-learn for classification. LSTM optional in Phase 2 if data volume justifies it. |
| **Multi-language UI** | All CHO 2 staff speak Filipino and English. Building i18n infrastructure adds complexity for zero user benefit. | English UI with Filipino labels where clinically relevant (e.g., purok names, local disease names). |
| **Custom report builder** | Users will not design their own reports. DOH prescribes exact FHSIS formats. A report builder adds complexity and confuses users. | Fixed FHSIS report templates (M1, M2, Q1, A1). Dashboards for operational insights. |
| **Patient portal / patient-facing app** | BHS patients are low-literacy community members. A patient portal adds security surface area and support burden for near-zero adoption. | All data entry by health workers (nurse, midwife, BHW). No patient self-service. |
| **Cancer screening (VIA/CBE), Senior Citizen, Mental Health, Drug/CBR, Dental** | Each is a full program module. None are high-priority FHSIS indicators for Phase 1. | Defer all to Phase 2+. |
| **Malaria, Schistosomiasis, Leprosy, Filariasis modules** | Not endemic in Dasmarinas City (urban lowland, Cavite province). Building these wastes time. | If a case appears, report via PIDSR surveillance. No dedicated program module needed. |
| **STI / National AIDS Control Program** | Sensitive data handling requirements (RA 11166 Philippine HIV/AIDS Policy Act) add regulatory complexity beyond RA 10173. | Defer to Phase 2 with dedicated privacy impact assessment. |
| **Environmental Health & Sanitation module** | FHSIS A1 has environmental indicators but they are annual, low-priority, and not clinical. | Capture in A1 via manual entry fields. No dedicated module. |

---

## Feature Dependencies

```
Authentication + RBAC + Barangay Isolation
  |
  +-> Patient ITR (unified patient identity)
  |     |
  |     +-> Prenatal enrollment + visits
  |     |     +-> Postpartum tracking (requires delivery date)
  |     |     +-> High-risk flagging
  |     |     +-> Prenatal overdue detection
  |     |
  |     +-> EPI enrollment + vaccination records
  |     |     +-> FIC computation
  |     |     +-> Defaulter detection
  |     |
  |     +-> Nutrition (OPT+) enrollment + visits
  |     |     +-> WHO Z-score classification
  |     |     +-> Severe wasting ML alert trigger
  |     |
  |     +-> TB case registration
  |     |     +-> DOTS visit recording
  |     |     +-> Sputum schedule tracking
  |     |     +-> Contact tracing
  |     |     +-> TB -> PIDSR auto-feed
  |     |
  |     +-> NCD enrollment + visits
  |     |     +-> PhilPEN risk stratification
  |     |     +-> Controlled/uncontrolled classification
  |     |     +-> NCD overdue detection
  |     |
  |     +-> Disease case entry (PIDSR)
  |           +-> Category I -> WebSocket alert broadcast
  |           +-> Category II -> Weekly batch export
  |           +-> PIDSR validation workflow
  |
  +-> Inventory (item catalog + stock levels)
  |     +-> Low-stock alerts
  |
  +-> FHSIS auto-generation (M1, M2, Q1, A1)
  |     DEPENDS ON: All program modules populated with data
  |     +-> PHIS Coordinator verification workflow
  |     +-> PDF/Excel export
  |
  +-> GIS disease mapping
  |     DEPENDS ON: Disease cases with geocoded locations
  |     +-> Choropleth + heatmap
  |     +-> DBSCAN clustering
  |
  +-> ML predictive analytics
  |     DEPENDS ON: Historical program data (or synthetic seed)
  |     +-> Outbreak forecasting (Prophet)
  |     +-> At-risk patient flagging (scikit-learn)
  |     +-> Barangay risk index (Celery nightly)
  |
  +-> Offline/PWA (BHW mobile entry)
  |     DEPENDS ON: Patient ITR + program enrollment APIs
  |     +-> IndexedDB storage
  |     +-> Service Worker background sync
  |     +-> Conflict resolution
  |     +-> Nurse review/approval queue
  |
  +-> CHO dashboards + supervisory views
        DEPENDS ON: All program modules + FHSIS engine
```

---

## MVP Recommendation

### Must ship in Phase 1 (4-month capstone):

**Priority 1 -- Foundation (Week 1-3):**
1. Auth + RBAC + barangay isolation
2. Patient ITR with city-wide search
3. Audit logging + soft deletes

**Priority 2 -- Core Programs (Week 3-8):**
4. Prenatal enrollment + visits + overdue detection
5. Postpartum tracking
6. EPI enrollment + vaccination + defaulter detection + FIC
7. Nutrition with WHO Z-score classification
8. TB-DOTS case registration + daily visit + sputum tracking
9. NCD enrollment + visits + PhilPEN risk stratification

**Priority 3 -- Surveillance & Reporting (Week 6-12):**
10. Disease surveillance (PIDSR) Category I + II
11. Category I WebSocket real-time alerts
12. FHSIS M1 + M2 auto-generation
13. FHSIS Q1 + A1 auto-generation
14. PHIS Coordinator verification + export

**Priority 4 -- Differentiators (Week 8-14):**
15. Basic inventory (catalog + stock levels + low-stock alerts)
16. GIS choropleth + heatmap disease mapping
17. Offline BHW mobile entry (PWA)

**Priority 5 -- Intelligence (Week 10-16):**
18. ML outbreak forecasting (Prophet)
19. At-risk patient flagging (scikit-learn)
20. Barangay risk index (Celery nightly)
21. CHO supervisory dashboards

### Defer to Phase 2:
- Family Planning, Newborn Care, IMCI, Animal Bite/ABTC
- Full inventory (cold chain, expiry, procurement)
- SMS/push notification fallback
- PHO/regional API integration
- LSTM models
- STI/HIV module

---

## Competitive Positioning vs. Existing Systems

| Capability | CHITS | iClinicSys | DHIS2 | Project LINK |
|------------|-------|------------|-------|--------------|
| Patient EMR | Yes (OpenMRS-based) | Yes | Limited (aggregate focus) | Yes |
| Offline BHW mobile entry | No (rCHITS mobile is aggregate only) | Claims hybrid but sync issues reported | Offline Android app (DHIS2 Capture) | PWA with IndexedDB + background sync |
| Real-time disease alerts | No | No | No (batch reporting) | WebSocket instant broadcast |
| GIS disease mapping | No | No | Yes (but not BHS-level) | Barangay + purok level with DBSCAN |
| ML outbreak forecasting | No | No | No | Prophet per disease per barangay |
| FHSIS auto-generation | Partial (pre-2024 indicators) | Partial (DOH-aligned but gaps reported) | Not Philippines-specific | DM 2024-0007 compliant |
| Continuous overdue detection | No (month-end tally) | Unknown | No (aggregate) | Real-time per scheduled date |
| CHO-level supervisory dashboards | Facility-level only | Multi-facility but weak aggregation | Strong dashboards | City-wide across 32 BHS |
| BHW approval workflow | No | No | No | Nurse review queue for all BHW records |
| Conflict resolution (clinical safety) | N/A (no offline) | Unreported | Basic merge | Clinical conflicts -> nurse review |

**Project LINK's competitive moat:** The combination of offline-first BHW mobile entry, real-time Category I disease alerts, GIS disease mapping at purok-level, and ML outbreak forecasting. No single Philippine system offers all four. CHITS and iClinicSys are facility-centric; Project LINK extends to the field worker and the city supervisor simultaneously.

---

## Sources

- [CHITS - Philippine Council for Health Research and Development](https://www.pchrd.dost.gov.ph/heartnovation/community-health-information-tracking-system-chits/)
- [CHITS Lessons from Eight Years Implementation](https://actamedicaphilippina.upm.edu.ph/index.php/acta/article/view/769)
- [iClinicSys - DOH Region 2](https://ro2.doh.gov.ph/electronic-medical-record/iclinicsys)
- [iClinicSys Features and Impact - DOH Region 2](https://ro2.doh.gov.ph/electronic-medical-record/iclinicsys/620-transforming-healthcare-management-exploring-the-features-and-impact-of-iclinicsys)
- [Implementation of iClinicSys in Rural Health Units](https://uijrt.com/paper/implementation-iclinicsys-rural-health-units)
- [Formative Evaluation of eHealth in the Philippines (PMC 2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11272894/)
- [Promises and Realities of EHR in Philippines (PMC 2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11732589/)
- [RA 11332 - Mandatory Reporting of Notifiable Diseases](https://lawphil.net/statutes/repacts/ra2019/ra_11332_2019.html)
- [DOH DM 2024-0007 - FHSIS Indicators](https://www.scribd.com/document/964341282/DOH-DM-2024-0007-FHSIS-Indicators)
- [PhilPEN Manual of Operations](https://www.scribd.com/document/422838177/DOH-Manual-of-Operations-PhilPEN)
- [DOH Pioneers High-Risk Pregnancy Tracking in Soccsksargen](https://pia.gov.ph/news/doh-pioneers-high-risk-pregnancy-tracking-in-soccsksargen/)
- [OpenSRP App Features](https://docs.opensrp.io/features/app-features)
- [DHIS2 Health Data Toolkit](https://dhis2.org/health-data-toolkit/)
- [DOH NTP Manual of Operations 6th Edition](https://itis.doh.gov.ph/assets/img/downloads/mop/NTP_MOP_6th_Edition.pdf)
- [EPI Philippines - DOH](https://doh.gov.ph/uhc/health-programs/expanded-program-on-immunization/)
- [GIS for Disease Tracking in PH - PCHRD](https://www.pchrd.dost.gov.ph/news_and_updates/geographic-information-system-a-tool-for-tracking-diseases-in-ph/)
- [Dengue Prediction Models in Cebu City (PMC 2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10793016/)
- [WHO Anthro Software Manual](https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/software/anthro-pc-manual-v322.pdf)
