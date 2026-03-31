export interface HealthProgram {
  id: string;
  title: string;
  description: string;
}

export const healthPrograms: HealthProgram[] = [
  {
    id: 'consultation',
    title: 'CONSULTATION',
    description:
      'General health consultations for routine checkups, acute symptoms, and medical advice from healthcare professionals.',
  },
  {
    id: 'animal-bite',
    title: 'ANIMAL BITE',
    description:
      'Immediate assessment and post-exposure management for dog, cat, and other animal bite cases.',
  },
  {
    id: 'lying-in',
    title: 'LYING-IN',
    description:
      'Maternal care support including prenatal monitoring and safe birthing assistance in accredited facilities.',
  },
  {
    id: 'family-planning',
    title: 'FAMILY PLANNING',
    description:
      'Counseling and reproductive health services to support informed and responsible family planning decisions.',
  },
  {
    id: 'laboratory',
    title: 'LABORATORY',
    description:
      'Basic diagnostic laboratory testing services to support medical screening, diagnosis, and treatment planning.',
  },
  {
    id: 'tb-dots',
    title: 'TB DOTS',
    description:
      'Directly Observed Treatment, Short-course services for tuberculosis screening, treatment, and follow-up care.',
  },
  {
    id: 'counseling',
    title: 'COUNSELING',
    description:
      'Health and wellness counseling services for patients and families needing guidance, support, and care planning.',
  },
  {
    id: 'drug-rehab',
    title: 'DRUG REHAB',
    description:
      'Community-based rehabilitation support and referral services for substance use recovery and reintegration.',
  },
  {
    id: 'immunization',
    title: 'IMMUNIZATION',
    description:
      'Vaccination services for children, adults, and priority groups to prevent vaccine-preventable diseases.',
  },
];