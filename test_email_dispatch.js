import { 
    sendMail, 
    sendConsultationConfirmationEmail, 
    sendAdminConsultationAlertEmail, 
    sendConsultationStatusUpdateEmail 
} from "./Utils/SendMailer.js";
import dotenv from "dotenv";

dotenv.config();

const targetInbox = process.argv[2] || process.env.Gmailuser || "test.recipient@example.com";

async function testEmailSuite() {
    console.log("==========================================================================");
    console.log(`         TRANSACTIONAL EMAIL SUITE: TESTING TO ${targetInbox}             `);
    console.log("==========================================================================\n");

    console.log("1. Sending Registration Verification OTP Email...");
    const otpRes = await sendMail({
        to: targetInbox,
        subject: "Verify Your Eventify Account - Code: 849201",
        text: "Your Eventify verification code is 849201. It will expire in 10 minutes.",
        html: `<h2>Welcome to Eventify</h2><p>Your verification code is: <strong>849201</strong></p>`
    });
    console.log("-> Result:", otpRes ? `Sent (ID: ${otpRes.messageId})` : "Failed/Mocked");

    console.log("\n2. Sending Inquiry Confirmation Email...");
    const inquiryConfRes = await sendConsultationConfirmationEmail({
        to: targetInbox,
        name: "Test VIP Guest",
        eventType: "Metropolitan Charity Ball",
        eventDate: "2026-11-25"
    });
    console.log("-> Result:", inquiryConfRes ? `Sent (ID: ${inquiryConfRes.messageId})` : "Failed/Mocked");

    console.log("\n3. Sending Admin Alert Email for New Lead...");
    const adminAlertRes = await sendAdminConsultationAlertEmail({
        name: "Test VIP Guest",
        email: targetInbox,
        phone: "+1 555-0199",
        eventType: "Metropolitan Charity Ball",
        eventDate: "2026-11-25",
        message: "Looking for an opulent ballroom banquet with custom floral archways."
    });
    console.log("-> Result:", adminAlertRes ? `Sent (ID: ${adminAlertRes.messageId})` : "Failed/Mocked");

    console.log("\n4. Sending Status Progression Email (Contacted -> Confirmed)...");
    const statusRes = await sendConsultationStatusUpdateEmail({
        to: targetInbox,
        name: "Test VIP Guest",
        eventType: "Metropolitan Charity Ball",
        newStatus: "Confirmed"
    });
    console.log("-> Result:", statusRes ? `Sent (ID: ${statusRes.messageId})` : "Failed/Mocked");

    console.log("\n==========================================================================");
    console.log("                    EMAIL SUITE DISPATCH COMPLETE                         ");
    console.log("==========================================================================");
}

testEmailSuite().catch(console.error);
