import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Patient,
  Visit,
  ScanDocument,
  DocumentCategory,
  AuditLog,
  CaseNote,
  DocComment,
  RiskFlag,
  Annotation,
} from '@/types';

// Mock Data
const mockCategories: DocumentCategory[] = [
  // ผลตรวจ / วินิจฉัย (lab)
  { id: 'cat-1', name: 'ผลตรวจทางห้องปฏิบัติการ', isActive: true },
  { id: 'cat-2', name: 'ผลตรวจทางรังสีวิทยา', isActive: true },
  { id: 'cat-8', name: 'ผลตรวจคลื่นไฟฟ้าหัวใจ', isActive: true },
  { id: 'cat-9', name: 'ผลตรวจทางพยาธิวิทยา', isActive: true },
  // บันทึกการรักษา (clinical)
  { id: 'cat-3', name: 'คำวินิจฉัยและการรักษา', isActive: true },
  { id: 'cat-4', name: 'ใบสั่งยา', isActive: true },
  { id: 'cat-6', name: 'บันทึกการพยาบาล', isActive: true },
  { id: 'cat-10', name: 'บันทึกการผ่าตัด / หัตถการ', isActive: true },
  // เอกสาร / ธุรการ (admin)
  { id: 'cat-5', name: 'เอกสารยินยอม', isActive: true },
  { id: 'cat-11', name: 'ใบส่งตัว / ส่งต่อผู้ป่วย', isActive: true },
  { id: 'cat-7', name: 'เอกสารทั่วไป / อื่นๆ', isActive: true },
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
    professionalNo: '4567890123',
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

const mockCaseNotes: CaseNote[] = [
  {
    id: 'note-1',
    patientId: 'pt-1',
    content: 'ผู้ป่วยแจ้งว่ามีอาการเวียนศีรษะตอนเช้า ติดตามความดันโลหิตต่อเนื่อง นัดติดตามผลเลือดซ้ำใน 2 สัปดาห์',
    authorId: 'user-2',
    createdAt: new Date('2024-06-01T10:45:00'),
    updatedAt: new Date('2024-06-01T10:45:00'),
    editHistory: [],
    status: 'active',
  },
];

const mockRiskFlags: RiskFlag[] = [
  {
    id: 'risk-1',
    patientId: 'pt-1',
    title: 'แพ้ยา Penicillin',
    detail: 'เคยมีผื่นลมพิษหลังได้รับยากลุ่ม Penicillin หลีกเลี่ยงการสั่งจ่าย',
    severity: 'high',
    authorId: 'user-1',
    createdAt: new Date('2024-06-01T11:10:00'),
    updatedAt: new Date('2024-06-01T11:10:00'),
    editHistory: [],
    status: 'active',
  },
  {
    id: 'risk-2',
    patientId: 'pt-1',
    title: 'ค่าน้ำตาลในเลือดสูง',
    detail: 'FBS 162 mg/dL สูงกว่าค่าปกติ เฝ้าระวังภาวะเบาหวาน',
    severity: 'medium',
    authorId: 'user-2',
    createdAt: new Date('2024-06-01T11:20:00'),
    updatedAt: new Date('2024-06-01T11:20:00'),
    editHistory: [],
    status: 'active',
  },
];

const mockComments: DocComment[] = [
  {
    id: 'cmt-1',
    documentId: 'doc-2',
    content: 'จุดที่วงไว้บริเวณปอดขวา ขอความเห็นรังสีแพทย์เพิ่มเติม',
    authorId: 'user-1',
    createdAt: new Date('2024-06-02T09:15:00'),
    updatedAt: new Date('2024-06-02T09:15:00'),
    editHistory: [],
    status: 'active',
  },
];

const mockAnnotations: Annotation[] = [
  {
    id: 'ann-1',
    documentId: 'doc-2',
    type: 'circle',
    geometry: { cx: 62, cy: 40, r: 9 },
    color: '#dc2626',
    label: 'จุดสังเกต',
    authorId: 'user-1',
    createdAt: new Date('2024-06-02T09:14:00'),
    status: 'active',
  },
];

// Session timeout settings (in milliseconds)
const PIN_TIMEOUT = 30 * 60 * 1000; // 30 minutes - require PIN
const FULL_LOGOUT_TIMEOUT = 60 * 60 * 1000; // 1 hour - require full re-login

// Auth Store
interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  lastActivityAt: number | null;
  sessionLockType: 'none' | 'pin' | 'full'; // none = active, pin = need PIN, full = need full login
  hasHydrated: boolean; // true once persisted state is rehydrated from localStorage
  setHasHydrated: (v: boolean) => void;
  login: (professionalNo: string, pin: string) => { success: boolean; error?: string; needSetup?: boolean };
  logout: () => void;
  setupPin: (pin: string) => void;
  updateActivity: () => void;
  checkSessionTimeout: () => 'none' | 'pin' | 'full';
  unlockWithPin: (pin: string) => { success: boolean; error?: string };
  lockSession: (type: 'pin' | 'full') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      lastActivityAt: null,
      sessionLockType: 'none',
      hasHydrated: false,
      setHasHydrated: (v: boolean) => set({ hasHydrated: v }),

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
        set({
          currentUser: user,
          isAuthenticated: true,
          lastActivityAt: Date.now(),
          sessionLockType: 'none',
        });
        return { success: true };
      },

      logout: () => set({
        currentUser: null,
        isAuthenticated: false,
        lastActivityAt: null,
        sessionLockType: 'none',
      }),

      setupPin: (pin: string) => {
        const { currentUser } = get();
        if (currentUser) {
          currentUser.pinSet = true;
          set({
            currentUser,
            isAuthenticated: true,
            lastActivityAt: Date.now(),
            sessionLockType: 'none',
          });
        }
      },

      updateActivity: () => {
        const { isAuthenticated, sessionLockType } = get();
        if (isAuthenticated && sessionLockType === 'none') {
          set({ lastActivityAt: Date.now() });
        }
      },

      checkSessionTimeout: () => {
        const { lastActivityAt, isAuthenticated, sessionLockType } = get();

        if (!isAuthenticated || !lastActivityAt) return 'none';
        if (sessionLockType !== 'none') return sessionLockType;

        const now = Date.now();
        const elapsed = now - lastActivityAt;

        if (elapsed >= FULL_LOGOUT_TIMEOUT) {
          set({ sessionLockType: 'full' });
          return 'full';
        } else if (elapsed >= PIN_TIMEOUT) {
          set({ sessionLockType: 'pin' });
          return 'pin';
        }

        return 'none';
      },

      unlockWithPin: (pin: string) => {
        const { currentUser } = get();
        if (!currentUser) {
          return { success: false, error: 'ไม่พบข้อมูลผู้ใช้' };
        }

        // Mock PIN check
        if (pin !== '123456') {
          return { success: false, error: 'PIN ไม่ถูกต้อง' };
        }

        set({
          sessionLockType: 'none',
          lastActivityAt: Date.now(),
        });
        return { success: true };
      },

      lockSession: (type: 'pin' | 'full') => {
        if (type === 'full') {
          set({
            currentUser: null,
            isAuthenticated: false,
            lastActivityAt: null,
            sessionLockType: 'none',
          });
        } else {
          set({ sessionLockType: type });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        lastActivityAt: state.lastActivityAt,
        sessionLockType: state.sessionLockType,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
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
  caseNotes: CaseNote[];
  comments: DocComment[];
  riskFlags: RiskFlag[];
  annotations: Annotation[];

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

  // Case note actions
  getCaseNotes: (patientId: string) => CaseNote[];
  addCaseNote: (patientId: string, content: string, authorId: string) => void;
  editCaseNote: (id: string, content: string, editorId: string) => void;
  deleteCaseNote: (id: string, editorId: string) => void;

  // Comment actions
  getComments: (documentId: string) => DocComment[];
  addComment: (documentId: string, content: string, authorId: string) => void;
  editComment: (id: string, content: string, editorId: string) => void;
  deleteComment: (id: string, editorId: string) => void;

  // Risk flag actions
  getRiskFlags: (patientId: string) => RiskFlag[];
  addRiskFlag: (flag: Omit<RiskFlag, 'id' | 'createdAt' | 'updatedAt' | 'editHistory' | 'status'>) => void;
  editRiskFlag: (id: string, data: Pick<RiskFlag, 'title' | 'detail' | 'severity'>, editorId: string) => void;
  deleteRiskFlag: (id: string, editorId: string) => void;

  // Annotation actions
  getAnnotations: (documentId: string) => Annotation[];
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'status'>) => void;
  deleteAnnotation: (id: string, editorId: string) => void;
}

export const useDataStore = create<DataState>()((set, get) => ({
  patients: mockPatients,
  visits: mockVisits,
  documents: mockDocuments,
  categories: mockCategories,
  users: mockUsers,
  auditLogs: [],
  caseNotes: mockCaseNotes,
  comments: mockComments,
  riskFlags: mockRiskFlags,
  annotations: mockAnnotations,

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

  // ---- Case Notes ----
  getCaseNotes: (patientId) =>
    get().caseNotes
      .filter((n) => n.patientId === patientId && n.status === 'active')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),

  addCaseNote: (patientId, content, authorId) => {
    const now = new Date();
    const note: CaseNote = {
      id: `note-${Date.now()}`,
      patientId,
      content,
      authorId,
      createdAt: now,
      updatedAt: now,
      editHistory: [],
      status: 'active',
    };
    set((state) => ({ caseNotes: [...state.caseNotes, note] }));
    get().addAuditLog({ userId: authorId, action: 'note', targetType: 'patient', targetId: patientId, detail: { noteId: note.id } });
  },

  editCaseNote: (id, content, editorId) => {
    set((state) => ({
      caseNotes: state.caseNotes.map((n) =>
        n.id === id
          ? {
              ...n,
              editHistory: [...n.editHistory, { content: n.content, editedBy: editorId, editedAt: new Date() }],
              content,
              updatedAt: new Date(),
            }
          : n
      ),
    }));
    get().addAuditLog({ userId: editorId, action: 'edit', targetType: 'note', targetId: id, detail: {} });
  },

  deleteCaseNote: (id, editorId) => {
    set((state) => ({
      caseNotes: state.caseNotes.map((n) => (n.id === id ? { ...n, status: 'deleted', updatedAt: new Date() } : n)),
    }));
    get().addAuditLog({ userId: editorId, action: 'delete', targetType: 'note', targetId: id, detail: {} });
  },

  // ---- Comments ----
  getComments: (documentId) =>
    get().comments
      .filter((c) => c.documentId === documentId && c.status === 'active')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),

  addComment: (documentId, content, authorId) => {
    const now = new Date();
    const comment: DocComment = {
      id: `cmt-${Date.now()}`,
      documentId,
      content,
      authorId,
      createdAt: now,
      updatedAt: now,
      editHistory: [],
      status: 'active',
    };
    set((state) => ({ comments: [...state.comments, comment] }));
    get().addAuditLog({ userId: authorId, action: 'comment', targetType: 'document', targetId: documentId, detail: { commentId: comment.id } });
  },

  editComment: (id, content, editorId) => {
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === id
          ? {
              ...c,
              editHistory: [...c.editHistory, { content: c.content, editedBy: editorId, editedAt: new Date() }],
              content,
              updatedAt: new Date(),
            }
          : c
      ),
    }));
    get().addAuditLog({ userId: editorId, action: 'edit', targetType: 'comment', targetId: id, detail: {} });
  },

  deleteComment: (id, editorId) => {
    set((state) => ({
      comments: state.comments.map((c) => (c.id === id ? { ...c, status: 'deleted', updatedAt: new Date() } : c)),
    }));
    get().addAuditLog({ userId: editorId, action: 'delete', targetType: 'comment', targetId: id, detail: {} });
  },

  // ---- Risk Flags ----
  getRiskFlags: (patientId) =>
    get().riskFlags
      .filter((r) => r.patientId === patientId && r.status === 'active')
      .sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.severity] - order[b.severity] || a.createdAt.getTime() - b.createdAt.getTime();
      }),

  addRiskFlag: (flag) => {
    const now = new Date();
    const risk: RiskFlag = {
      ...flag,
      id: `risk-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      editHistory: [],
      status: 'active',
    };
    set((state) => ({ riskFlags: [...state.riskFlags, risk] }));
    get().addAuditLog({ userId: flag.authorId, action: 'risk', targetType: 'patient', targetId: flag.patientId, detail: { riskId: risk.id } });
  },

  editRiskFlag: (id, data, editorId) => {
    set((state) => ({
      riskFlags: state.riskFlags.map((r) =>
        r.id === id
          ? {
              ...r,
              editHistory: [
                ...r.editHistory,
                { content: `${r.title} | ${r.severity} | ${r.detail}`, editedBy: editorId, editedAt: new Date() },
              ],
              ...data,
              updatedAt: new Date(),
            }
          : r
      ),
    }));
    get().addAuditLog({ userId: editorId, action: 'edit', targetType: 'risk', targetId: id, detail: {} });
  },

  deleteRiskFlag: (id, editorId) => {
    set((state) => ({
      riskFlags: state.riskFlags.map((r) => (r.id === id ? { ...r, status: 'deleted', updatedAt: new Date() } : r)),
    }));
    get().addAuditLog({ userId: editorId, action: 'delete', targetType: 'risk', targetId: id, detail: {} });
  },

  // ---- Annotations ----
  getAnnotations: (documentId) =>
    get().annotations.filter((a) => a.documentId === documentId && a.status === 'active'),

  addAnnotation: (annotation) => {
    const ann: Annotation = {
      ...annotation,
      id: `ann-${Date.now()}`,
      createdAt: new Date(),
      status: 'active',
    };
    set((state) => ({ annotations: [...state.annotations, ann] }));
    get().addAuditLog({ userId: annotation.authorId, action: 'annotate', targetType: 'document', targetId: annotation.documentId, detail: { annotationId: ann.id, type: ann.type } });
  },

  deleteAnnotation: (id, editorId) => {
    set((state) => ({
      annotations: state.annotations.map((a) => (a.id === id ? { ...a, status: 'deleted' } : a)),
    }));
    get().addAuditLog({ userId: editorId, action: 'delete', targetType: 'annotation', targetId: id, detail: {} });
  },
}));
