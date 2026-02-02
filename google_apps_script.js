// GOOGLE APPS SCRIPT CODE
// 1. Open your Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Delete existing code and PASTE this entire file
// 4. Click 'Deploy' > 'New deployment'
// 5. Select type: 'Web app'
// 6. Description: 'Monocle Backend'
// 7. Execute as: 'Me' (your email)
// 8. Who has access: 'Anyone' (IMPORTANT!)
// 9. Click 'Deploy' and authorize access.
// 10. Copy the 'Web app URL' and give it to the developer/paste in events.js

const SHEET_NAME = "Registrations";

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const sheet = getSheet();

        // Parse the incoming data
        // We expect data sent as text/plain JSON to avoid CORS preflight issues
        const data = JSON.parse(e.postData.contents);

        // Prepare row data
        // Columns: Timestamp, Name, Email, Phone, College, RegNo, Events, Amount, TransactionID (if any)
        const newRow = [
            new Date(),                // Timestamp
            data.name,                 // Full Name
            data.email,                // Email
            data.phone,                // Phone
            data.college,              // College
            data.regNo || "NA",       // Reg No
            data.events,              // Selected Events (Comma separated)
            data.amount,               // Total Amount
            data.paymentId || "Pending" // Payment/UPI Ref
        ];

        // Append to sheet
        sheet.appendRow(newRow);

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "success", "row": sheet.getLastRow() }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": e.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function getSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAME);
        // Add headers if new sheet
        sheet.appendRow(["Timestamp", "Full Name", "Email", "Phone", "College", "Reg No", "Events", "Amount", "Payment/Ref ID"]);
        // Freeze header
        sheet.setFrozenRows(1);
    }
    return sheet;
}

// Helper to test if script works by running 'setup' manually in editor
function setup() {
    const sheet = getSheet();
    Logger.log("Sheet Setup Complete: " + sheet.getName());
}
