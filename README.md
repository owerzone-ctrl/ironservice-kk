# 🔩 IRONSERVICE KK — Website

**เว็บไซต์ร้านเฟอร์นิเจอร์ลอฟท์ เหล็กและไม้สไตล์พรีเมียม**  
อุดรธานี | LINE: @ironservicekk | Tel: 063-740-9696

---

## 📁 โครงสร้างไฟล์

```
loft-and-craft-web/
├── index.html          ← หน้าแรก (หน้าหลัก)
├── payment.html        ← ระบบชำระเงิน
├── admin.html          ← Admin Dashboard
├── quotation.html      ← ใบเสนอราคา
├── estimate.html       ← ประเมินราคา
├── table-sets.html     ← หน้าสินค้าชุดโต๊ะ
├── catalog-builder.html← สร้างแคตตาล็อก
├── style.css           ← ไฟล์ดีไซน์หลัก
├── script.js           ← JavaScript หลัก
├── sync_shopee.js      ← ซิงค์ Shopee
├── sheets-backend.js   ← Google Apps Script Backend
├── assets/             ← รูปภาพและสื่อต่างๆ
└── README.md           ← ไฟล์นี้
```

---

## 🚀 วิธี Host ฟรีด้วย GitHub Pages

### ขั้นที่ 1 — สร้าง GitHub Account
1. ไปที่ **https://github.com**
2. กด **Sign up** — กรอก email, password, username
3. ยืนยัน email

### ขั้นที่ 2 — สร้าง Repository ใหม่
1. กด **"New"** (ปุ่มสีเขียว)
2. ตั้งชื่อ: `ironservice-kk` (หรือชื่ออื่นที่ชอบ)
3. เลือก **Public**
4. กด **"Create repository"**

### ขั้นที่ 3 — อัปโหลดไฟล์ทั้งหมด
1. ในหน้า Repository กด **"uploading an existing file"**
2. ลากไฟล์ทั้งหมดจากโฟลเดอร์ `loft-and-craft-web` วางลงไป
   - รวมถึงโฟลเดอร์ `assets/` ด้วย
3. กด **"Commit changes"** (ปุ่มสีเขียว)

### ขั้นที่ 4 — เปิด GitHub Pages
1. ไปที่ **Settings** (เมนูบนสุดของ Repository)
2. เลือก **Pages** (เมนูซ้าย)
3. ใต้ Source เลือก **"Deploy from a branch"**
4. Branch: เลือก **main** → folder: **/ (root)**
5. กด **Save**

### ขั้นที่ 5 — รอ 2-3 นาที แล้วเข้าเว็บได้เลย!
URL จะเป็น: `https://[username].github.io/ironservice-kk/`

---

## 🔗 เชื่อม Google Sheets (Backend จริง)

### วิธีติดตั้ง sheets-backend.js
1. เปิด **Google Sheets** ใหม่
2. ตั้งชื่อว่า **"IRONSERVICE KK Database"**
3. ไปที่ **Extensions → Apps Script**
4. วางโค้ดจากไฟล์ `sheets-backend.js` ทั้งหมด
5. กด **บันทึก** (Ctrl+S)
6. กด **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. กด **Deploy** → คัดลอก URL ที่ได้
8. เปิด `admin.html` → Settings → วาง URL → บันทึก

---

## 📱 เชื่อม LINE Notify

1. ไปที่ **https://notify-bot.line.me**
2. Login ด้วย LINE Account
3. กด **Generate token**
4. ตั้งชื่อ: "IRONSERVICE KK Orders"
5. เลือก Chat: ตัวเอง หรือ Group ร้าน
6. คัดลอก Token
7. เปิด `admin.html` → Settings → วาง Token → บันทึก

---

## 🛒 เพิ่มสินค้าจาก Shopee

เปิด Google Sheets ที่สร้างไว้ → Sheet ชื่อ **"Products"**  
กรอกสินค้าตามคอลัมน์:

| id | name | category | price | image_url | shopee_url | description |
|----|------|----------|-------|-----------|------------|-------------|
| 1 | โต๊ะทำงาน Loft | furniture | 8500 | [url] | [shopee link] | รายละเอียด |

เว็บจะดึงข้อมูลมาแสดงอัตโนมัติ ✅

---

## 📞 ติดต่อ
- LINE OA: @ironservicekk  
- Tel: 063-740-9696  
- Shopee: https://shopee.co.th/ironservice_kk  
- Facebook: IRONSERVICE.KK
