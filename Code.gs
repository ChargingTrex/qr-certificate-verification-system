// ================= CONFIG =================
const SECRET_KEY   = "CHANGE_THIS_TO_A_LONG_RANDOM_STRING";
const PART_SHEET   = "PART";
const OC_SHEET     = "OC";
const COLLEGE_LOGO = "https://your-college-logo-url.png";
const CLUB_LOGO    = "https://your-club-logo-url.png";
// ==========================================


// ===== GENERATE SECURE TOKEN =====
function generateToken(certId) {
  const signature = Utilities.computeHmacSha256Signature(
    certId,
    SECRET_KEY
  );

  const encodedSignature = Utilities.base64Encode(signature);

  const token = Utilities.base64Encode(certId + "." + encodedSignature);

  return token;
}


// ===== PROCESS ANY SHEET =====
function processSheet(sheetName) {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const lastRow = sheet.getLastRow();

  // Set headers
  sheet.getRange(1, 7).setValue("Token");
  sheet.getRange(1, 8).setValue("QR");

  const scriptUrl = "YOUR_WEB_APP_URL_HERE";

  for (let i = 2; i <= lastRow; i++) {

    const certId = sheet.getRange(i, 1).getValue();
    if (!certId) continue;

    const token = generateToken(certId);

    // Write Token
    sheet.getRange(i, 7).setValue(token);

    // Write QR formula
    const qrFormula =
      `=IMAGE("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${scriptUrl}?token=${token}")`;

    sheet.getRange(i, 8).setFormula(qrFormula);
  }
}


// ===== RUN FOR BOTH TABLES =====
function generateAllQRs() {
  processSheet(PART_SHEET);
  processSheet(OC_SHEET);
}
function verifyToken(token) {
  try {
    const decoded = Utilities.newBlob(
      Utilities.base64Decode(token)
    ).getDataAsString();

    const parts = decoded.split(".");
    const certId = parts[0];
    const signature = parts[1];

    const expectedSignature = Utilities.base64Encode(
      Utilities.computeHmacSha256Signature(certId, SECRET_KEY)
    );

    if (signature === expectedSignature) {
      return certId;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

function doGet(e) {

  const token = e.parameter.token;
  if (!token) {
    return HtmlService.createHtmlOutput("Invalid Request");
  }


  const certId = verifyToken(token);
  if (!certId) {
    return HtmlService.createHtmlOutput(`
      <h2 style="color:red;text-align:center;">
      ❌ Invalid or Tampered Certificate
      </h2>
    `);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ["PART", "OC"];

  for (let s = 0; s < sheets.length; s++) {

    const sheet = ss.getSheetByName(sheets[s]);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      Logger.log("Sheet ID: " + data[i][0]);
      Logger.log("Token ID: " + certId);
      if (data[i][0] == certId)  {

        const typeBadge = sheets[s] === "OC"
          ? "Organising Committee"
          : "Participation";

        return HtmlService.createHtmlOutput(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Segoe UI', Arial, sans-serif;
    background: #f1f4f8;
  }

  .header {
    background: linear-gradient(90deg, #002147, #004080);
    padding: 20px 30px;
    color: white;
  }

  .logo-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1000px;
    margin: auto;
  }

  .college-logo { height: 70px; }
  .club-logo    { height: 60px; }

  .title { text-align: center; }
  .title h2 { margin: 0; font-size: 22px; }
  .title p  { margin: 5px 0 0; font-size: 14px; opacity: 0.9; }

  .container {
    padding: 40px 20px;
    text-align: center;
  }

  .card {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.08);
    display: inline-block;
    width: 90%;
    max-width: 520px;
    text-align: left;
  }

  .valid {
    color: #0f9d58;
    font-size: 22px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
  }

  /* ── Highlighted hero section ── */
  .highlight-block {
    background: #f0f7ff;
    border-left: 5px solid #004080;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 20px;
  }

  .highlight-block .hero-name {
    font-size: 20px;
    font-weight: 700;
    color: #002147;
    margin: 0 0 8px;
  }

  .highlight-block .hero-row {
    display: flex;
    gap: 30px;
    flex-wrap: wrap;
  }

  .highlight-block .hero-item {
    display: flex;
    flex-direction: column;
  }

  .highlight-block .hero-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #888;
    margin-bottom: 2px;
  }

  .highlight-block .hero-value {
    font-size: 15px;
    font-weight: 600;
    color: #222;
  }

  /* ── Divider ── */
  .divider {
    border: none;
    border-top: 1px solid #eee;
    margin: 18px 0;
  }

  /* ── Remaining details ── */
  .info p {
    margin: 8px 0;
    font-size: 14px;
    color: #444;
  }

  .info p strong {
    color: #002147;
    min-width: 120px;
    display: inline-block;
  }

  /* ── Category badge ── */
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    background: #e8f5e9;
    color: #1b7c3d;
  }

  .footer {
    margin-top: 40px;
    font-size: 12px;
    color: #aaa;
    text-align: center;
  }
</style>
</head>

<body>

<div class="header">
  <div class="logo-section">
    <img src="${COLLEGE_LOGO}" class="college-logo">
    <div class="title">
      <h2>Certificate Verification Portal</h2>
      <p>Official Digital Certificate Authentication System</p>
    </div>
    <img src="${CLUB_LOGO}" class="club-logo">
  </div>
</div>

<div class="container">
  <div class="card">

    <div class="valid">✅ Certificate Verified</div>

    <!-- ── Highlighted: Name, PRN, Academic Year ── -->
    <div class="highlight-block">
      <p class="hero-name">${data[i][1]}</p>
      <div class="hero-row">
        <div class="hero-item">
          <span class="hero-label">PRN</span>
          <span class="hero-value">${data[i][2]}</span>
        </div>
        <div class="hero-item">
          <span class="hero-label">Academic Year</span>
          <span class="hero-value">${data[i][4]}</span>
        </div>
      </div>
    </div>

    <hr class="divider">

    <!-- ── Other details ── -->
    <div class="info">
      <!--<p><strong>Certificate ID:</strong> ${data[i][0]}</p>-->
      <p><strong>Email:</strong> ${data[i][3]}</p>
      <p><strong>Event:</strong> ${data[i][5]}</p>
      <p><strong>Category:</strong> <span class="badge">${typeBadge}</span></p>
    </div>

  </div>

  <div class="footer">
    © 2026 Your College Name. All Rights Reserved.
  </div>
</div>

</body>
</html>
`);
      }
    }
  }

  return HtmlService.createHtmlOutput(`
  <h2 style="color:red;text-align:center;">
  ❌ Certificate Not Found
  </h2>
  `);
}