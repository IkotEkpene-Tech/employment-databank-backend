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
