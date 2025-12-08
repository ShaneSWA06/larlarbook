import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  to: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // If no API key is set, log and return success for development
    if (!process.env.RESEND_API_KEY) {
      console.log(`[Email] Verification code for ${to}: ${code}`);
      console.log(
        "[Email] RESEND_API_KEY not set - email not sent (development mode)"
      );
      return { success: true };
    }

    // Determine the "from" email address
    // Resend doesn't allow sending from Gmail/Yahoo/Hotmail/Outlook domains
    // Use Resend's default domain for testing, or your own verified domain
    let fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    
    // Check if trying to use a common email provider (which can't be verified)
    const commonProviders = ["@gmail.com", "@yahoo.com", "@hotmail.com", "@outlook.com"];
    const isCommonProvider = commonProviders.some(provider => fromEmail.includes(provider));
    
    if (isCommonProvider) {
      console.warn(`[Email] Cannot send from ${fromEmail} (unverified domain). Using Resend default domain.`);
      console.warn("[Email] To use a custom domain, verify it at https://resend.com/domains");
      fromEmail = "onboarding@resend.dev";
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: "Your LarLar Books 2FA Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #67377e;">LarLar Books - 2FA Verification</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #67377e; color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
