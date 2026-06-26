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

// Audit Log Types
export type AuditAction = 'login' | 'view' | 'upload' | 'move' | 'edit' | 'delete';

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
