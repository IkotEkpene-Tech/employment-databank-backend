import rateLimit from "express-rate-limit";

export function formatNigerianPhone(phone: string): string {
  const cleaned = phone.trim().replace(/\s+/g, "");

  if (cleaned.startsWith("+234")) {
    return cleaned;
  }

  if (cleaned.startsWith("234")) {
    return `+${cleaned}`;
  }

  if (cleaned.startsWith("0")) {
    return `+234${cleaned.slice(1)}`;
  }

  return `+234${cleaned}`;
}

export function returnPhoneNumberWithoutFormat(phone: string): string {
  const cleaned = phone.trim().replace(/\s+/g, "");

  if (cleaned.startsWith("+234")) {
    return "0" + cleaned.slice(4);
  }

  if (cleaned.startsWith("0")) {
    return cleaned;
  }

  return "0" + cleaned;
}

export const toTitleCase = (
  value: string | null | undefined | any,
): string | null | any => {
  if (!value || value.trim() === "") return null;
  return value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char:any) => char.toUpperCase());
};

export const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many requests, please try again later",
});


export const isExpiredTodayUTC = (expiresAt: string | Date): boolean => {
  const expiry = new Date(expiresAt);

  const now = new Date();

  const todayUTC = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );

  return expiry < todayUTC;
};