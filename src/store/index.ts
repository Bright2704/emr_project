import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Patient, Visit, ScanDocument, DocumentCategory, AuditLog } from '@/types';

// Mock Data
const mockCategories: DocumentCategory[] = [
  { id: 'cat-1', name: 'ผลตรวจเลือด', isActive: true },
  { id: 'cat-2', name: 'ผลเอกซเรย์', isActive: true },
  { id: 'cat-3', name: 'คำวินิจฉัย', isActive: true },
  { id: 'cat-4', name: 'ใบสั่งยา', isActive: true },
  { id: 'cat-5', name: 'เอกสารยินยอม', isActive: true },
  { id: 'cat-6', name: 'บันทึกการพยาบาล', isActive: true },
  { id: 'cat-7', name: 'อื่นๆ', isActive: true },
];

const mockUsers: User[] = [
  {
    id: 'user-1',
    professionalNo: 'ว.12345',
    role: 'doctor',
    fullName: 'นพ.สมชาย ใจดี',
    phone: '0891234567',
    email: 'somchai@hospital.com',
    isActive: true,
    failedAttempts: 0,
    lastFailedAt: null,
    pinSet: true,
  },
  {
    id: 'user-2',
    professionalNo: 'พย.67890',
    role: 'nurse',
    fullName: 'พยาบาล วิภา รักษาดี',
    phone: '0899876543',
    email: 'vipa@hospital.com',
    isActive: true,
    failedAttempts: 0,
    lastFailedAt: null,
    pinSet: true,
  },
  {
    id: 'user-3',
    professionalNo: 'MR001',
    role: 'medical_record',
    fullName: 'เวชระเบียน สมศรี บันทึกดี',
    phone: '0812223333',
    email: 'somsri@hospital.com',
    isActive: true,
    failedAttempts: 0,
    lastFailedAt: null,
    pinSet: true,
  },
  {
    id: 'user-4',
    professionalNo: 'ADMIN001',
    role: 'admin',
    fullName: 'แอดมิน ระบบงาน',
    phone: '0811112222',
    email: 'admin@hospital.com',
    isActive: true,
    failedAttempts: 0,
    lastFailedAt: null,
    pinSet: true,
  },
  {
    id: 'user-5',
    professionalNo: 'ว.99999',
    role: 'doctor',
    fullName: 'นพ.ใหม่ ยังไม่ตั้ง PIN',
    phone: '0800001111',
    email: 'new@hospital.com',
    isActive: true,
    failedAttempts: 0,
    lastFailedAt: null,
    pinSet: false,
  },
];

const mockPatients: Patient[] = [
  {
    id: 'pt-1',
    hn: 'HN001234',
    nationalId: '1-1234-56789-01-2',
    firstName: 'สมหมาย',
    lastName: 'รักสุขภาพ',
    dateOfBirth: new Date('1985-03-15'),
    createdAt: new Date('2024-01-10'),
    createdBy: 'user-2',
  },
  {
    id: 'pt-2',
    hn: 'HN001235',
    nationalId: '1-2345-67890-12-3',
    firstName: 'สมใจ',
    lastName: 'สุขสันต์',
    dateOfBirth: new Date('1990-07-22'),
    createdAt: new Date('2024-01-15'),
    createdBy: 'user-2',
  },
  {
    id: 'pt-3',
    hn: 'HN001236',
    nationalId: '1-3456-78901-23-4',
    firstName: 'มานี',
    lastName: 'มีสุข',
    dateOfBirth: new Date('1978-11-30'),
    createdAt: new Date('2024-02-01'),
    createdBy: 'user-3',
  },
];

const mockVisits: Visit[] = [
  {
    id: 'visit-1',
    patientId: 'pt-1',
    visitNo: 'VN2024001001',
    visitType: 'OPD',
    visitDate: new Date('2024-06-01'),
    createdAt: new Date('2024-06-01'),
  },
  {
    id: 'visit-2',
    patientId: 'pt-1',
    visitNo: 'AN2024000101',
    visitType: 'IPD',
    visitDate: new Date('2024-06-10'),
    createdAt: new Date('2024-06-10'),
  },
  {
    id: 'visit-3',
    patientId: 'pt-2',
    visitNo: 'VN2024001002',
    visitType: 'OPD',
    visitDate: new Date('2024-06-15'),
    createdAt: new Date('2024-06-15'),
  },
  {
    id: 'visit-4',
    patientId: 'pt-3',
    visitNo: 'VN2024001003',
    visitType: 'OPD',
    visitDate: new Date('2024-06-20'),
    createdAt: new Date('2024-06-20'),
  },
];

const mockDocuments: ScanDocument[] = [
  {
    id: 'doc-1',
    visitId: 'visit-1',
    filePath: '/mock/blood-test.pdf',
    fileType: 'pdf',
    categoryId: 'cat-1',
    status: 'active',
    uploadedAt: new Date('2024-06-01T10:30:00'),
    uploadedBy: 'user-2',
  },
  {
    id: 'doc-2',
    visitId: 'visit-1',
    filePath: '/mock/xray.png',
    fileType: 'png',
    categoryId: 'cat-2',
    status: 'active',
    uploadedAt: new Date('2024-06-01T11:00:00'),
    uploadedBy: 'user-2',
  },
  {
    id: 'doc-3',
    visitId: 'visit-2',
    filePath: '/mock/diagnosis.pdf',
    fileType: 'pdf',
    categoryId: 'cat-3',
    status: 'active',
    uploadedAt: new Date('2024-06-10T14:00:00'),
    uploadedBy: 'user-1',
  },
  {
    id: 'doc-4',
    visitId: 'visit-3',
    filePath: '/mock/prescription.pdf',
    fileType: 'pdf',
    categoryId: 'cat-4',
    status: 'active',
    uploadedAt: new Date('2024-06-15T09:00:00'),
    uploadedBy: 'user-2',
  },
];

// Auth Store
interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (professionalNo: string, pin: string) => { success: boolean; error?: string; needSetup?: boolean };
  logout: () => void;
  setupPin: (pin: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      login: (professionalNo: string, pin: string) => {
        const user = mockUsers.find((u) => u.professionalNo === professionalNo);
        if (!user) {
          return { success: false, error: 'ไม่พบข้อมูลผู้ใช้ในระบบ' };
        }
        if (!user.isActive) {
          return { success: false, error: 'บัญชีถูกปิดใช้งาน' };
        }
        if (!user.pinSet) {
          set({ currentUser: user });
          return { success: false, needSetup: true };
        }
        // Mock PIN check (in real app, compare hashed PIN)
        if (pin !== '123456') {
          const newAttempts = user.failedAttempts + 1;
          user.failedAttempts = newAttempts;
          user.lastFailedAt = new Date();
          if (newAttempts >= 5) {
            const delay = Math.min(30 * Math.pow(2, newAttempts - 5), 120);
            return { success: false, error: `PIN ไม่ถูกต้อง กรุณารอ ${delay} วินาที` };
          }
          return { success: false, error: `PIN ไม่ถูกต้อง (ครั้งที่ ${newAttempts}/5)` };
        }
        user.failedAttempts = 0;
        user.lastFailedAt = null;
        set({ currentUser: user, isAuthenticated: true });
        return { success: true };
      },
      logout: () => set({ currentUser: null, isAuthenticated: false }),
      setupPin: (pin: string) => {
        const { currentUser } = get();
        if (currentUser) {
          currentUser.pinSet = true;
          set({ currentUser, isAuthenticated: true });
        }
      },
    }),
    { name: 'auth-storage' }
  )
);

// Data Store
interface DataState {
  patients: Patient[];
  visits: Visit[];
  documents: ScanDocument[];
  categories: DocumentCategory[];
  users: User[];
  auditLogs: AuditLog[];

  // Patient actions
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Patient;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  getPatient: (id: string) => Patient | undefined;
  searchPatients: (query: string) => Patient[];

  // Visit actions
  addVisit: (visit: Omit<Visit, 'id' | 'createdAt'>) => Visit;
  getVisitsByPatient: (patientId: string) => Visit[];
  getVisit: (id: string) => Visit | undefined;

  // Document actions
  addDocument: (doc: Omit<ScanDocument, 'id' | 'uploadedAt'>) => ScanDocument;
  updateDocument: (id: string, data: Partial<ScanDocument>) => void;
  getDocumentsByVisit: (visitId: string) => ScanDocument[];
  getDocumentsByPatient: (patientId: string) => ScanDocument[];
  getDocument: (id: string) => ScanDocument | undefined;

  // Audit actions
  addAuditLog: (log: Omit<AuditLog, 'id' | 'createdAt'>) => void;
}

export const useDataStore = create<DataState>()((set, get) => ({
  patients: mockPatients,
  visits: mockVisits,
  documents: mockDocuments,
  categories: mockCategories,
  users: mockUsers,
  auditLogs: [],

  addPatient: (patient) => {
    const newPatient: Patient = {
      ...patient,
      id: `pt-${Date.now()}`,
      createdAt: new Date(),
    };
    set((state) => ({ patients: [...state.patients, newPatient] }));
    return newPatient;
  },

  updatePatient: (id, data) => {
    set((state) => ({
      patients: state.patients.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
  },

  getPatient: (id) => get().patients.find((p) => p.id === id),

  searchPatients: (query) => {
    const q = query.toLowerCase();
    return get().patients.filter(
      (p) =>
        p.hn.toLowerCase().includes(q) ||
        p.nationalId.includes(q) ||
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q)
    );
  },

  addVisit: (visit) => {
    const newVisit: Visit = {
      ...visit,
      id: `visit-${Date.now()}`,
      createdAt: new Date(),
    };
    set((state) => ({ visits: [...state.visits, newVisit] }));
    return newVisit;
  },

  getVisitsByPatient: (patientId) => get().visits.filter((v) => v.patientId === patientId),

  getVisit: (id) => get().visits.find((v) => v.id === id),

  addDocument: (doc) => {
    const newDoc: ScanDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date(),
    };
    set((state) => ({ documents: [...state.documents, newDoc] }));
    return newDoc;
  },

  updateDocument: (id, data) => {
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? { ...d, ...data } : d)),
    }));
  },

  getDocumentsByVisit: (visitId) => get().documents.filter((d) => d.visitId === visitId && d.status === 'active'),

  getDocumentsByPatient: (patientId) => {
    const visitIds = get().visits.filter((v) => v.patientId === patientId).map((v) => v.id);
    return get().documents.filter((d) => visitIds.includes(d.visitId) && d.status === 'active');
  },

  getDocument: (id) => get().documents.find((d) => d.id === id),

  addAuditLog: (log) => {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      createdAt: new Date(),
    };
    set((state) => ({ auditLogs: [newLog, ...state.auditLogs] }));
  },
}));
