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

// ── Pharmacy signup ───────────────────────────────────────────────

export function smsPharmacySignupConfirmation(
  contactName: string,
  displayName: string
): string {
  return (
    `Hi ${contactName}, your pharmacy "${displayName}" has been registered on GetMed! ` +
    `Our team will review your application and get back to you within 1–2 business days.`
  );
}

export function smsPharmacySignupAdmin(
  displayName: string,
  city: string,
  province: string,
  contactName: string,
  phone: string
): string {
  return (
    `New GetMed pharmacy application: ${displayName} (${city}, ${province}). ` +
    `Contact: ${contactName} — ${phone}. ` +
    `Review at getmed.ca/admin/dashboard/pharmacies`
  );
}

// ── Pharmacy admin decision ───────────────────────────────────────

export function smsPharmacyApproved(
  contactName: string,
  displayName: string
): string {
  return (
    `Great news ${contactName}! "${displayName}" has been approved on GetMed. ` +
    `Log in at getmed.ca/pharmacy/login to access your dashboard.`
  );
}

export function smsPharmacyRejected(
  contactName: string,
  displayName: string,
  reason: string
): string {
  return (
    `Hi ${contactName}, your GetMed application for "${displayName}" was not approved. ` +
    `Reason: ${reason}. ` +
    `Contact support@getmed.ca if you have questions.`
  );
}

// ── Driver signup ─────────────────────────────────────────────────

export function smsDriverSignupConfirmation(fullName: string): string {
  return (
    `Hi ${fullName}, your GetMed driver application has been received! ` +
    `Our team will review it within 1–2 business days and text you with a decision.`
  );
}

export function smsDriverSignupAdmin(
  fullName: string,
  city: string,
  province: string,
  vehicleType: string,
  phone: string
): string {
  return (
    `New GetMed driver application: ${fullName} (${city}, ${province}). ` +
    `Vehicle: ${vehicleType || "Not specified"}. Phone: ${phone}. ` +
    `Review at getmed.ca/admin/dashboard/drivers`
  );
}

// ── Driver admin decision ─────────────────────────────────────────

export function smsDriverApproved(fullName: string): string {
  return (
    `Great news ${fullName}! Your GetMed driver application has been approved. ` +
    `Log in at getmed.ca/driver/login to start accepting deliveries.`
  );
}

export function smsDriverRejected(fullName: string, reason: string): string {
  return (
    `Hi ${fullName}, your GetMed driver application was not approved. ` +
    `Reason: ${reason}. ` +
    `Contact support@getmed.ca if you have questions.`
  );
}

export function smsDriverSuspended(fullName: string): string {
  return (
    `Hi ${fullName}, your GetMed driver account has been temporarily suspended. ` +
    `Contact support@getmed.ca for more information.`
  );
}

export function smsDriverReactivated(fullName: string): string {
  return (
    `Good news ${fullName}! Your GetMed driver account has been reactivated. ` +
    `Log in at getmed.ca/driver/login to resume deliveries.`
  );
}
