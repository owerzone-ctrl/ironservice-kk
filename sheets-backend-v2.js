/**
 * IRONSERVICE KK — Google Apps Script (อัปเกรดใหม่)
 * ===================================================
 * ติดตั้งใน Google Sheets → Extensions → Apps Script
 * แล้ว Deploy เป็น Web App
 * ===================================================
 */

// ============================================
// SHEET SETUP — รันครั้งแรกครั้งเดียว
// ============================================
function setupAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. PRODUCTS SHEET — สินค้า (กรอกจาก Shopee)
  let ps = ss.getSheetByName('Products');
  if (!ps) {
    ps = ss.insertSheet('Products');
    ps.getRange(1,1,1,12).setValues([[
      'id','name','category','price_min','price_max',
      'image_url','shopee_url','description','materials',
      'sizes','active','featured'
    ]]);
    ps.getRange(1,1,1,12).setFontWeight('bold').setBackground('#f1a90a').setFontColor('#000');
    
    // ใส่สินค้าตัวอย่าง (แก้ไขเองได้เลย)
    ps.getRange(2,1,5,12).setValues([
      [1,'โต๊ะทำงาน Loft Wood + เหล็ก','furniture',6500,12000,
       'https://down-th.img.susercontent.com/file/th-11134207-7r98y-lzl9n36xf9af90','https://shopee.co.th/ironservice_kk',
       'โต๊ะทำงานสไตล์ลอฟท์ โครงเหล็กดำ หน้าไม้จริง ทนทาน แข็งแรง',
       'เหล็กกล่อง+ไม้จริง','W120xD60xH75 ซม.','TRUE','TRUE'],
      [2,'ชั้นวางของ Loft 5 ชั้น','furniture',4500,8000,
       '','https://shopee.co.th/ironservice_kk',
       'ชั้นวางของสไตล์ลอฟท์ 5 ชั้น โครงเหล็กดำ แผ่นไม้',
       'เหล็กกล่อง+ไม้','W80xD30xH180 ซม.','TRUE','FALSE'],
      [3,'ฉลุลาย CNC ประตู','cnc',800,3000,
       '','https://shopee.co.th/ironservice_kk',
       'ฉลุลายเหล็ก CNC สวยงาม หลากหลายลาย สั่งทำตามขนาด',
       'เหล็กแผ่น','ตามสั่ง','TRUE','TRUE'],
      [4,'ประตูรั้วเหล็กดัด','grille',8000,25000,
       '','https://shopee.co.th/ironservice_kk',
       'ประตูรั้วเหล็กดัด ลวดลายสวยงาม แข็งแรง ทนทาน',
       'เหล็กดัด','ตามสั่ง','TRUE','FALSE'],
      [5,'เตียงนอน Loft Iron','furniture',12000,22000,
       '','https://shopee.co.th/ironservice_kk',
       'เตียงนอนสไตล์ลอฟท์ โครงเหล็กแท้ แข็งแรง ทันสมัย',
       'เหล็กกล่อง','3.5/5/6 ฟุต','TRUE','TRUE'],
    ]);
  }
  
  // 2. ORDERS SHEET
  let os = ss.getSheetByName('Orders');
  if (!os) {
    os = ss.insertSheet('Orders');
    os.getRange(1,1,1,12).setValues([[
      'order_id','customer','phone','type','detail',
      'price','deposit','status','progress','pay_status','date','note'
    ]]);
    os.getRange(1,1,1,12).setFontWeight('bold').setBackground('#18181b').setFontColor('#f1a90a');
  }
  
  // 3. PAYMENTS SHEET
  let pays = ss.getSheetByName('Payments');
  if (!pays) {
    pays = ss.insertSheet('Payments');
    pays.getRange(1,1,1,9).setValues([[
      'ref','order_id','customer','method','amount','has_slip','date','time','status'
    ]]);
    pays.getRange(1,1,1,9).setFontWeight('bold').setBackground('#18181b').setFontColor('#10b981');
  }
  
  // 4. SETTINGS SHEET
  let set = ss.getSheetByName('Settings');
  if (!set) {
    set = ss.insertSheet('Settings');
    set.getRange(1,1,8,2).setValues([
      ['LINE_NOTIFY_TOKEN',''],
      ['PROMPTPAY_NUMBER','0637409696'],
      ['SHOP_NAME','IRONSERVICE KK'],
      ['SHOP_PHONE','063-740-9696'],
      ['SHOP_LINE','@ironservicekk'],
      ['DEPOSIT_PERCENT','50'],
      ['WEBSITE_URL','https://username.github.io/ironservice-kk'],
      ['SHOPEE_URL','https://shopee.co.th/ironservice_kk'],
    ]);
  }
  
  SpreadsheetApp.getUi().alert('✅ ติดตั้งสำเร็จ! เริ่มกรอกสินค้าใน Sheet "Products" ได้เลย');
}

// ============================================
// doGet — เว็บดึงข้อมูลจาก Sheets
// ============================================
function doGet(e) {
  const action = e.parameter.action || 'products';
  let result;
  
  try {
    if (action === 'products') result = getProducts();
    else if (action === 'order') result = getOrder(e.parameter.id);
    else if (action === 'orders') result = getAllOrders();
    else if (action === 'stats') result = getStats();
    else result = { message: 'IRONSERVICE KK API', version: '2.0' };
    
    return output({ success: true, ...result });
  } catch(err) {
    return output({ success: false, error: err.toString() });
  }
}

// ============================================
// doPost — รับข้อมูลจากเว็บ
// ============================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    let result;
    
    switch(data.action) {
      case 'add_payment':
      case 'payments':
        result = addPayment(data);
        notifyLine(`💳 ชำระเงินใหม่!\nออเดอร์: ${data.orderId}\nลูกค้า: ${data.customer}\nยอด: ฿${Number(data.amount).toLocaleString()}\nวิธี: ${data.method}\nRef: ${data.ref}`);
        break;
      case 'add_order':
        result = addOrder(data);
        notifyLine(`📦 ออเดอร์ใหม่!\nID: ${data.id}\nลูกค้า: ${data.customer}\nงาน: ${data.detail}\nราคา: ฿${Number(data.price).toLocaleString()}`);
        break;
      case 'update_order':
        result = updateOrder(data);
        if (data.notify === 'yes') {
          notifyLine(`📬 อัปเดทออเดอร์ ${data.orderId}\nสถานะ: ${statusTH(data.status)}\nคืบหน้า: ${data.progress}%`);
        }
        break;
      case 'verify_payment':
        result = verifyPayment(data.ref);
        break;
      default:
        result = { error: 'Unknown action' };
    }
    
    return output({ success: true, ...result });
  } catch(err) {
    return output({ success: false, error: err.toString() });
  }
}

// ============================================
// PRODUCTS
// ============================================
function getProducts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Products');
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  
  const products = rows.slice(1)
    .filter(r => r[10] === true || r[10] === 'TRUE') // active only
    .map(r => {
      const obj = {};
      headers.forEach((h,i) => obj[h] = r[i]);
      return obj;
    });
  
  return { products, total: products.length };
}

// ============================================
// ORDERS
// ============================================
function addOrder(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Orders');
  const now = new Date();
  const deposit = Math.ceil((data.price||0) * 0.5 / 100) * 100;
  
  sheet.appendRow([
    data.id || `QU-${Date.now().toString().slice(-5)}`,
    data.customer, data.phone, data.type, data.detail,
    data.price||0, deposit, data.status||'pending',
    5, 'unpaid',
    Utilities.formatDate(now, 'Asia/Bangkok', 'dd/MM/yyyy'),
    data.note||''
  ]);
  log(`สร้างออเดอร์: ${data.id} — ${data.customer}`);
  return { created: true, id: data.id };
}

function getOrder(orderId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Orders');
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0] === orderId || rows[i][0] === `QU-${orderId}`) {
      const obj = {};
      headers.forEach((h,idx) => obj[h] = rows[i][idx]);
      return { order: obj };
    }
  }
  return { order: null, error: 'ไม่พบออเดอร์' };
}

function getAllOrders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Orders');
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const orders = rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h,i) => obj[h] = r[i]);
    return obj;
  });
  return { orders, total: orders.length };
}

function updateOrder(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Orders');
  const rows = sheet.getDataRange().getValues();
  
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0] === data.orderId) {
      if (data.status) sheet.getRange(i+1,8).setValue(data.status);
      if (data.progress !== undefined) sheet.getRange(i+1,9).setValue(data.progress);
      if (data.payStatus) sheet.getRange(i+1,10).setValue(data.payStatus);
      log(`อัปเดทออเดอร์ ${data.orderId}: ${data.status} ${data.progress}%`);
      return { updated: true };
    }
  }
  return { updated: false };
}

// ============================================
// PAYMENTS
// ============================================
function addPayment(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Payments');
  const now = new Date();
  
  sheet.appendRow([
    data.ref || `PAY-${Date.now().toString().slice(-6)}`,
    data.orderId, data.customer, data.method,
    data.amount||0, data.hasSlip?'ใช่':'ไม่มี',
    Utilities.formatDate(now,'Asia/Bangkok','dd/MM/yyyy'),
    Utilities.formatDate(now,'Asia/Bangkok','HH:mm'),
    'pending'
  ]);
  
  // อัปเดทออเดอร์ → มัดจำแล้ว
  updateOrder({ orderId: data.orderId, payStatus: 'partial' });
  log(`ชำระเงิน: ${data.ref} ออเดอร์ ${data.orderId} ฿${data.amount}`);
  return { ref: data.ref, recorded: true };
}

function verifyPayment(ref) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Payments');
  const rows = sheet.getDataRange().getValues();
  
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0] === ref) {
      sheet.getRange(i+1,9).setValue('verified');
      log(`ยืนยันการชำระ: ${ref}`);
      return { verified: true };
    }
  }
  return { verified: false };
}

// ============================================
// STATS
// ============================================
function getStats() {
  const ordersResult = getAllOrders();
  const orders = ordersResult.orders || [];
  return {
    totalOrders: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    production: orders.filter(o => o.status === 'production').length,
    done: orders.filter(o => o.status === 'done').length,
  };
}

// ============================================
// LINE NOTIFY
// ============================================
function notifyLine(message) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const set = ss.getSheetByName('Settings');
    const rows = set.getDataRange().getValues();
    let token = '';
    rows.forEach(r => { if (r[0]==='LINE_NOTIFY_TOKEN') token = r[1]; });
    if (!token) return;
    
    UrlFetchApp.fetch('https://notify-api.line.me/api/notify', {
      method: 'post',
      headers: { 'Authorization': 'Bearer ' + token },
      payload: { message: '\n' + message }
    });
  } catch(e) { log('LINE Error: ' + e.toString()); }
}

// ============================================
// HELPERS
// ============================================
function output(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function log(msg) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logs = ss.getSheetByName('Logs');
    if (!logs) logs = ss.insertSheet('Logs');
    const now = new Date();
    logs.appendRow([
      Utilities.formatDate(now,'Asia/Bangkok','dd/MM/yyyy'),
      Utilities.formatDate(now,'Asia/Bangkok','HH:mm:ss'),
      msg
    ]);
  } catch(e) {}
}

function statusTH(s) {
  const m = { pending:'รอดำเนินการ', design:'กำลังออกแบบ', production:'กำลังผลิต', shipping:'จัดส่งแล้ว', done:'เสร็จสมบูรณ์' };
  return m[s] || s;
}

// ============================================
// MENU
// ============================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔩 IRONSERVICE KK')
    .addItem('⚙️ ติดตั้งระบบ (ครั้งแรก)', 'setupAllSheets')
    .addItem('📊 ดูสถิติ', 'showStats')
    .addItem('📱 ทดสอบ LINE Notify', 'testLine')
    .addSeparator()
    .addItem('🌐 เปิดเว็บไซต์', 'openWebsite')
    .addToUi();
}

function showStats() {
  const s = getStats();
  SpreadsheetApp.getUi().alert(
    `📊 สถิติ IRONSERVICE KK\n\nออเดอร์ทั้งหมด: ${s.totalOrders}\nรอดำเนินการ: ${s.pending}\nกำลังผลิต: ${s.production}\nเสร็จแล้ว: ${s.done}`
  );
}

function testLine() {
  notifyLine('🔔 ทดสอบระบบ IRONSERVICE KK — พร้อมใช้งาน!');
  SpreadsheetApp.getUi().alert('ส่ง LINE Notify สำเร็จ!');
}

function openWebsite() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const set = ss.getSheetByName('Settings');
  if (!set) return;
  const rows = set.getDataRange().getValues();
  let url = '';
  rows.forEach(r => { if (r[0]==='WEBSITE_URL') url = r[1]; });
  if (url) SpreadsheetApp.getUi().alert('เปิดเว็บที่: ' + url);
}
