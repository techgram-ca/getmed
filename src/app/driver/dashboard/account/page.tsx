import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import DriverAccountForms from "@/components/Driver/dashboard/DriverAccountForms";

const PROVINCES = ["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"];
const VEHICLE_TYPES = ["Car", "SUV", "Van", "Truck", "Motorcycle", "Bicycle", "E-Bike", "Scooter"];

export default async function DriverAccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/driver/login");

  const admin = createAdminClient();
  const { data: driver } = await admin
    .from("drivers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!driver || driver.status !== "approved") redirect("/driver/login");

  return (
    <DriverAccountForms
      driver={driver}
      provinces={PROVINCES}
      vehicleTypes={VEHICLE_TYPES}
    />
  );
}
