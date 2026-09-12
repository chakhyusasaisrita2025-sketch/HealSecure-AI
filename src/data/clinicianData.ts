import { ClinicianProfile } from '../types';

export const AUTHORIZED_CLINICIANS: ClinicianProfile[] = [
  {
    id: 'clinician-1',
    name: 'Dr. Rachel Chen, MD, FAAP',
    title: 'NICU Attending Neonatologist',
    department: 'Neonatal Intensive Care Unit (NICU)',
    staffId: 'NICU-MD-8831',
    passkey: 'NICU-8831',
    role: 'Physician',
    avatarInitials: 'RC',
  },
  {
    id: 'clinician-2',
    name: 'Dr. Marcus Vance, MD, FACS',
    title: 'Pediatric Surgery Fellow',
    department: 'Division of Pediatric Surgery',
    staffId: 'SURG-MD-4209',
    passkey: 'SURG-4209',
    role: 'Surgeon',
    avatarInitials: 'MV',
  },
  {
    id: 'clinician-3',
    name: 'Elena Rostova, MSN, RN, CWOCN',
    title: 'Clinical Wound Specialist',
    department: 'Post-Operative Recovery & Tissue Viability',
    staffId: 'WND-RN-7714',
    passkey: 'WOUND-7714',
    role: 'Nurse',
    avatarInitials: 'ER',
  },
  {
    id: 'clinician-4',
    name: 'Dr. Aravind Swaminathan, PhD',
    title: 'Clinical Bioengineer & Signal Lead',
    department: 'Translational Health & Sensing Unit',
    staffId: 'BIO-ENG-1052',
    passkey: 'CLINIC-2026',
    role: 'Bioengineer',
    avatarInitials: 'AS',
  },
];

export const MASTER_PASSKEYS = ['HEAL-2026', 'CLINIC-2026', 'PASSKEY-2026', 'HEALSECURE'];

/**
 * Validates a submitted clinical passkey against registered medical staff credentials
 */
export function verifyClinicalPasskey(inputPasskey: string): ClinicianProfile | null {
  const cleanInput = inputPasskey.trim().toUpperCase();
  if (!cleanInput) return null;

  // Check specific clinician passkeys
  const directMatch = AUTHORIZED_CLINICIANS.find(
    (c) => c.passkey.toUpperCase() === cleanInput || c.staffId.toUpperCase() === cleanInput
  );
  if (directMatch) return directMatch;

  // Check master passkeys
  if (MASTER_PASSKEYS.includes(cleanInput)) {
    return AUTHORIZED_CLINICIANS[0]; // Default to Lead Attending
  }

  return null;
}
