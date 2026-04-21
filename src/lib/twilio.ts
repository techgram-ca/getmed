import twilio from "twilio";
import { createAdminClient } from "@/lib/supabase/admin";

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

// ── Enable/disable switches ──────────────────────────────────────────
// ENABLE_SMS env var is the master switch — must equal "true".
// Both env var AND the admin DB setting must be true to send any message.

export async function isSmsEnabled(): Promise<boolean> {
  if (process.env.ENABLE_SMS !== "true") return false;
  const admin = createAdminClient();
  const { data } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "sms_enabled")
    .single();
  return data?.value === "true";
}

// ── Template definitions ─────────────────────────────────────────────
// Default message bodies with {{placeholder}} variables.
// Admin can override any template in the DB (key: sms_tpl_<name>).

export const SMS_TEMPLATES: Record<string, { label: string; body: string; vars: string[] }> = {
  order_patient: {
    label: "Order Confirmation — Patient",
    body: "Hi {{patientName}}, your GetMed {{orderType}} has been received! {{pharmacyName}} will review and contact you to confirm. Ref: #{{orderId}}",
    vars: ["patientName", "orderType", "pharmacyName", "orderId"],
  },
  order_pharmacy: {
    label: "Order Confirmation — Pharmacy",
    body: "New GetMed {{orderType}} ({{deliveryType}}) from {{patientName}} — {{patientPhone}}. Log in to your GetMed dashboard to review the order.",
    vars: ["orderType", "deliveryType", "patientName", "patientPhone"],
  },
  status_processing: {
    label: "Status Update — Processing",
    body: "Hi {{patientName}}, your GetMed order is now being processed by the pharmacy. We'll text you when it's ready.",
    vars: ["patientName"],
  },
  status_ready_delivery: {
    label: "Status Update — Ready for Delivery",
    body: "Hi {{patientName}}, your GetMed order is ready! A driver will pick it up for delivery shortly.",
    vars: ["patientName"],
  },
  status_ready_pickup: {
    label: "Status Update — Ready for Pickup",
    body: "Hi {{patientName}}, your GetMed order is ready for pickup at the pharmacy!",
    vars: ["patientName"],
  },
  status_completed: {
    label: "Status Update — Completed",
    body: "Hi {{patientName}}, your GetMed order has been completed. Thank you for using GetMed!",
    vars: ["patientName"],
  },
  status_cancelled: {
    label: "Status Update — Cancelled",
    body: "Hi {{patientName}}, your GetMed order has been cancelled. Questions? Contact us at support@getmed.ca",
    vars: ["patientName"],
  },
  pharmacy_signup: {
    label: "Pharmacy Signup — Confirmation",
    body: "Hi {{contactName}}, your pharmacy \"{{displayName}}\" has been registered on GetMed! Our team will review your application and get back to you within 1–2 business days.",
    vars: ["contactName", "displayName"],
  },
  pharmacy_signup_admin: {
    label: "Pharmacy Signup — Admin Alert",
    body: "New GetMed pharmacy application: {{displayName}} ({{city}}, {{province}}). Contact: {{contactName}} — {{phone}}. Review at getmed.ca/admin/dashboard/pharmacies",
    vars: ["displayName", "city", "province", "contactName", "phone"],
  },
  pharmacy_approved: {
    label: "Pharmacy Decision — Approved",
    body: "Great news {{contactName}}! \"{{displayName}}\" has been approved on GetMed. Log in at getmed.ca/pharmacy/login to access your dashboard.",
    vars: ["contactName", "displayName"],
  },
  pharmacy_rejected: {
    label: "Pharmacy Decision — Rejected",
    body: "Hi {{contactName}}, your GetMed application for \"{{displayName}}\" was not approved. Reason: {{reason}}. Contact support@getmed.ca if you have questions.",
    vars: ["contactName", "displayName", "reason"],
  },
  driver_signup: {
    label: "Driver Signup — Confirmation",
    body: "Hi {{fullName}}, your GetMed driver application has been received! Our team will review it within 1–2 business days and text you with a decision.",
    vars: ["fullName"],
  },
  driver_signup_admin: {
    label: "Driver Signup — Admin Alert",
    body: "New GetMed driver application: {{fullName}} ({{city}}, {{province}}). Vehicle: {{vehicleType}}. Phone: {{phone}}. Review at getmed.ca/admin/dashboard/drivers",
    vars: ["fullName", "city", "province", "vehicleType", "phone"],
  },
  driver_approved: {
    label: "Driver Decision — Approved",
    body: "Great news {{fullName}}! Your GetMed driver application has been approved. Log in at getmed.ca/driver/login to start accepting deliveries.",
    vars: ["fullName"],
  },
  driver_rejected: {
    label: "Driver Decision — Rejected",
    body: "Hi {{fullName}}, your GetMed driver application was not approved. Reason: {{reason}}. Contact support@getmed.ca if you have questions.",
    vars: ["fullName", "reason"],
  },
  driver_suspended: {
    label: "Driver Decision — Suspended",
    body: "Hi {{fullName}}, your GetMed driver account has been temporarily suspended. Contact support@getmed.ca for more information.",
    vars: ["fullName"],
  },
  driver_reactivated: {
    label: "Driver Decision — Reactivated",
    body: "Good news {{fullName}}! Your GetMed driver account has been reactivated. Log in at getmed.ca/driver/login to resume deliveries.",
    vars: ["fullName"],
  },
};

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

async function resolveBody(templateKey: string, vars: Record<string, string>): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", `sms_tpl_${templateKey}`)
    .single();
  const tpl = data?.value || SMS_TEMPLATES[templateKey]?.body || "";
  return interpolate(tpl, vars);
}

// ── Core send ────────────────────────────────────────────────────────

async function _send(to: string, body: string): Promise<void> {
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
    console.error("[twilio] SMS send failed:", err);
  }
}

// Legacy: send a pre-built message string.
export async function sendSms(to: string, body: string): Promise<void> {
  if (!(await isSmsEnabled())) {
    console.log("[twilio] SMS disabled — skipping.");
    return;
  }
  await _send(to, body);
}

// Preferred: look up DB template override, interpolate vars, then send.
export async function sendSmsTpl(
  to: string,
  templateKey: string,
  vars: Record<string, string>
): Promise<void> {
  if (!(await isSmsEnabled())) {
    console.log("[twilio] SMS disabled — skipping.");
    return;
  }
  const body = await resolveBody(templateKey, vars);
  if (!body) return;
  await _send(to, body);
}

// ── Helpers for call sites ───────────────────────────────────────────

export function statusToTemplateKey(status: string, deliveryType: string): string | null {
  switch (status) {
    case "processing": return "status_processing";
    case "ready":      return deliveryType === "delivery" ? "status_ready_delivery" : "status_ready_pickup";
    case "completed":  return "status_completed";
    case "cancelled":  return "status_cancelled";
    default:           return null;
  }
}

const ORDER_TYPE_LABEL: Record<string, string> = {
  prescription: "Prescription Order",
  transfer:     "Transfer Request",
  otc:          "OTC Order",
};

export function orderTypeLabel(type: string): string {
  return ORDER_TYPE_LABEL[type] ?? "Order";
}
