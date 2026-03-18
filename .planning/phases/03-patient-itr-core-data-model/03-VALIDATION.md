---
phase: 3
slug: patient-itr-core-data-model
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.4.2 + pytest-asyncio (auto mode) |
| **Config file** | `backend/pytest.ini` |
| **Quick run command** | `docker-compose exec backend pytest tests/test_patients/ -x` |
| **Full suite command** | `docker-compose exec backend pytest` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `docker-compose exec backend pytest tests/test_patients/ -x`
- **After every plan wave:** Run `docker-compose exec backend pytest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | P3-01 | integration | `pytest tests/test_patients/test_patient_model.py -x` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | P3-02 | integration | `pytest tests/test_patients/test_consultation_model.py -x` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | P3-03 | integration | `pytest tests/test_patients/test_duplicate_detection.py -x` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | P3-04 | integration | `pytest tests/test_patients/test_patient_search.py -x` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 1 | P3-05 | integration | `pytest tests/test_patients/test_patient_registration.py -x` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 1 | P3-06 | integration | `pytest tests/test_patients/test_patient_profile.py -x` | ❌ W0 | ⬜ pending |
| 03-03-03 | 03 | 1 | P3-07 | integration | `pytest tests/test_patients/test_consultation_create.py -x` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 1 | P3-08 | integration | `pytest tests/test_patients/test_patient_rbac.py -x` | ❌ W0 | ⬜ pending |
| 03-04-02 | 04 | 1 | P3-09 | integration | `pytest tests/test_patients/test_city_wide_readonly.py -x` | ❌ W0 | ⬜ pending |
| 03-05-01 | 05 | 2 | P3-10 | integration | `pytest tests/test_patients/test_patient_audit.py -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/test_patients/__init__.py` — package init
- [ ] `tests/test_patients/test_patient_model.py` — stubs for P3-01
- [ ] `tests/test_patients/test_consultation_model.py` — stubs for P3-02
- [ ] `tests/test_patients/test_duplicate_detection.py` — stubs for P3-03
- [ ] `tests/test_patients/test_patient_search.py` — stubs for P3-04
- [ ] `tests/test_patients/test_patient_registration.py` — stubs for P3-05
- [ ] `tests/test_patients/test_patient_profile.py` — stubs for P3-06
- [ ] `tests/test_patients/test_consultation_create.py` — stubs for P3-07
- [ ] `tests/test_patients/test_patient_rbac.py` — stubs for P3-08
- [ ] `tests/test_patients/test_city_wide_readonly.py` — stubs for P3-09
- [ ] `tests/test_patients/test_patient_audit.py` — stubs for P3-10

*Existing `tests/conftest.py` handles async session setup and audit_logs DDL. New models auto-detected via `Base.metadata.create_all` once registered in `app/models/__init__.py`.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Patient registration form UX | P3-05 | Visual layout, field ordering, responsive behavior | Open `/patients`, click Register, fill form, verify field labels and tab order |
| Duplicate warning card display | P3-03 | Visual confirmation of warning card rendering | Register duplicate patient, verify warning card shows existing patient details |
| Consultation Sheet side panel | P3-07 | Panel open/close animation, field layout | Open patient profile, click Add Consultation, verify Sheet panel UI |
| City-wide toggle visual feedback | P3-04 | Toggle state indicator, results badge display | Toggle "Search all BHS", verify BHS badges appear on results |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
