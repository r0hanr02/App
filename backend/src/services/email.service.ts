import { Resend } from "resend";

const getFrontendUrl = (): string => {
  const raw = process.env.FRONTEND_URL;

  if (Array.isArray(raw)) return raw[0] ?? "http://localhost:5173";
  if (typeof raw === "string" && raw.trim()) return raw.trim();

  return "http://localhost:5173";
};

const getClient = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not defined. Please set it in your .env file",
    );
  }

  return new Resend(apiKey);
};

export const buildPasswordResetLink = (token: string): string =>
  `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;

//future Update
export async function sendEmail(email: string, token: string) {
  const resend = getClient();
  const resetLink = buildPasswordResetLink(token);

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Password Reset Request</h2>

        <p>We received a request to reset your password.</p>

        <p>Click the button below to choose a new password:</p>

        <p style="margin: 24px 0;">
          <a
            href="${resetLink}"
            style="display: inline-block; padding: 12px 20px;
                   background-color: #007bff; color: #ffffff;
                   text-decoration: none; border-radius: 5px;"
          >
            Reset Password
          </a>
        </p>

        <p>If you did not request a password reset, you can safely
        ignore this email.</p>

        <p>This link will expire shortly. For your security,
        do not share it with anyone.</p>
      </div>
    `,
  });

  if (error) {
    console.log(`Failed to send password reset email: ${error}`);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }

  return data;
}
