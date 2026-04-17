import type { Metadata } from "next";
import SignupForm from "@/components/Pharmacy/signup/SignupForm";

export const metadata: Metadata = {
  title: "Pharmacy Sign Up – GetMed",
  description:
    "Register your pharmacy on GetMed to start accepting online prescription orders and reach more patients in your area.",
};

export default function PharmacySignupPage() {
  return <SignupForm />;
}
