import type { Metadata } from "next";
import Navbar from "@/components/GetMed/Navbar";
import Footer from "@/components/GetMed/Footer";
import AboutPage from "@/components/GetMed/AboutPage";

export const metadata: Metadata = {
  title: "About GetMed | Trusted Pharmacy Platform in Canada",
  description: "Learn about GetMed — our mission to make pharmacy services more accessible, our values, and the team behind the platform.",
};

export default function About() {
  return (
    <>
      <Navbar />
      <main>
        <AboutPage />
      </main>
      <Footer />
    </>
  );
}
