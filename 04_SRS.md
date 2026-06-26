# 04 — Software Requirements Specification (SRS)
## ระบบจัดเก็บและเรียกดูเอกสารสแกนผู้ป่วย (EMR Scan Viewer)

| รายการ | รายละเอียด |
|--------|-----------|
| เวอร์ชัน | 1.0 |
| มาตรฐานอ้างอิง | IEEE 830 (ปรับใช้) |
| สถานะ | Draft for Prototype |

---

## สารบัญ
1. บทนำ (Introduction)
2. ภาพรวมระบบ (Overall Description)
3. ความต้องการเชิงฟังก์ชันโดยละเอียด (Specific Functional Requirements)
4. ความต้องการด้าน Interface
5. ความต้องการที่ไม่ใช่ฟังก์ชัน (Non-Functional Requirements)
6. ข้อจำกัดและข้อสมมติ

---

## 1. บทนำ (Introduction)

### 1.1 วัตถุประสงค์
เอกสาร SRS นี้ระบุความต้องการของระบบ EMR Scan Viewer โดยละเอียด เพื่อใช้เป็นข้อตกลงร่วมระหว่างผู้พัฒนาและผู้ว่าจ้าง และใช้เป็นฐานในการพัฒนา ทดสอบ และสร้าง Prototype

### 1.2 ขอบเขตผลิตภัณฑ์ (Product Scope)
ระบบเป็น Web Application สำหรับจัดเก็บและเรียกดูเอกสารสแกนของผู้ป่วย ผูกกับ HN/VN/AN โดยไม่เชื่อมต่อ HIS เดิม ขอบเขตการพัฒนาครอบคลุมเฉพาะ Software ส่วน Infrastructure (Server/Storage) เป็นความรับผิดชอบของผู้ว่าจ้าง

### 1.3 กลุ่มผู้ใช้เป้าหมาย (Intended Users)
แพทย์, พยาบาล, เจ้าหน้าที่เวชระเบียน, ผู้ดูแลระบบ (Admin)

---

## 2. ภาพรวมระบบ (Overall Description)

### 2.1 มุมมองผลิตภัณฑ์ (Product Perspective)
ระบบเป็นผลิตภัณฑ์เดี่ยว (standalone) ที่ทำงานในเครือข่ายภายในของโรงพยาบาล ประกอบด้วย Frontend, Backend API, Auth Service, Scan Service และเชื่อมต่อกับ Database, File Storage (จัดหาโดยผู้ว่าจ้าง) และเครื่อง MFP บน LAN

### 2.2 ฟังก์ชันหลักของผลิตภัณฑ์ (Product Functions)
- ยืนยันตัวตนและจัดการผู้ใช้ตาม role
- จัดการข้อมูลผู้ป่วยและการเข้ารับบริการ
- สแกน/อัปโหลดและจัดเก็บเอกสาร
- เรียกดูเอกสารในหลายมุมมอง
- จัดการเอกสารที่ผิดพลาด (ย้าย/แก้/ลบแบบ soft)
- บันทึกและตรวจสอบ Audit Log

### 2.3 คุณลักษณะผู้ใช้ (User Characteristics)
| Role | ลักษณะ | นัยยะต่อการออกแบบ |
|------|--------|-------------------|
| แพทย์ | ภาระงานสูง ต้องการเข้าถึงเร็ว | login ด้วยเลข ว. + PIN, เน้นมุมมองดูเอกสาร |
| พยาบาล | ทำงานหน้าเคาน์เตอร์ เครื่องใช้ร่วมกัน | login เร็ว, auto-logout, สแกนกดปุ่มเดียว |
| เวชระเบียน | จัดการความถูกต้องของเอกสาร | สิทธิ์ย้าย/แก้/ลบ + ยืนยัน PIN |
| Admin | ดูแลระบบ | จัดการผู้ใช้, log, ตั้งค่า |

---

## 3. ความต้องการเชิงฟังก์ชันโดยละเอียด

> รูปแบบ: แต่ละความต้องการระบุ Input / Process / Output / Rule

### 3.1 Authentication & User Management

**SRS-A01: เข้าสู่ระบบ (Login)**
- **Input:** เลขวิชาชีพ (เลข ว. / เลขสภาการพยาบาล), PIN 6 หลัก
- **Process:** ตรวจเลขวิชาชีพในระบบ → ตรวจ PIN (เทียบ hash) → กำหนด session ตาม role
- **Output:** เข้าสู่หน้าจอตาม role / ข้อความ error
- **Rules:**
  - เลขวิชาชีพใช้เป็น username เท่านั้น (เป็นข้อมูลกึ่งสาธารณะ ห้ามใช้เป็นความลับ)
  - Role กำหนดอัตโนมัติ ผู้ใช้ไม่ต้องเลือก

**SRS-A02: ตั้งค่าครั้งแรก (First-time Setup)**
- **Input:** เลขวิชาชีพ (จากที่ Admin โหลดไว้), PIN ใหม่ + ยืนยัน, เบอร์/อีเมล
- **Process:** ตรวจว่ามีในรายชื่อ → ให้ตั้ง PIN → เก็บ hash + ข้อมูลติดต่อ
- **Output:** บัญชีพร้อมใช้งาน
- **Rules:** ต้องยืนยัน PIN 2 ครั้งให้ตรงกัน

**SRS-A03: การควบคุมการใส่ PIN ผิด (Throttling)**
- **Input:** จำนวนครั้งที่ใส่ PIN ผิดต่อเนื่อง
- **Process:** ครั้งที่ 1–4 อนุญาตทันที, ครั้งที่ 5+ หน่วงเวลาแบบเพิ่มขึ้น (progressive delay)
- **Output:** อนุญาต / หน่วงเวลาพร้อมแจ้งเวลาที่ต้องรอ
- **Rules:**
  - ห้ามล็อกบัญชีถาวร
  - แสดงลิงก์ "ลืม PIN" ตั้งแต่ใส่ผิดครั้งที่ 2–3
  - reset ตัวนับเมื่อ login สำเร็จ

**SRS-A04: ลืม PIN (OTP Reset)**
- **Input:** คำขอ reset, OTP ที่ได้รับ, PIN ใหม่
- **Process:** ส่ง OTP ไปเบอร์/อีเมล → ตรวจ OTP → ให้ตั้ง PIN ใหม่
- **Output:** PIN ใหม่พร้อมใช้
- **Rules:** OTP มีอายุจำกัด, ใช้ครั้งเดียว

**SRS-A05: จัดการบัญชีผู้ใช้**
- **Input:** ข้อมูลบัญชี (ชื่อ, เลขวิชาชีพ, role)
- **Process:** Admin/เวชระเบียน สร้าง/แก้ไข/ปิดบัญชี/reset PIN
- **Output:** บัญชีที่อัปเดต
- **Rules:** บันทึกทุกการเปลี่ยนแปลงลง Audit Log

**SRS-A06: Auto-logout**
- **Process:** หากไม่มีกิจกรรมเกินเวลาที่กำหนด → logout อัตโนมัติ
- **Rules:** ค่าเวลาตั้งได้ใน Settings (รองรับเครื่องใช้ร่วมกัน)

### 3.2 Patient Management

**SRS-P01: สร้าง Patient Profile**
- **Input:** HN, เลขบัตรประชาชน, ชื่อ, นามสกุล, วันเกิด
- **Process:** ตรวจซ้ำด้วย HN/เลขบัตร → ถ้าไม่ซ้ำ บันทึก (เข้ารหัสเลขบัตร)
- **Output:** Patient Profile ใหม่ / แจ้งเตือนถ้าซ้ำ
- **Rules:** HN และเลขบัตรเป็น unique key

**SRS-P02: ค้นหาผู้ป่วย**
- **Input:** HN หรือเลขบัตรประชาชน
- **Process:** query และแสดง list ที่ตรงกัน
- **Output:** รายการผู้ป่วยให้เลือก (auto-select)

### 3.3 Visit Management

**SRS-V01: สร้าง/เลือก Visit**
- **Input:** Patient, visit_no (VN/AN), ประเภท (OPD/IPD), วันที่
- **Process:** ผูก Visit กับ Patient
- **Output:** Visit ที่สร้าง/เลือก
- **Rules:** 1 Patient มีได้หลาย Visit

**SRS-V02: แสดงรายการ Visit ของผู้ป่วย**
- **Output:** รายการ Visit ทั้งหมดของผู้ป่วยคนนั้น เรียงตามวันที่

### 3.4 Document Scan & Upload

**SRS-S01: ยืนยันตัวตนผู้ป่วยก่อนจัดเก็บ**
- **Process:** แสดง preview ชื่อ-นามสกุล-วันเกิด ให้ผู้ใช้ยืนยัน
- **Rules:** ต้องยืนยันก่อนดำเนินการต่อ

**SRS-S02: สแกนผ่าน eSCL**
- **Input:** คำสั่งสแกนจาก UI
- **Process:** Scan Service สั่ง MFP ผ่าน eSCL → รับไฟล์ → บันทึกใน Storage → ผูกกับ case
- **Output:** ไฟล์เข้า case อัตโนมัติ
- **Rules:** Scan Service ต้องอยู่ LAN เดียวกับ MFP

**SRS-S03: อัปโหลดด้วยตนเอง**
- **Input:** ไฟล์ PDF/PNG/JPG
- **Process:** upload + validate ประเภทไฟล์
- **Rules:** ปฏิเสธไฟล์นอกเหนือ PDF/PNG/JPG (ไม่รับ DICOM)

**SRS-S04: เลือกหมวดหมู่ + ยืนยันปลายทาง**
- **Input:** หมวดหมู่เอกสาร (จาก dropdown)
- **Process:** แสดง preview ปลายทาง (HN/VN/AN) → บันทึกเมื่อยืนยัน
- **Output:** เอกสารบันทึกพร้อม metadata + Audit Log

### 3.5 Document Viewer

**SRS-D01: มุมมองระดับ HN**
- **Output:** แสดงทุก Visit ของผู้ป่วยคนนั้น

**SRS-D02: มุมมองระดับ Visit**
- **Output:** เอกสารทั้งหมดของ Visit ที่เลือก

**SRS-D03: มุมมองรวมแยกหมวด**
- **Output:** เอกสารทั้งหมดของผู้ป่วยจัดกลุ่มตามหมวด (ฟิล์ม/ผลเลือด/คำวินิจฉัย ฯลฯ)

**SRS-D04: เปิดดู + Print/Download**
- **Process:** แสดงไฟล์ในระบบ, print/download ตามสิทธิ์
- **Rules:** บันทึก Audit Log การเปิดดูทุกครั้ง

### 3.6 Document Management

**SRS-M01: ย้าย/แก้/ลบเอกสาร**
- **Input:** เอกสารเป้าหมาย, การกระทำ, PIN
- **Process:** ยืนยัน PIN → ดำเนินการ (ย้าย = เปลี่ยน FK, แก้ = เปลี่ยนหมวด, ลบ = soft-delete)
- **Output:** ผลลัพธ์ + Audit Log
- **Rules:**
  - ลบเป็น soft-delete เท่านั้น (ไม่ลบจริง)
  - ต้องยืนยัน PIN ทุกครั้ง
  - สิทธิ์เฉพาะเวชระเบียน/Admin

### 3.7 Audit Log

**SRS-L01: บันทึก Log**
- **Process:** บันทึกทุกการกระทำ (login, view, upload, move, edit, delete) พร้อม ใคร/อะไร/เมื่อไหร่/เป้าหมาย

**SRS-L02: ดู/ค้น/Export Log**
- **Rules:** เปิดให้เฉพาะ Admin

### 3.8 System Settings

**SRS-C01:** Admin จัดการหมวดหมู่เอกสาร
**SRS-C02:** Admin ตั้งค่า session timeout และ scanner config

---

## 4. ความต้องการด้าน Interface

### 4.1 User Interface
- รองรับภาษาไทยเป็นหลัก
- ปุ่มสแกนเด่นชัดในหน้า case
- หน้าจอ login เรียบง่าย (ช่องเลขวิชาชีพ + PIN)
- รองรับการแสดงผลบนเครื่องเดสก์ท็อปและแท็บเล็ตในโรงพยาบาล

### 4.2 Hardware Interface
- เครื่อง MFP/Scanner ผ่านโปรโตคอล eSCL บน LAN

### 4.3 Software Interface
- Database (PostgreSQL แนะนำ)
- File Storage (NAS / S3-compatible)
- OTP gateway (SMS/Email) สำหรับ reset PIN

### 4.4 Communication Interface
- HTTPS/TLS ทุกการเชื่อมต่อระหว่าง client–server
- eSCL/HTTP ระหว่าง Scan Service–MFP (ภายใน LAN)

---

## 5. ความต้องการที่ไม่ใช่ฟังก์ชัน

| รหัส | ด้าน | รายละเอียด |
|------|------|-----------|
| NFR-01 | Security | HTTPS/TLS, hash PIN (bcrypt), เข้ารหัสเลขบัตร ปชช |
| NFR-02 | Privacy/PDPA | แสดงเลขบัตรเต็มเฉพาะผู้มีสิทธิ์, อื่นเห็น 4 ตัวท้าย; เก็บข้อมูลเท่าที่จำเป็น |
| NFR-03 | Access Control | RBAC ตาม role matrix |
| NFR-04 | Auditability | บันทึกทุกการเข้าถึง/แก้ไข, ตรวจสอบย้อนหลังได้ |
| NFR-05 | Usability | login ไม่เกิน 2 ขั้นตอน, สแกนกดปุ่มเดียว |
| NFR-06 | Performance | เปิดไฟล์เป้าหมาย < 3 วินาที, ค้นหา < 2 วินาที |
| NFR-07 | Availability | รองรับการใช้งานในเวลาทำการของ รพ |
| NFR-08 | Compatibility | Chrome, Edge, Firefox, Safari เวอร์ชันปัจจุบัน |
| NFR-09 | Maintainability | สถาปัตยกรรมแบบโมดูล รองรับการเพิ่ม OCR/Dashboard เฟส 2 |
| NFR-10 | Data Integrity | soft-delete, ป้องกัน profile ซ้ำ, การยืนยันก่อนบันทึก |

---

## 6. ข้อจำกัดและข้อสมมติ (Constraints & Assumptions)

### 6.1 ข้อจำกัด (Constraints)
- ไม่เชื่อมต่อ HIS เดิม — ข้อมูลผู้ป่วย key-in เอง
- รองรับเฉพาะ PDF/PNG/JPG (ไม่รวม DICOM)
- ขอบเขตผู้รับจ้าง = Software เท่านั้น
- การเชื่อมสแกนเนอร์ต้องการ MFP ที่รองรับ eSCL และอยู่ LAN เดียวกับ Scan Service

### 6.2 ข้อสมมติ (Assumptions)
- ผู้ว่าจ้างจัดหาและดูแล Server/Storage/Network
- มีการสำรวจรุ่นเครื่อง MFP และปริมาณเอกสารก่อนเริ่มพัฒนา
- การยืนยันเลขวิชาชีพอาศัยข้อมูลที่ Admin กรอก (ยังไม่ verify อัตโนมัติกับสภาวิชาชีพ)

### 6.3 ส่วนขยายเฟสถัดไป (Future Scope)
- OCR auto-classification (Qwen-VL / Typhoon OCR, on-premise)
- Register Form ผูก Organization
- Dashboard & Statistics
- DICOM support
- HIS integration

---

## ภาคผนวก: Traceability (เชื่อมโยงเอกสาร)
- ความต้องการระดับธุรกิจ/ฟังก์ชัน → เอกสาร `01_Requirements.md`
- สถาปัตยกรรม/โมเดลข้อมูล/โมดูล → เอกสาร `02_Software_Development_Structure.md`
- กระบวนการทำงาน/flow → เอกสาร `03_System_Flow.md`
