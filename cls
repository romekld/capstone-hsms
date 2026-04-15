[33mcommit 2af6af9e128f115c82d1ac3e6699e502f5062abf[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmy-new-branch[m[33m)[m
Author: dm <dvmillomeda@kld.edu.ph>
Date:   Thu Apr 16 01:06:41 2026 +0800

    4/16 changes

[33mcommit a8e15a2ef15519eda119600dda4e556a7496716e[m
Author: dm <dvmillomeda@kld.edu.ph>
Date:   Thu Apr 9 19:49:34 2026 +0800

    The Change

[33mcommit 38bafc7a49a6e3f31e0f1811c35b91d1f6b5e9a2[m
Author: dm <dvmillomeda@kld.edu.ph>
Date:   Thu Apr 9 16:13:33 2026 +0800

    Latest One

[33mcommit da7e0050e690db1dd295fecee2abc2192e9be07f[m
Author: dm <dvmillomeda@kld.edu.ph>
Date:   Thu Apr 2 13:59:59 2026 +0800

    The Most Recent Change

[33mcommit 4ad6fd8ce75713bc6e4defbde1cbbfe8dd6dcd29[m
Author: dm <dvmillomeda@kld.edu.ph>
Date:   Tue Mar 31 19:18:50 2026 +0800

    Latest Changes

[33mcommit 004814abab2e02336bd2183bab92131beb8bbd25[m
Author: dm <dvmillomeda@kld.edu.ph>
Date:   Tue Mar 31 18:02:01 2026 +0800

    recent changes

[33mcommit b0115ad72375bd301a4ebe27f847e1a084b45dd5[m
Author: dm <dvmillomeda@kld.edu.ph>
Date:   Tue Mar 31 15:08:32 2026 +0800

    Latest

[33mcommit d29544a04c19ae0e4243b8b84e70653f04eab927[m[33m ([m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m, [m[1;32mmain[m[33m, [m[1;32mfeature/announcement-platform[m[33m, [m[1;32mfeature/announcement[m[33m)[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 10:58:44 2026 +0800

    added: .md file for announcement platform feat

[33mcommit 6000a644600b4c0126369cc92a8ccb665ddf7c5e[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 09:27:33 2026 +0800

    addded: setup instructions

[33mcommit b2a593bafa32172235c054fdbbecc2de67f6f679[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 09:15:10 2026 +0800

    phase 4.1: done discussion and research

[33mcommit f89ec58b5fb2846b905cbc67823c7639be27b11d[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 08:39:29 2026 +0800

    docs(04.2): research phase domain

[33mcommit f9a2a5f98af047f7976678d1b5b39b01b9d600e6[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 08:22:34 2026 +0800

    docs(04.2): update context — TCL filter, standalone PP enrollment, EDC auto-calc, age high-risk, column cap

[33mcommit b8eedec398a1bfd9c168779f2e7a463998bf1f5b[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 08:09:44 2026 +0800

    docs(04.2): update context — Digital TCL pages, two-step build order

[33mcommit 00b8fd3090f61a6816143a76fae0da69cb31d63a[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 07:58:08 2026 +0800

    docs(state): record phase 4.2 context session

[33mcommit 2ee483ca12885813105e78a514a9aabfe68e84ec[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 07:57:54 2026 +0800

    docs(04.2): capture phase context

[33mcommit 1d7d8c14172e2abca9438049da0538bad4cce1e5[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 07:42:57 2026 +0800

    "phase 4.1: executed"

[33mcommit 5da4dd1e72f54014397afe83904e43ea49b57b12[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 07:39:11 2026 +0800

    docs(phase-4.1): complete phase execution
    
    Mark phase 4.1 complete — 2/2 plans executed, verification passed (11/11 must-haves).
    
    Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>

[33mcommit fd6d7f65f96ba15f0ad1b8cb705f58e7fe357f97[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 07:34:22 2026 +0800

    docs(04.1-02): complete MCH schemas + migration plan
    
    - Created 04.1-02-SUMMARY.md with full task documentation and deviation notes
    - Updated STATE.md: progress 100% for phase 04.1, decisions recorded, metrics logged
    - Updated ROADMAP.md: phase 04.1 complete (2/2 plans with SUMMARY)

[33mcommit 62fa916b8be0d75ee159c67eae7aeea27e1ea9bd[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 07:31:59 2026 +0800

    feat(04.1-02): create Alembic migration for all 8 MCH tables
    
    - Creates record_status shared ENUM (PENDING/SYNCED/CONFLICT) for offline sync
    - Creates prenatal_enrollments + prenatal_visits with is_high_risk ML flag
    - Creates postpartum_enrollments + postpartum_visits; prenatal_enrollment_id FK ON DELETE SET NULL
    - Creates epi_enrollments + epi_vaccinations; vaccine TEXT (not ENUM), unique constraint on enrollment+vaccine+dose
    - Creates nutrition_enrollments + nutrition_visits with severe_wasting ML flag
    - All 8 tables carry local_id UUID + status record_status for Phase 9 offline sync
    - create_type=False pattern prevents duplicate ENUM creation when used in op.create_table

[33mcommit 4df399634c5158c1e734b7f1e3e7647242e68e91[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 07:28:47 2026 +0800

    feat(04.1-02): create Pydantic v2 schemas for all 4 MCH programs
    
    - PrenatalEnrollmentCreate/Response + PrenatalVisitCreate/Response
    - PostpartumEnrollmentCreate/Response + PostpartumVisitCreate/Response (visit_type Literal validation)
    - EpiEnrollmentCreate/Response + EpiVaccinationCreate/Response (EPI_VACCINES Literal, no sa.Enum)
    - NutritionEnrollmentCreate/Response + NutritionVisitCreate/Response (waz/haz/whz excluded from Create)
    - All 16 classes use model_config from_attributes=True on Response; Create excludes patient_id/recorded_by

[33mcommit e980dfbfecba228f7da627c72dc0bea806314f7f[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 07:26:18 2026 +0800

    docs(04.1-01): complete MCH ORM models plan

[33mcommit 4bdc7f94233ec6f24c2a26e0afee3e825bb0935d[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 07:24:21 2026 +0800

    feat(04.1-01): add EpiEnrollment, EpiVaccination, NutritionEnrollment, NutritionVisit ORM models + update __init__.py
    
    - EpiEnrollment: patient_id/health_station_id/recorded_by FKs, fic_status ML flag, next_visit_date, local_id + status offline sync fields
    - EpiVaccination: TEXT vaccine column (not enum per CONTEXT.md), dose_number, unique constraint on (enrollment, vaccine, dose), NO health_station_id
    - NutritionEnrollment: patient_id/health_station_id/recorded_by FKs, no next_visit_date (monthly weighing sessions per CONTEXT.md)
    - NutritionVisit: weight/height/muac, WHO Z-scores (waz/haz/whz), nutrition_status, severe_wasting ML flag (WHZ < -3), NO health_station_id
    - __init__.py: exports all 14 models (6 existing + 8 new MCH models)

[33mcommit c9d4a986214ae8e95233b4d1523e07bebe9546e5[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 07:22:53 2026 +0800

    feat(04.1-01): add PrenatalEnrollment, PrenatalVisit, PostpartumEnrollment, PostpartumVisit ORM models
    
    - PrenatalEnrollment: patient_id/health_station_id/recorded_by FKs, is_high_risk ML flag, next_visit_date, local_id + status offline sync fields
    - PrenatalVisit: enrollment FK, recorded_by FK, full prenatal vitals (aog_weeks, weight, BP, fundic_height, FHT, hgb, tt_dose, etc.), NO health_station_id
    - PostpartumEnrollment: nullable prenatal_enrollment_id FK (ON DELETE SET NULL), day1/week1/week6_date schedule columns, delivery_type, birth_outcome
    - PostpartumVisit: enrollment FK, visit_type (day1|week1|week6), wound_status, breastfeeding, family_planning_counseling, NO health_station_id
    - All 4 models use TimestampMixin + SoftDeleteMixin, lazy='raise' on all relationships, indexed FK columns

[33mcommit 311e3d967d82990185cbfc41f33da8867b111edb[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 07:16:31 2026 +0800

    docs(04.1): create phase plan

[33mcommit 8c63dfa94f340c22877ea15d821382a8811142a2[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 07:02:16 2026 +0800

    docs(state): record phase 4.1 context update session

[33mcommit 46fbc62d62cd9af5848c03331b1aa9b82a3ca763[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Thu Mar 19 07:02:09 2026 +0800

    docs(04.1): update phase context — recorded_by on all 8 tables, visit isolation via enrollment join, next_visit_date placement

[33mcommit 9fac3229eea02665765cbedd66ccfebc75d6c01b[m
Author: rome <jmdelossantos@kld.edu.ph>
Date:   Wed Mar 18 23:43:33 2026 +0800
