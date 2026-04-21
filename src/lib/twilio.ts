import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

function getClient() {
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
}

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export async function sendSms(to: string, body: string): Promise<void> {
  const client = getClient();
  if (!client || !fromNumber) {
    console.warn("[twilio] SMS skipped — TWILIO_* env vars not configured.");
    return;
  }

  const normalized = normalizePhone(to);
  if (!normalized) {
    console.warn(`[twilio] Could not normalize phone number: ${to}`);
    return;
  }

  try {
    await client.messages.create({ to: normalized, from: fromNumber, body });
  } catch (err) {
    // Non-fatal: log but don't block the calling operation
    console.error("[twilio] SMS send failed:", err);
  }
}

// ── Message templates ─────────────────────────────────────────────

const ORDER_TYPE_LABEL: Record<string, string> = {
  prescription: "Prescription Order",
  transfer:     "Transfer Request",
  otc:          "OTC Order",
};

export function smsOrderConfirmationPatient(
  patientName: string,
  pharmacyName: string,
  orderType: string,
  orderId: string
): string {
  const label   = ORDER_TYPE_LABEL[orderType] ?? "Order";
  const shortId = orderId.slice(-8).toUpperCase();
  return (
    `Hi ${patientName}, your GetMed ${label} has been received! ` +
    `${pharmacyName} will review and contact you to confirm. ` +
    `Ref: #${shortId}`
  );
}

export function smsOrderConfirmationPharmacy(
  patientName: string,
  patientPhone: string,
  orderType: string,
  deliveryType: string
): string {
  const label    = ORDER_TYPE_LABEL[orderType] ?? "Order";
  const delivery = deliveryType === "delivery" ? "Delivery" : "Pickup";
  return (
    `New GetMed ${label} (${delivery}) from ${patientName} — ${patientPhone}. ` +
    `Log in to your GetMed dashboard to review the order.`
  );
}

const STATUS_MESSAGE: Record<string, (name: string, delivery: string) => string> = {
  processing: (name) =>
    `Hi ${name}, your GetMed order is now being processed by the pharmacy. We'll text you when it's ready.`,
  ready: (name, delivery) =>
    delivery === "delivery"
      ? `Hi ${name}, your GetMed order is ready! A driver will pick it up for delivery shortly.`
      : `Hi ${name}, your GetMed order is ready for pickup at the pharmacy!`,
  completed: (name) =>
    `Hi ${name}, your GetMed order has been completed. Thank you for using GetMed!`,
  cancelled: (name) =>
    `Hi ${name}, your GetMed order has been cancelled. Questions? Contact us at support@getmed.ca`,
};

export function smsStatusUpdate(
  status: string,
  patientName: string,
  deliveryType: string
): string | null {
  const fn = STATUS_MESSAGE[status];
  return fn ? fn(patientName, deliveryType) : null;
}
