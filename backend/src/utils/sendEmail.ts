import nodemailer from "nodemailer";

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

export const sendEmail = async ({ to, subject, text, html }: EmailOptions): Promise<void> => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

    if (!SMTP_HOST) {
        // printing would put reset links in the server logs, so production must have a real account
        if (process.env.NODE_ENV === "production") {
            throw new Error("SMTP_HOST is missing from .env");
        }

        // no email account yet: print it, so the flow can still be tested locally
        console.log(`\n--- Email not sent, SMTP is not set up ---\nTo: ${to}\nSubject: ${subject}\n\n${text}\n---\n`);
        return;
    }

    const port = Number(SMTP_PORT) || 587;

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({ from: EMAIL_FROM || SMTP_USER, to, subject, text, html });
};
