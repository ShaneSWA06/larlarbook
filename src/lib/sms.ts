import twilio from "twilio";

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendVerificationSMS(
  to: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // If no credentials are set, log and return success for development
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log(`[SMS] Verification code for ${to}: ${code}`);
      console.log(
        "[SMS] Twilio credentials not set - SMS not sent (development mode)"
      );
      return { success: true };
    }

    const message = await twilioClient.messages.create({
      body: `Your LarLar Books verification code is: ${code}. This code expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    return { success: true };
  } catch (error) {
    console.error("SMS send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send SMS",
    };
  }
}
