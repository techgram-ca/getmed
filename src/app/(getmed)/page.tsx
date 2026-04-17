import Navbar from "@/components/GetMed/Navbar";
import Hero from "@/components/GetMed/Hero";
import HowItWorks from "@/components/GetMed/HowItWorks";
import WhyChoose from "@/components/GetMed/WhyChoose";
import CtaStrip from "@/components/GetMed/CtaStrip";
import Footer from "@/components/GetMed/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <WhyChoose />
        <CtaStrip />
      </main>
      <Footer />
    </>
  );
}
