# Eden — Website

เว็บไซต์แบรนด์เสื้อผ้า Eden (Old Money x Streetwear)

## โครงสร้างไฟล์

```
eden-website/
├── index.html         หน้าแรก (Hero + หมวดหมู่ Streetwear/Classic)
├── product.html        หน้าสินค้าทั้งหมด (กรองตาม mood)
├── order.html           ฟอร์มสั่งซื้อ (auto-fill จาก product.html)
├── thankyou.html      หน้าขอบคุณหลังสั่งซื้อสำเร็จ
├── style.css            ธีมกลาง ใช้ร่วมกันทุกหน้า
├── script.js            โหลด/กรอง/แสดงสินค้า + จัดการฟอร์มสั่งซื้อ ใช้ร่วมกันทุกหน้า
├── products.json      ข้อมูลสินค้า 3 ชิ้น พร้อมรูปจริง
└── images/
    ├── eden-signature-puffer.jpg
    ├── eden-old-money-sweatshirt.jpg
    └── eden-floral-emblem-tee.jpg
```

ทุกไฟล์ต้องอยู่**โฟลเดอร์เดียวกัน** เพราะเชื่อมกันด้วย relative path (เช่น `order.html` redirect ไป `thankyou.html` ตรงๆ) แยกอัปโหลดคนละที่ไม่ได้

รูปสินค้าจริงใส่ไว้ครบแล้ว ไม่ต้องแก้ไขอะไรเพิ่มในส่วนนี้

## Apps Script

เชื่อมกับ Google Apps Script เรียบร้อยแล้วใน `script.js` (ตัวแปร `APPS_SCRIPT_URL`) — ไม่ต้องแก้ไขอะไรเพิ่ม เว้นแต่จะ deploy เวอร์ชันใหม่ในอนาคต ต้องเอา URL ใหม่มาแทนที่ที่นี่

## ยังไม่ได้สร้าง (เพิ่มเข้ามาทีหลังได้)

- โค้ด Google Apps Script (`.gs`) สำหรับรับข้อมูลออเดอร์และบันทึกลง Google Sheet — สร้างแยกที่ script.google.com แล้วเอา URL มาใส่ตามข้างบน (ไม่ใช่ไฟล์ในโฟลเดอร์นี้)

## วิธีอัปโหลดขึ้น GitHub

1. สร้าง repository ใหม่
2. ลากไฟล์/โฟลเดอร์ทั้งหมดในนี้เข้าไปที่หน้า "Add file → Upload files"
   (หรือใช้คำสั่ง `git add .` / `git commit` / `git push` ถ้าถนัด command line)
