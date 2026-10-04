# Eden — Website

เว็บไซต์แบรนด์เสื้อผ้า Eden (Old Money x Streetwear)

## โครงสร้างไฟล์

```
eden-website/
├── index.html         หน้าแรก (Hero + หมวดหมู่ Streetwear/Classic)
├── product.html        หน้าสินค้าทั้งหมด (กรองตาม mood)
├── order.html           ฟอร์มสั่งซื้อ (auto-fill จาก product.html)
├── thankyou.html      หน้าขอบคุณหลังสั่งซื้อสำเร็จ
├── pos.html              บันทึกยอดขายหน้าร้าน (ภายใน ไม่ให้ลูกค้าเห็น)
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

## ฐานข้อมูลสินค้า (Supabase)

ตอนนี้ `script.js` ดึงข้อมูลสินค้าจากตาราง `products` ใน Supabase โดยตรง (ไม่ใช้ `products.json` แล้ว — ไฟล์นี้เก็บไว้เป็น backup/อ้างอิงเฉยๆ)

**เพิ่ม/แก้ไขสินค้า**: เข้า Supabase Dashboard → Table Editor → ตาราง `products` แก้ข้อมูลได้เลย ไม่ต้องแตะโค้ด ไม่ต้อง commit ขึ้น GitHub ใหม่

คอลัมน์ในตาราง: `id`, `name`, `mood` (`streetwear`/`classic`), `type`, `size` (array เช่น `{L,XL,3XL}`), `price`, `image` (path แบบ `images/xxx.jpg`), `description`, `stock` (จำนวนคงเหลือ)

✅ `stock` ตัดจริงอัตโนมัติแล้ว — แต่**เฉพาะตอนขายผ่าน `pos.html`** เท่านั้น (ทำผ่าน Supabase function `decrement_product_stock`) ส่วนออเดอร์จาก `order.html` (ลูกค้าสั่งออนไลน์) **ยังไม่ตัดสต็อก** เพราะเป็นคนละ flow กัน ถ้าอยากให้ตัดด้วยบอกได้

## Apps Script (รับออเดอร์ + POS → Google Sheet, ตัดสต็อก, แจ้งเตือน Telegram)

เชื่อมกับ Google Apps Script เรียบร้อยแล้วใน `script.js` (ตัวแปร `APPS_SCRIPT_URL`) — ไม่ต้องแก้ไขอะไรเพิ่มฝั่งเว็บ

โค้ดฝั่ง Apps Script (`Code.gs`) แยกทำงาน 2 ทาง:
- **ออเดอร์ลูกค้า** (`order.html`) → บันทึกแท็บแรกของสเปรดชีต + แจ้งเตือน Telegram
- **ยอดขาย POS** (`pos.html`) → บันทึกแท็บ **"POS"** (สร้างอัตโนมัติ) + **ตัดสต็อกจริงใน Supabase** + แจ้งเตือน Telegram 2 แบบ: "มีรายการขายใหม่" ทุกครั้ง และ **"สต็อกใกล้หมด"** ถ้าขายแล้วเหลือ ≤ 5 ชิ้น

**ต้องใส่ค่า 3 ตัวใน `Code.gs` เอง ก่อนใช้งานได้จริง** (ยังเป็น placeholder อยู่):
| ตัวแปร | เอาจากไหน |
|---|---|
| `TELEGRAM_BOT_TOKEN` | @BotFather ตอนสร้างบอท |
| `TELEGRAM_CHAT_ID` | Channel/Chat ที่อยากให้แจ้งเตือนเข้า |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API Keys (⚠️ คีย์สิทธิ์สูงสุด ใส่ได้เฉพาะใน `Code.gs` เท่านั้น ห้ามใส่ในไฟล์ฝั่งเว็บเด็ดขาด) |

ใส่ครบแล้ว deploy เวอร์ชันใหม่ (Manage deployments → New version)

## POS (pos.html)

หน้าสำหรับพนักงาน**จดยอดขายหน้าร้าน** ไม่ใช่ระบบคิดเงินลูกค้า ไม่มีระบบล็อกอิน/สิทธิ์เข้าถึง — ใครมีลิงก์ก็เข้าได้ ถ้าจะใช้งานจริงแนะนำอย่าเปิดลิงก์นี้ให้ลูกค้าเห็น (ไม่ได้ลิงก์จากหน้าไหนในเว็บ ต้องพิมพ์ URL ตรงๆ เช่น `yourdomain.com/pos.html`)

## วิธีอัปโหลดขึ้น GitHub

1. สร้าง repository ใหม่
2. ลากไฟล์/โฟลเดอร์ทั้งหมดในนี้เข้าไปที่หน้า "Add file → Upload files"
   (หรือใช้คำสั่ง `git add .` / `git commit` / `git push` ถ้าถนัด command line)
