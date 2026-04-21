import type { Metadata } from "next";
import Navbar from "@/components/GetMed/Navbar";
import ConsultLanding from "@/components/GetMed/consult/ConsultLanding";

export const metadata: Metadata = {
  title: "Consult a Pharmacist — GetMed",
  description:
    "Get expert advice from a licensed Canadian pharmacist for UTIs, skin conditions, allergies, and more — no clinic visit needed.",
};

export default function ConsultPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ConsultLanding />
    </div>
  );
}
