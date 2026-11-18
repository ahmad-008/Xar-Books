import { NextRequest, NextResponse } from "next/server";
import { AppError } from "../utils/AppError";
import { readJson } from "../utils/http";
import { clientIp, rateLimit } from "../utils/rateLimit";
import { sendEmail } from "../utils/sendEmail";

const escapeHtml = (text: string) =>
    text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

export const sendContactMessage = async (req: NextRequest) => {
    const { name, email, subject, message } = await readJson(req);

    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 50) {
        throw new AppError("Name must be 2 to 50 characters", 400);
    }

    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim()) || email.length > 100) {
        throw new AppError("Enter a valid email", 400);
    }

    if (subject !== undefined && (typeof subject !== "string" || subject.trim().length > 100)) {
        throw new AppError("Subject must be 100 characters or less", 400);
    }

    if (typeof message !== "string" || message.trim().length < 10 || message.trim().length > 2000) {
        throw new AppError("Message must be 10 to 2000 characters", 400);
    }

    await rateLimit(`contact:${clientIp(req)}`, 3, 60);

    const inbox = process.env.EMAIL_USER;
    if (!inbox) {
        throw new AppError("Messages can't be sent right now, please try again later", 500);
    }

    const cleanSubject = subject?.trim().replace(/[\r\n]+/g, " ") || "New message";

    try {
        await sendEmail(
            inbox,
            `Contact form: ${cleanSubject}`,
            `<p><strong>From:</strong> ${escapeHtml(name.trim())} (${escapeHtml(email.trim())})</p>
             <p><strong>Subject:</strong> ${escapeHtml(cleanSubject)}</p>
             <p style="white-space: pre-wrap">${escapeHtml(message.trim())}</p>`,
            email.trim()
        );
    } catch (error) {
        console.error("Contact email failed:", error);
        throw new AppError("Could not send your message, please try again later", 500);
    }

    return NextResponse.json({ success: true, message: "Thanks! We'll get back to you within 2 working days" });
};
