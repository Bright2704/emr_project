// User & Auth Types
export type UserRole = 'doctor' | 'nurse' | 'medical_record' | 'admin';

export interface User {
  id: string;
  professionalNo: string;
  role: UserRole;
  fullName: string;
  phone: string;
  email: string;
  isActive: boolean;
  failedAttempts: number;
  lastFailedAt: Date | null;
  pinSet: boolean;
}

// Patient Types
export interface Patient {
  id: string;
  hn: string;
  nationalId: string; // encrypted in real system
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  createdAt: Date;
  createdBy: string;
}

// Visit Types
export type VisitType = 'OPD' | 'IPD';

export interface Visit {
  id: string;
  patientId: string;
  visitNo: string;
  visitType: VisitType;
  visitDate: Date;
  createdAt: Date;
}

// Document Types
export type DocumentStatus = 'active' | 'soft_deleted';

export interface DocumentCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export interface ScanDocument {
  id: string;
  visitId: string;
  filePath: string;
  fileType: 'pdf' | 'png' | 'jpg';
  categoryId: string;
  status: DocumentStatus;
  uploadedAt: Date;
  uploadedBy: string;
}

// Collaboration: Notes / Comments / Annotations / Risk Flags
export type EntryStatus = 'active' | 'deleted';

export interface EditHistoryEntry {
  content: string; // snapshot of content before the edit
  editedBy: string; // userId
  editedAt: Date;
}

// Case-level note (per patient) — follow-up handoff between users
export interface CaseNote {
  id: string;
  patientId: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  editHistory: EditHistoryEntry[];
  status: EntryStatus;
}

// Comment on a document/image
export interface DocComment {
  id: string;
  documentId: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  editHistory: EditHistoryEntry[];
  status: EntryStatus;
}

// Risk / precaution flag (per patient)
export type RiskSeverity = 'low' | 'medium' | 'high';

export interface RiskFlag {
  id: string;
  patientId: string;
  title: string;
  detail: string;
  severity: RiskSeverity;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  editHistory: EditHistoryEntry[];
  status: EntryStatus;
}

// Image annotation (per document) — coords are normalized 0..100 of the image box
export type AnnotationType = 'circle' | 'line' | 'highlight' | 'marker';

export interface Annotation {
  id: string;
  documentId: string;
  type: AnnotationType;
  // geometry in a 0..100 coordinate space, type-dependent fields
  geometry: {
    x?: number; y?: number; // marker point / rect origin
    w?: number; h?: number; // highlight rect size
    cx?: number; cy?: number; r?: number; // circle
    x1?: number; y1?: number; x2?: number; y2?: number; // line
  };
  color: string;
  label?: string;
  authorId: string;
  createdAt: Date;
  status: EntryStatus;
}

// Audit Log Types
export type AuditAction =
  | 'login'
  | 'view'
  | 'upload'
  | 'move'
  | 'edit'
  | 'delete'
  | 'note'
  | 'comment'
  | 'annotate'
  | 'risk';

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  detail: Record<string, unknown>;
  createdAt: Date;
}

// Extended types for UI
export interface PatientWithVisits extends Patient {
  visits: Visit[];
}

export interface VisitWithDocuments extends Visit {
  documents: ScanDocument[];
  patient?: Patient;
}

export interface DocumentWithMeta extends ScanDocument {
  category?: DocumentCategory;
  visit?: Visit;
  patient?: Patient;
}
