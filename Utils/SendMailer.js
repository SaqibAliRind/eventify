import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.Gmailuser,
        pass: process.env.Gmailpassword,
    },
});

export const sendMail = async ({ to, subject, text, html }) => {
    try {
        if (!process.env.Gmailuser || !process.env.Gmailpassword) {
            console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
            return { messageId: "mock-" + Date.now() };
        }

        const info = await transporter.sendMail({
            from: `"Eventify Concierge" <${process.env.Gmailuser}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("Email send error (non-fatal):", error.message);
        // Failures must never crash the request; log them.
        return null;
    }
};

/**
 * 1. Client confirmation on consultation submission
 */
export const sendConsultationConfirmationEmail = async ({ to, name, eventType, eventDate }) => {
    const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString() : "To be decided";
    const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 26px;">Eventify</h1>
            <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 14px;">Bespoke Luxury Event Planning</p>
        </div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #111827; margin: 0 0 10px 0; font-size: 18px;">Thank You, ${name}!</h2>
            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">
                We have received your inquiry for <strong>${eventType}</strong> scheduled for <strong>${formattedDate}</strong>.
                Our concierge team is already reviewing your details and will connect with you within 24 hours.
            </p>
        </div>
        <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 30px;">
            © ${new Date().getFullYear()} Eventify Experiences. All rights reserved.
        </p>
    </div>
    `;

    return sendMail({
        to,
        subject: `Your Inquiry for ${eventType} - Eventify Confirmation`,
        text: `Hi ${name}, thank you for contacting Eventify. We have received your inquiry for ${eventType} and will be in touch shortly.`,
        html,
    });
};

/**
 * 2. Admin alert for new consultation lead
 */
export const sendAdminConsultationAlertEmail = async ({ name, email, phone, eventType, eventDate, message }) => {
    const adminEmail = process.env.Gmailuser || "admin@eventify.com";
    const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString() : "Not specified";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-top: 0;">🛎️ New Event Inquiry Submitted</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr><td style="padding: 8px; font-weight: bold; width: 35%;">Client:</td><td style="padding: 8px;">${name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${phone}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Event Type:</td><td style="padding: 8px;">${eventType}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Date:</td><td style="padding: 8px;">${formattedDate}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; vertical-align: top;">Message:</td><td style="padding: 8px; background: #f3f4f6; border-radius: 4px;">${message}</td></tr>
        </table>
        <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">Log in to the Admin Command Center to update the lead status.</p>
    </div>
    `;

    return sendMail({
        to: adminEmail,
        subject: `[New Lead] ${eventType} inquiry from ${name}`,
        text: `New Lead: ${name} (${email}, ${phone}) submitted inquiry for ${eventType}: "${message}"`,
        html,
    });
};

/**
 * 3. Client update when consultation status changes
 */
export const sendConsultationStatusUpdateEmail = async ({ to, name, status, adminNotes }) => {
    const statusColors = {
        Pending: "#f59e0b",
        Contacted: "#3b82f6",
        Resolved: "#10b981",
    };
    const badgeColor = statusColors[status] || "#6b7280";

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #111827; margin-top: 0;">Update Regarding Your Event Inquiry</h2>
        <p style="color: #374151; font-size: 15px;">Dear ${name},</p>
        <p style="color: #374151; font-size: 15px;">
            The status of your consultation inquiry has been updated to:
        </p>
        <div style="margin: 15px 0;">
            <span style="display: inline-block; background-color: ${badgeColor}; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                ${status}
            </span>
        </div>
        ${adminNotes ? `
        <div style="background-color: #f9fafb; border-left: 4px solid ${badgeColor}; padding: 12px 16px; margin: 15px 0;">
            <strong style="color: #111827;">Message from Concierge:</strong>
            <p style="color: #4b5563; margin: 4px 0 0 0;">${adminNotes}</p>
        </div>` : ""}
        <p style="color: #6b7280; font-size: 13px; margin-top: 25px;">
            You can view your inquiries in your <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-inquiries" style="color: #4f46e5;">My Inquiries</a> dashboard.
        </p>
    </div>
    `;

    return sendMail({
        to,
        subject: `Update on your Eventify Inquiry (${status})`,
        text: `Hi ${name}, your inquiry status is now: ${status}. ${adminNotes ? 'Note: ' + adminNotes : ''}`,
        html,
    });
};

/**
 * 4. Offline chat email notification to admin (Phase 4 item 3)
 */
let lastChatEmailTime = 0;
export const sendAdminOfflineChatNotification = async ({ sender, message }) => {
    // Rate limit notifications to once every 5 minutes to avoid spamming
    const now = Date.now();
    if (now - lastChatEmailTime < 5 * 60 * 1000) {
        return null;
    }
    lastChatEmailTime = now;

    const adminEmail = process.env.Gmailuser || "admin@eventify.com";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="color: #ef4444; margin-top: 0;">💬 Visitor Message While Offline</h3>
        <p>A visitor has sent a live support message while no concierge was active:</p>
        <p><strong>From:</strong> ${sender}</p>
        <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; font-style: italic;">
            "${message}"
        </div>
        <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
            Reply to the visitor via the Eventify Admin Live Chat Center.
        </p>
    </div>
    `;

    return sendMail({
        to: adminEmail,
        subject: `[Live Chat Alert] Message from ${sender} while offline`,
        text: `Visitor ${sender} sent a message while no admin was online: "${message}"`,
        html,
    });
};
