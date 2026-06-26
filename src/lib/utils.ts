import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: Date | string, formatStr: string = 'dd MMM yyyy') {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { locale: th });
}

export function formatDateTime(date: Date | string) {
  return formatDate(date, 'dd MMM yyyy HH:mm น.');
}

export function formatThaiDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const thaiYear = d.getFullYear() + 543;
  return format(d, `dd MMMM`, { locale: th }) + ` ${thaiYear}`;
}

export function maskNationalId(id: string, showFull: boolean = false) {
  if (showFull) return id;
  const parts = id.split('-');
  if (parts.length >= 5) {
    return `X-XXXX-XXXXX-XX-${parts[4]}`;
  }
  return id.slice(0, -4).replace(/./g, 'X') + id.slice(-4);
}

export function calculateAge(dateOfBirth: Date | string) {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function generateVisitNo(type: 'OPD' | 'IPD') {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return type === 'OPD' ? `VN${year}${random}` : `AN${year}${random}`;
}

export function getRoleName(role: string) {
  const roles: Record<string, string> = {
    doctor: 'แพทย์',
    nurse: 'พยาบาล',
    medical_record: 'เวชระเบียน',
    admin: 'ผู้ดูแลระบบ',
  };
  return roles[role] || role;
}

export function getActionName(action: string) {
  const actions: Record<string, string> = {
    login: 'เข้าสู่ระบบ',
    view: 'ดูเอกสาร',
    upload: 'อัปโหลด',
    move: 'ย้ายเอกสาร',
    edit: 'แก้ไข',
    delete: 'ลบ',
    note: 'บันทึกหมายเหตุ',
    comment: 'แสดงความคิดเห็น',
    annotate: 'มาร์กรูปภาพ',
    risk: 'บันทึกความเสี่ยง',
  };
  return actions[action] || action;
}
