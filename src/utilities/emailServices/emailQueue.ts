import Bull from "bull";
import { sendEmail } from "./emailSender";
import configurations from "../../configurations";

const MAX_RETRIES = 3;
const BACKOFF_DELAY = 5000; // 5 seconds between retries

// ── Queue setup ──────────────────────────────────────────────────────────────
export const emailQueue = new Bull<any>("email-queue", {
  redis: {
    host: configurations.REDIS_HOST,
    port: Number(configurations.REDIS_PORT),
    // password: configurations.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: MAX_RETRIES,
    backoff: {
      type: "exponential",
      delay: BACKOFF_DELAY,
    },
    removeOnComplete: true,
    removeOnFail: false, // keep failed jobs for inspection
  },
});

// ── Worker: process jobs ─────────────────────────────────────────────────────
emailQueue.process(async (job) => {
  const { to, subject, htmlbody, htmlBody } = job.data;
  const html = htmlbody || htmlBody;

  console.log(
    `[EmailQueue] Sending "${subject}" to ${to} (attempt ${job.attemptsMade + 1})`,
  );

  await sendEmail({ to, subject, htmlBody:html });

  console.log(`[EmailQueue] ✓ Sent "${subject}" to ${to}`);
});

// ── On failure: notify admin ─────────────────────────────────────────────────
emailQueue.on("failed", async (job, err) => {
  const isFinalAttempt = job.attemptsMade >= MAX_RETRIES;

  if (isFinalAttempt) {
    console.error(
      `[EmailQueue] ✗ Permanently failed: "${job.data.subject}" to ${job.data.to}`,
      err,
    );

    // Fire alert email to admin
    try {
      await sendEmail({
        to: configurations.ADMIN_EMAIL!,
        subject: `⚠️ Email Delivery Failed: "${job.data.subject}"`,
        htmlBody: `
          <h2>Email Delivery Failure Alert</h2>
          <p><strong>Recipient:</strong> ${job.data.to}</p>
          <p><strong>Subject:</strong> ${job.data.subject}</p>
          <p><strong>Attempts:</strong> ${job.attemptsMade}</p>
          <p><strong>Error:</strong> ${err.message}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Job ID:</strong> ${job.id}</p>
        `,
      });
    } catch (adminErr) {
      // Log but don't throw — don't cause an infinite loop
      console.error("[EmailQueue] Failed to notify admin:", adminErr);
    }
  }
});

emailQueue.on("completed", (job) => {
  console.log(`[EmailQueue] ✓ Job ${job.id} completed`);
});

// ── Helper: add email to queue ────────────────────────────────────────────────
export async function queueEmail(payload: any): Promise<void> {
  await emailQueue.add(payload, {
    priority: 1,
  });
  console.log(`[EmailQueue] Queued email to ${payload.to}`);
}
