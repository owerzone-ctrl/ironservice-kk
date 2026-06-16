function doPost(e) {
  // Handle CORS Preflight or simple POST
  var output = "";
  try {
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action;
    var result = {};
    
    // Auto-initialize sheets
    getOrCreateSheet("Users", ["Username", "PasswordHash", "Role", "Name", "Address", "TaxId", "Phone", "CreatedAt"]);
    getOrCreateSheet("Quotations", ["Date", "QuoteNo", "CustomerName", "Address", "TaxId", "Contact", "Dimensions", "Steel", "Tiers", "Door", "Color", "Weight", "Shipping", "Total", "Seller", "Owner", "Status", "UpdatedAt", "PrintUrl"]);
    getOrCreateSheet("Products", ["ProductId", "Category", "Name", "Price", "Details", "Badge", "Image", "Stock", "Barcode", "CreatedAt", "UpdatedAt"]);
    
    if (action === "register") {
      result = registerUser(requestData);
    } else if (action === "login") {
      result = loginUser(requestData);
    } else if (action === "saveQuotation") {
      result = saveQuotation(requestData);
    } else if (action === "getQuotations") {
      result = getQuotations(requestData);
    } else if (action === "getUsers") {
      result = getUsers(requestData);
    } else if (action === "updateQuotationStatus") {
      result = updateQuotationStatus(requestData);
    } else if (action === "getProducts") {
      result = getProducts(requestData);
    } else if (action === "saveProduct") {
      result = saveProduct(requestData);
    } else if (action === "deleteProduct") {
      result = deleteProduct(requestData);
    } else {
      result = { status: "error", message: "Invalid action" };
    }
    
    output = JSON.stringify(result);
  } catch (err) {
    output = JSON.stringify({ status: "error", message: err.toString() });
  }
  
  return ContentService.createTextOutput(output)
                       .setMimeType(ContentService.MimeType.JSON);
}

// GET request support for testing
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Apps Script API is running" }))
                       .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
         .setFontWeight("bold")
         .setBackground("#ca8a04")
         .setFontColor("#ffffff");
  }
  return sheet;
}

function hashPassword(password) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  var signature = "";
  for (var i = 0; i < digest.length; i++) {
    var byteVal = digest[i];
    if (byteVal < 0) byteVal += 256;
    var byteString = byteVal.toString(16);
    if (byteString.length == 1) byteString = "0" + byteString;
    signature += byteString;
  }
  return signature;
}

function registerUser(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  var rows = sheet.getDataRange().getValues();
  var username = data.username.trim().toLowerCase();
  
  // Check duplicate
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0].toString().toLowerCase() === username) {
      return { status: "error", message: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว" };
    }
  }
  
  var hash = hashPassword(data.password);
  // Default first registered user is admin, others are customers
  var role = rows.length === 1 ? "admin" : "customer";
  
  sheet.appendRow([
    username,
    hash,
    role,
    data.name || "",
    data.address || "",
    data.taxId || "",
    data.phone || "",
    new Date().toISOString()
  ]);
  
  return { status: "success", message: "สมัครสมาชิกสำเร็จ", role: role };
}

function loginUser(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  var rows = sheet.getDataRange().getValues();
  var username = data.username.trim().toLowerCase();
  var hash = hashPassword(data.password);
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0].toString().toLowerCase() === username && rows[i][1] === hash) {
      return {
        status: "success",
        message: "เข้าสู่ระบบสำเร็จ",
        user: {
          username: rows[i][0],
          role: rows[i][2],
          name: rows[i][3],
          address: rows[i][4],
          taxId: rows[i][5],
          phone: rows[i][6]
        }
      };
    }
  }
  return { status: "error", message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
}

function saveQuotation(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Quotations");
  var range = sheet.getDataRange();
  var rows = range.getValues();
  var quoteNo = data.quoteNo.trim();
  
  // Ensure "PrintUrl" header is present on existing sheet
  var headerRow = rows[0];
  var printUrlColIndex = headerRow.indexOf("PrintUrl");
  if (printUrlColIndex === -1) {
    sheet.getRange(1, headerRow.length + 1).setValue("PrintUrl");
    sheet.getRange(1, headerRow.length + 1)
         .setFontWeight("bold")
         .setBackground("#ca8a04")
         .setFontColor("#ffffff");
    // Reload rows to include the new header column index
    rows = sheet.getDataRange().getValues();
    headerRow = rows[0];
    printUrlColIndex = headerRow.length - 1;
  }
  var printUrlFormula = data.printUrl ? '=HYPERLINK("' + data.printUrl + '", "🖨️ พิมพ์ใบเสนอราคา")' : "";

  var record = [
    data.date,
    quoteNo,
    data.name,
    data.address,
    data.taxId,
    data.contact,
    data.dimensions,
    data.steel,
    data.tiers,
    data.door,
    data.color,
    data.weight,
    data.shipping,
    data.total,
    data.seller,
    data.owner || "guest",
    data.status || "รอชำระมัดจำ",
    new Date().toISOString(),
    printUrlFormula
  ];
  
  // Check if exists to update, else append
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1].toString() === quoteNo) {
      sheet.getRange(i + 1, 1, 1, record.length).setValues([record]);
      return { status: "success", message: "อัปเดตข้อมูลสำเร็จ (V3)" };
    }
  }
  
  sheet.appendRow(record);
  return { status: "success", message: "บันทึกข้อมูลใบเสนอราคาสำเร็จ (V3)" };
}

function getQuotations(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Quotations");
  var rows = sheet.getDataRange().getValues();
  var username = data.username.trim().toLowerCase();
  var role = data.role;
  var list = [];
  
  var headers = rows[0];
  for (var i = 1; i < rows.length; i++) {
    var owner = rows[i][15].toString().toLowerCase();
    
    // Admins see everything, customers only see their own
    if (role === "admin" || owner === username) {
      var item = {};
      for (var j = 0; j < headers.length; j++) {
        item[headers[j]] = rows[i][j];
      }
      list.push(item);
    }
  }
  
  // Sort descending by date/updated
  list.reverse();
  
  return { status: "success", data: list };
}

function updateQuotationStatus(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Quotations");
  var range = sheet.getDataRange();
  var rows = range.getValues();
  var quoteNo = data.quoteNo.trim();
  var newStatus = data.status;
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1].toString() === quoteNo) {
      sheet.getRange(i + 1, 17).setValue(newStatus); // Column Q is Status
      sheet.getRange(i + 1, 18).setValue(new Date().toISOString()); // Column R is UpdatedAt
      return { status: "success", message: "อัปเดตสถานะสำเร็จ" };
    }
  }
  return { status: "error", message: "ไม่พบข้อมูลใบเสนอราคานี้" };
}

function getUsers(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var list = [];
  
  for (var i = 1; i < rows.length; i++) {
    // Exclude PasswordHash (column index 1)
    var user = {
      username: rows[i][0] ? rows[i][0].toString() : "",
      role: rows[i][2] ? rows[i][2].toString() : "",
      name: rows[i][3] ? rows[i][3].toString() : "",
      address: rows[i][4] ? rows[i][4].toString() : "",
      taxId: rows[i][5] ? rows[i][5].toString() : "",
      phone: rows[i][6] ? rows[i][6].toString() : "",
      createdAt: rows[i][7] ? rows[i][7].toString() : ""
    };
    list.push(user);
  }
  return { status: "success", data: list };
}

function getProducts(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Products");
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var list = [];
  
  var idxId = headers.indexOf("ProductId");
  var idxCat = headers.indexOf("Category");
  var idxName = headers.indexOf("Name");
  var idxPrice = headers.indexOf("Price");
  var idxDetails = headers.indexOf("Details");
  var idxBadge = headers.indexOf("Badge");
  var idxImg = headers.indexOf("Image");
  var idxStock = headers.indexOf("Stock");
  var idxBarcode = headers.indexOf("Barcode");
  var idxCreated = headers.indexOf("CreatedAt");
  var idxUpdated = headers.indexOf("UpdatedAt");
  
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var item = {
      id: idxId !== -1 ? row[idxId].toString() : "",
      category: idxCat !== -1 ? row[idxCat].toString() : "",
      title: idxName !== -1 ? row[idxName].toString() : "",
      price: idxPrice !== -1 ? row[idxPrice].toString() : "",
      sold: idxDetails !== -1 ? row[idxDetails].toString() : "",
      badge: idxBadge !== -1 ? row[idxBadge].toString() : "",
      image: idxImg !== -1 ? row[idxImg].toString() : "",
      stock: idxStock !== -1 ? parseInt(row[idxStock]) || 0 : 0,
      barcode: idxBarcode !== -1 ? row[idxBarcode].toString() : "",
      createdAt: idxCreated !== -1 ? row[idxCreated].toString() : "",
      updatedAt: idxUpdated !== -1 ? row[idxUpdated].toString() : ""
    };
    list.push(item);
  }
  return { status: "success", data: list };
}

function saveProduct(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Products");
  var range = sheet.getDataRange();
  var rows = range.getValues();
  var productId = data.id.trim();
  
  var now = new Date().toISOString();
  
  var rowIndex = -1;
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0].toString() === productId) {
      rowIndex = i + 1;
      break;
    }
  }
  
  var targetRow = rowIndex === -1 ? rows.length + 1 : rowIndex;
  var barcodeFormula = '=IMAGE("https://barcode.tec-it.com/barcode.ashx?data=' + encodeURIComponent(productId) + '&code=Code128&multiplebarcodes=false")';
  
  var record = [
    productId,
    data.category || "",
    data.title || "",
    data.price || "",
    data.sold || "",
    data.badge || "",
    data.image || "",
    parseInt(data.stock) || 0,
    barcodeFormula,
    rowIndex === -1 ? now : rows[rowIndex - 1][9].toString(),
    now
  ];
  
  if (rowIndex !== -1) {
    sheet.getRange(rowIndex, 1, 1, record.length).setValues([record]);
    return { status: "success", message: "อัปเดตข้อมูลสินค้าสำเร็จ" };
  } else {
    sheet.appendRow(record);
    return { status: "success", message: "เพิ่มข้อมูลสินค้าสำเร็จ" };
  }
}

function deleteProduct(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Products");
  var rows = sheet.getDataRange().getValues();
  var productId = data.id.trim();
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0].toString() === productId) {
      sheet.deleteRow(i + 1);
      return { status: "success", message: "ลบข้อมูลสินค้าสำเร็จ" };
    }
  }
  return { status: "error", message: "ไม่พบข้อมูลสินค้านี้" };
}

// Auto-initialize when opening the sheet or running manual trigger
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("ระบบหลังร้าน")
      .addItem("🔄 ซิงค์และสร้างชีทสินค้า", "initDatabaseMenu")
      .addToUi();
  } catch(e) {}
  
  // Silently run auto-init
  initDatabaseMenu();
}

function initDatabaseMenu() {
  getOrCreateSheet("Users", ["Username", "PasswordHash", "Role", "Name", "Address", "TaxId", "Phone", "CreatedAt"]);
  getOrCreateSheet("Quotations", ["Date", "QuoteNo", "CustomerName", "Address", "TaxId", "Contact", "Dimensions", "Steel", "Tiers", "Door", "Color", "Weight", "Shipping", "Total", "Seller", "Owner", "Status", "UpdatedAt", "PrintUrl"]);
  getOrCreateSheet("Products", ["ProductId", "Category", "Name", "Price", "Details", "Badge", "Image", "Stock", "Barcode", "CreatedAt", "UpdatedAt"]);
}

