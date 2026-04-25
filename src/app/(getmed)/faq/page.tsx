import type { Metadata } from "next";
import Navbar from "@/components/GetMed/Navbar";
import Footer from "@/components/GetMed/Footer";
import FaqPage from "@/components/GetMed/FaqPage";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | GetMed",
  description: "Got questions about GetMed? Find answers about ordering prescriptions, consultations, delivery, and more.",
};

export default function FAQ() {
  return (
    <>
      <Navbar />
      <main>
        <FaqPage />
      </main>
      <Footer />
    </>
  );
}
