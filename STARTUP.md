# 🚀 Startup & Deployment Guide

Follow these steps to deploy the **QR Certificate Verification System** to your own Google Workspace. No server or hosting required.

---

## 📋 Prerequisites

Before you begin, make sure you have:

- A **Google Account** with access to Google Sheets and Google Drive
- The `Code.gs` file from this repository
- Your **College Logo** and **Club Logo** hosted as public image URLs

> 💡 **Tip:** Upload images to Google Drive → Right-click → Get Link → set to *"Anyone with the link"*

---

## Step 1: Prepare the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet.
2. At the bottom, create **two tabs** and name them exactly:
   - `PART` — for Participation certificates
   - `OC` — for Organising Committee certificates

   > ⚠️ Names are case-sensitive. `part` or `Part` will **not** work.

3. In **both** sheets, set up the column headers in **Row 1** exactly in this order:

   | Column | Header |
   |--------|--------|
   | A | ID |
   | B | Name |
   | C | PRN |
   | D | Email ID |
   | E | Academic Year |
   | F | Event |

   > Leave **Columns G and H** empty — the script will auto-populate them with Token and QR.

---

## Step 2: Add the Script

1. Open your Google Sheet.
2. Go to **Extensions → Apps Script** from the top menu.
3. Delete any existing code in the `Code.gs` file.
4. Copy and paste the entire contents of `Code.gs` from this repository into the editor.
5. Save the file with `Ctrl + S` (Windows) or `Cmd + S` (Mac).

---

## Step 3: Configure Your Variables

At the very top of the script, update the `CONFIG` section with your own values:

```js
// ================= CONFIG =================
const SECRET_KEY   = "CHANGE_THIS_TO_A_LONG_RANDOM_STRING";
const PART_SHEET   = "PART";
const OC_SHEET     = "OC";
const COLLEGE_LOGO = "https://your-college-logo-url.png";
const CLUB_LOGO    = "https://your-club-logo-url.png";
// ==========================================
```

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | A long, random secret string used to sign tokens. **Keep this private.** |
| `PART_SHEET` | Name of the Participation sheet tab (default: `PART`) |
| `OC_SHEET` | Name of the OC sheet tab (default: `OC`) |
| `COLLEGE_LOGO` | Public URL to your college logo image |
| `CLUB_LOGO` | Public URL to your club logo image |

> 🔒 **Security Tip:** For production, store your secret in Script Properties instead of hardcoding it:
> 1. Go to **Project Settings → Script Properties → Add Property**
> 2. Key: `SECRET_KEY` | Value: your secret string
> 3. Replace the hardcoded value in the script with:
> ```js
> const SECRET_KEY = PropertiesService.getScriptProperties().getProperty("SECRET_KEY");
> ```

---

## Step 4: Deploy as a Web App *(First Pass)*

You need to deploy the app first to get your official Web App URL.

1. Click the blue **Deploy** button → **New Deployment**
2. Click the ⚙️ **gear icon** next to Type and select **Web App**
3. Fill in the settings:
   - **Execute as:** `Me` *(your Google account)*
   - **Who has access:** `Anyone`
4. Click **Deploy**
5. **Authorize** the script when prompted — click *Review Permissions → Allow*
6. Copy the **Web App URL** that appears — you'll need it in the next step

> 📌 The URL will look like:
> `https://script.google.com/macros/s/AKfycb.../exec`

---

## Step 5: Update the Script URL

1. Go back to the **Apps Script editor**
2. Find the `processSheet(sheetName)` function
3. Paste your copied Web App URL into the `scriptUrl` variable:

```js
const scriptUrl = "YOUR_WEB_APP_URL_HERE";
```

4. Save the script with `Ctrl + S` (Windows) or `Cmd + S` (Mac)

---

## Step 6: Generate Tokens & QR Codes

1. In the Apps Script editor, look at the **toolbar at the top**
2. Click the **function dropdown** (next to the ▶ Run and 🐞 Debug buttons)
3. Select `generateAllQRs` from the list
4. Click **▶ Run**
5. Grant any additional permissions if prompted

✅ Go back to your Google Sheet — **Column G** will now have signed tokens and **Column H** will display QR code images for every row.

---

## Step 7: Final Deployment Update

Because you changed the `scriptUrl` in the code after the first deployment, you must push a new version so the QR codes point to the correct, updated script.

1. Click **Deploy → Manage Deployments**
2. Click the ✏️ **pencil (Edit)** icon on your existing deployment
3. Under **Version**, select **New Version**
4. Click **Deploy**

---

## 🎉 You're Live!

Scan any of the QR codes in your spreadsheet with your phone to test the verification portal. You should see the **✅ Certificate Verified** page with the student's full details.

You can also test it manually in a browser:
```
https://YOUR_WEB_APP_URL/exec?token=PASTE_TOKEN_FROM_COLUMN_G
```

---

## 🔁 Updating Data Later

Whenever you add new rows or change existing data:

1. Fill in the new rows in your sheet
2. Run `generateAllQRs()` again from the editor
3. Tokens and QR codes will be regenerated for all rows
4. No redeployment needed unless you changed the script code itself

---

## ❓ Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `TypeError: Cannot read properties of undefined (reading 'parameter')` | Running `doGet` directly from the editor | Use `testDoGet()` instead, or test via the Web App URL |
| `❌ Certificate Not Found` | Token doesn't match any row ID | Make sure the ID in Column A exactly matches what was used to generate the token |
| `❌ Invalid or Tampered Certificate` | Token was modified or wrong `SECRET_KEY` | Regenerate QR codes with `generateAllQRs()` |
| QR column shows `#ERROR!` | Image URL is malformed | Check that `scriptUrl` is correctly set and rerun `generateAllQRs()` |
| Logos not showing on verification page | Logo URLs are not publicly accessible | Set Google Drive sharing to *"Anyone with the link"* |

---

## 📞 Support

For issues specific to this deployment, open an issue on the [GitHub repository](../../issues).