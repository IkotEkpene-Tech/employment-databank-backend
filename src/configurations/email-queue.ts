import Bull from "bull";
import { sendEmail } from "./email";
import configurations from ".";

const MAX_RETRIES = 3;
const BACKOFF_DELAY = 5000; // 5 seconds between retries

const isRedisConfigured = Boolean(configurations.REDIS_URL);

if (!isRedisConfigured) {
  console.warn(
    "[EmailQueue] REDIS_URL is not set — " +
      "emails will be sent immediately with no retry/backoff instead of being queued. " +
      "Set it to enable the retry queue.",
  );
}

// ── Queue setup (only when Redis is actually configured) ────────────────────
export const emailQueue = isRedisConfigured
  ? new Bull<any>("email-queue", configurations.REDIS_URL!, {
      defaultJobOptions: {
        attempts: MAX_RETRIES,
        backoff: {
          type: "exponential",
          delay: BACKOFF_DELAY,
        },
        removeOnComplete: true,
        removeOnFail: { count: 100, age: 7 * 24 * 3600 },
      },
    })
  : null;

if (emailQueue) {
  // ── Worker: process jobs ───────────────────────────────────────────────────
  emailQueue.process(async (job) => {
    const { to, subject, htmlbody, htmlBody } = job.data;
    const html = htmlbody || htmlBody;

    console.log(
      `[EmailQueue] Sending "${subject}" to ${to} (attempt ${job.attemptsMade + 1})`,
    );

    await sendEmail({ to, subject, htmlBody: html });

    console.log(`[EmailQueue] ✓ Sent "${subject}" to ${to}`);
  });

  // ── On failure: notify admin ───────────────────────────────────────────────
  emailQueue.on("failed", async (job, err) => {
    const isFinalAttempt = job.attemptsMade >= MAX_RETRIES;

    if (isFinalAttempt) {
      console.error(
        `[EmailQueue] ✗ Permanently failed: "${job.data.subject}" to ${job.data.to}`,
        err,
      );

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
        console.error("[EmailQueue] Failed to notify admin:", adminErr);
      }
    }
  });

  emailQueue.on("completed", (job) => {
    console.log(`[EmailQueue] ✓ Job ${job.id} completed`);
  });

  emailQueue.on("error", (err) => {
    // Bull/ioredis connection errors land here — log, don't crash.
    console.error("[EmailQueue] Redis connection error:", err.message);
  });
}

// ── Helper: add email to queue ────────────────────────────────────────────────
export async function queueEmail(payload: any): Promise<void> {
  if (!emailQueue) {
    // No queue configured — best-effort direct send, no retry/backoff.
    try {
      await sendEmail({
        to: payload.to,
        subject: payload.subject,
        htmlBody: payload.htmlbody || payload.htmlBody,
      });
      console.log(`[EmailQueue] Sent directly (no queue) to ${payload.to}`);
    } catch (error) {
      console.error(
        "[EmailQueue] Direct send failed (no queue configured):",
        error,
      );
    }
    return;
  }

  await emailQueue.add(payload, {
    priority: 1,
  });
  console.log(`[EmailQueue] Queued email to ${payload.to}`);
}
