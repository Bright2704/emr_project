# 03 — System Flow
## ระบบจัดเก็บและเรียกดูเอกสารสแกนผู้ป่วย (EMR Scan Viewer)

> เอกสารนี้แสดงกระบวนการทำงานของระบบในรูปแบบ flow และ sequence diagram

---

## 1. ภาพรวม Flow ทั้งหมด (High-level Map)

```mermaid
graph LR
    A[เข้าสู่ระบบ] --> B{Role}
    B -->|พยาบาล/เวชระเบียน| C[ค้นหา/สร้างผู้ป่วย]
    B -->|แพทย์| F[ค้นหาเพื่อดูเอกสาร]
    C --> D[เลือก/สร้าง Visit]
    D --> E[สแกน/อัปโหลดเอกสาร]
    F --> G[ดูเอกสารตาม HN/Visit/หมวด]
    B -->|เวชระเบียน| H[จัดการเอกสารผิดพลาด]
    B -->|Admin| I[จัดการผู้ใช้/Log/ตั้งค่า]
```

---

## 2. Flow การเข้าใช้งานครั้งแรก (First-time Setup)

```mermaid
sequenceDiagram
    participant N as ผู้ใช้ (แพทย์/พยาบาล)
    participant S as ระบบ
    participant A as Admin (เตรียมล่วงหน้า)

    A->>S: โหลดรายชื่อ (ชื่อ + เลขวิชาชีพ + role)
    N->>S: ใส่เลขวิชาชีพ (ครั้งแรก)
    S->>S: ตรวจว่ามีในรายชื่อหรือไม่
    alt มีในรายชื่อ
        S->>N: พาไปหน้าตั้ง PIN 6 หลัก
        N->>S: ตั้ง PIN + ยืนยัน PIN + กรอกเบอร์/อีเมล
        S->>N: เข้าใช้งานได้
    else ไม่มีในรายชื่อ
        S->>N: แจ้งติดต่อ Admin
    end
```

---

## 3. Flow การเข้าสู่ระบบปกติ + Throttling

```mermaid
flowchart TD
    Start([ผู้ใช้เข้าระบบ]) --> Input[ใส่เลขวิชาชีพ + PIN]
    Input --> Check{PIN ถูกต้อง?}
    Check -->|ถูก| Success[เข้าระบบ - กำหนดหน้าจอตาม role]
    Check -->|ผิด| Count{ผิดครั้งที่เท่าไหร่?}
    Count -->|1-4| Retry[ลองใหม่ได้ทันที + แสดงลิงก์ ลืม PIN]
    Count -->|5 ขึ้นไป| Delay[หน่วงเวลาเพิ่มขึ้น<br/>30วิ → 1นาที → 2นาที]
    Retry --> Input
    Delay --> Input
    Success --> Log[(บันทึก Audit Log: login)]
```

> **หลักการ:** ไม่ล็อกบัญชีถาวร — บุคลากรต้องเข้าถึงข้อมูลผู้ป่วยได้เสมอ ใช้การหน่วงเวลาแทนการล็อก

---

## 4. Flow ลืม PIN (OTP Reset)

```mermaid
sequenceDiagram
    participant N as ผู้ใช้
    participant S as ระบบ
    participant O as OTP Channel (SMS/Email)

    N->>S: กด "ลืม PIN"
    S->>O: ส่ง OTP ไปเบอร์/อีเมลที่ลงทะเบียน
    O->>N: รับ OTP
    N->>S: ใส่ OTP
    S->>S: ตรวจสอบ OTP
    alt OTP ถูกต้อง
        S->>N: พาไปหน้าตั้ง PIN ใหม่
        N->>S: ตั้ง PIN ใหม่
        S->>N: สำเร็จ เข้าใช้งานได้
    else OTP ผิด/หมดอายุ
        S->>N: แจ้งขอ OTP ใหม่
    end
```

---

## 5. Flow การสแกน/จัดเก็บเอกสาร (Core Flow)

```mermaid
sequenceDiagram
    participant N as พยาบาล
    participant UI as Web App
    participant API as Backend
    participant SC as Scan Service
    participant MFP as เครื่อง MFP
    participant FS as File Storage

    N->>UI: ค้นหาด้วย HN / เลขบัตร ปชช
    UI->>API: query patient
    API->>UI: แสดง list ผู้ป่วยที่ตรงกัน
    N->>UI: คลิกเลือกผู้ป่วย
    UI->>N: Preview ชื่อ-นามสกุล-วันเกิด (ยืนยันตัวตน)
    N->>UI: ยืนยัน → เลือก/สร้าง Visit (VN/AN)
    N->>UI: วางกระดาษบนเครื่อง + กดปุ่ม "สแกน"
    UI->>SC: สั่งสแกน
    SC->>MFP: eSCL scan command (HTTP)
    MFP->>SC: ส่งไฟล์กลับ (PDF/JPEG)
    SC->>FS: บันทึกไฟล์
    SC->>UI: ไฟล์เข้า case
    N->>UI: เลือกหมวดหมู่เอกสาร
    UI->>N: Preview ปลายทาง (HN/VN)
    N->>UI: ยืนยันบันทึก
    UI->>API: save metadata + link file
    API->>FS: confirm
    API-->>API: บันทึก Audit Log (upload)
```

---

## 6. Flow การสร้างผู้ป่วยใหม่ (กันสร้างซ้ำ)

```mermaid
flowchart TD
    Start([สร้างผู้ป่วยใหม่]) --> Input[กรอก HN / เลขบัตร ปชช]
    Input --> Check{มีในระบบแล้ว?}
    Check -->|มี| Warn[เด้งเตือน: ผู้ป่วยมีอยู่แล้ว<br/>ต้องการเปิด Visit ใหม่?]
    Check -->|ไม่มี| Form[กรอกชื่อ-นามสกุล-วันเกิด]
    Warn -->|ใช่| OpenVisit[ไปสร้าง Visit ใหม่ของผู้ป่วยเดิม]
    Warn -->|ไม่ใช่| Cancel[ยกเลิก]
    Form --> Save[(บันทึก Patient Profile)]
    Save --> Done([เสร็จสิ้น])
    OpenVisit --> Done
```

---

## 7. Flow การเรียกดูเอกสาร (แพทย์)

```mermaid
flowchart TD
    Start([แพทย์ค้นหา HN]) --> Found{พบผู้ป่วย?}
    Found -->|ไม่พบ| NotFound[แจ้งไม่พบข้อมูล]
    Found -->|พบ| HNView[มุมมองระดับ HN<br/>แสดงทุก Visit]
    HNView --> Choice{เลือกมุมมอง}
    Choice -->|รายครั้ง| VisitView[เลือก Visit → เอกสารของครั้งนั้น]
    Choice -->|รวมแยกหมวด| CatView[เอกสารทั้งหมด<br/>จัดกลุ่ม: ฟิล์ม/ผลเลือด/คำวินิจฉัย]
    VisitView --> Open[เปิดไฟล์ + print/download]
    CatView --> Open
    Open --> Log[(Audit Log: view)]
```

---

## 8. Flow การจัดการเอกสารผิดพลาด (เวชระเบียน)

```mermaid
sequenceDiagram
    participant M as เวชระเบียน
    participant UI as Web App
    participant API as Backend

    M->>UI: ค้นหาเอกสารที่จัดเก็บผิด
    M->>UI: เลือกการกระทำ (ย้าย / แก้หมวด / ลบ)
    UI->>M: ขอยืนยันด้วย PIN
    M->>UI: ใส่ PIN
    UI->>API: ตรวจ PIN + ดำเนินการ
    alt ย้าย
        API->>API: เปลี่ยน visit_id/patient_id
    else แก้หมวด
        API->>API: เปลี่ยน category_id
    else ลบ
        API->>API: เปลี่ยน status = soft_deleted
    end
    API-->>API: บันทึก Audit Log (พร้อมเหตุผล/ผู้ทำ)
    API->>UI: สำเร็จ
```

---

## 9. สรุปจุดควบคุมสำคัญในแต่ละ Flow (Control Points)

| Flow | จุดควบคุม |
|------|----------|
| Login | Throttling แทน lockout, ไม่ล็อกถาวร |
| สแกน/จัดเก็บ | Preview 2 จุด (ยืนยันตัวตนผู้ป่วย + ยืนยันปลายทาง) |
| สร้างผู้ป่วย | ตรวจซ้ำด้วย HN/เลขบัตร ปชช |
| จัดการเอกสาร | ยืนยัน PIN ทุกครั้ง + บันทึก log |
| ทุก Flow | บันทึก Audit Log ทุกการกระทำ |
