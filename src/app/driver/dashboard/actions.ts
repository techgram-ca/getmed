"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getDriverId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("drivers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  return data?.id ?? null;
}

export async function markDispatchedAction(
  orderIds: string[]
): Promise<{ error: string | null }> {
  const driverId = await getDriverId();
  if (!driverId) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ status: "dispatched" })
    .in("id", orderIds)
    .eq("assigned_driver_id", driverId)
    .eq("status", "ready");

  if (error) return { error: error.message };
  revalidatePath("/driver/dashboard");
  return { error: null };
}

export async function submitDeliveryProofAction(
  orderId: string,
  formData: FormData
): Promise<{ error: string | null }> {
  const driverId = await getDriverId();
  if (!driverId) return { error: "Not authenticated" };

  const outcome = formData.get("outcome") as string;
  const note = (formData.get("note") as string | null) ?? "";

  if (outcome !== "delivered" && outcome !== "failed") {
    return { error: "Invalid outcome" };
  }
  if (outcome === "failed" && !note.trim()) {
    return { error: "Note is required for failed delivery" };
  }

  const admin = createAdminClient();

  // Verify the order belongs to this driver and is dispatched
  const { data: order } = await admin
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .eq("assigned_driver_id", driverId)
    .eq("status", "dispatched")
    .single();

  if (!order) return { error: "Order not found or not in dispatched status" };

  const proof: Record<string, unknown> = {
    outcome,
    note: note.trim() || null,
    captured_at: new Date().toISOString(),
  };

  if (outcome === "delivered") {
    const photo = formData.get("photo") as File | null;
    const signature = formData.get("signature") as File | null;

    if (!photo || !signature) {
      return { error: "Photo and signature are required for successful delivery" };
    }

    const ts = Date.now();
    const photoExt = photo.name.split(".").at(-1) ?? "jpg";
    const photoPath = `${orderId}/photo-${ts}.${photoExt}`;
    const sigPath = `${orderId}/sig-${ts}.png`;

    const [{ error: photoErr }, { error: sigErr }] = await Promise.all([
      admin.storage.from("delivery-proofs").upload(photoPath, await photo.arrayBuffer(), {
        contentType: photo.type,
        upsert: true,
      }),
      admin.storage.from("delivery-proofs").upload(sigPath, await signature.arrayBuffer(), {
        contentType: "image/png",
        upsert: true,
      }),
    ]);

    if (photoErr) return { error: `Photo upload failed: ${photoErr.message}` };
    if (sigErr) return { error: `Signature upload failed: ${sigErr.message}` };

    proof.photo_path = photoPath;
    proof.signature_path = sigPath;
  }

  const newStatus = outcome === "delivered" ? "completed" : "delivery_failed";

  const { error } = await admin
    .from("orders")
    .update({ status: newStatus, delivery_proof: proof })
    .eq("id", orderId)
    .eq("assigned_driver_id", driverId);

  if (error) return { error: error.message };
  revalidatePath("/driver/dashboard");
  return { error: null };
}
