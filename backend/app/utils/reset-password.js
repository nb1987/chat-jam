import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. https://resend.com/domains 2. click "Add Domain"
export async function sendPasswordResetEmail(email, username, resetLink) {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // temp for dev
      to: email,
      subject: "ChatJam Password Reset Request",
      html: `
        <p>Hello ${username},</p>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    return response;
  } catch (err) {
    console.error("Failed to send reset email:", err);
    throw err;
  }
}
