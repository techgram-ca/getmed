import type { Metadata } from "next";
import Navbar from "@/components/GetMed/Navbar";
import Footer from "@/components/GetMed/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — GetMed",
  description: "Read the terms and conditions governing your use of the GetMed platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-[760px] mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2a9d8f] mb-3">Legal</p>
            <h1 className="text-[clamp(2rem,4vw,2.8rem)] font-extrabold tracking-tight text-[#0d1f1c]">
              Terms of Service
            </h1>
            <p className="mt-3 text-[#6b8280] text-sm">
              Last updated: <span className="font-medium text-[#0d1f1c]">April 21, 2026</span>
            </p>
            <p className="mt-4 text-[1rem] text-[#6b8280] leading-[1.75]">
              Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the GetMed
              platform. By accessing or using GetMed, you agree to be bound by these Terms.
              If you do not agree, do not use our services.
            </p>
          </div>

          <div className="space-y-10 text-[#4a5568]">
            <Section title="1. About GetMed">
              <p>
                GetMed Inc. (&ldquo;GetMed&rdquo;) operates an online platform that connects patients with
                independent pharmacies for prescription ordering, home delivery, and pharmacist
                consultations. GetMed is a technology platform — it does not itself dispense
                medications or provide medical advice. All dispensing is carried out by licensed
                Canadian pharmacies registered on our platform.
              </p>
            </Section>

            <Section title="2. Eligibility">
              <p>To use GetMed, you must:</p>
              <ul>
                <li>Be at least 16 years of age.</li>
                <li>Be located in Canada.</li>
                <li>Provide accurate and complete registration information.</li>
                <li>Have a valid prescription issued by a licensed Canadian healthcare provider for any prescription medication ordered.</li>
              </ul>
            </Section>

            <Section title="3. User Accounts">
              <p>
                You are responsible for maintaining the confidentiality of your account credentials.
                You agree to notify us immediately at <a href="mailto:support@getmed.ca">support@getmed.ca</a> if you
                suspect unauthorized access to your account. GetMed is not liable for losses
                resulting from unauthorized account access due to your failure to keep credentials
                secure.
              </p>
            </Section>

            <Section title="4. Prescription Orders">
              <ul>
                <li>You must have a valid, current prescription to order any prescription medication through GetMed.</li>
                <li>By submitting an order, you confirm that the prescription you upload is genuine, unaltered, and issued to you.</li>
                <li>The pharmacy retains full professional discretion to refuse or modify any order if clinically appropriate.</li>
                <li>GetMed does not guarantee the availability of any specific medication. Substitutions require pharmacist approval and your consent.</li>
                <li>Submitting a fraudulent prescription is a criminal offence. GetMed will report suspected fraud to the appropriate authorities.</li>
              </ul>
            </Section>

            <Section title="5. Pharmacist Consultations">
              <p>
                Consultations provided through GetMed are conducted by licensed Canadian pharmacists
                registered with their respective provincial regulatory bodies. Consultations are
                intended for minor ailments and medication advice only — they do not replace a
                physician visit for serious or emergency medical conditions.
              </p>
              <p>
                If a pharmacist determines that your condition requires physician assessment, they
                will advise you to seek appropriate care. GetMed and its pharmacists are not liable
                for outcomes resulting from failure to follow this advice.
              </p>
            </Section>

            <Section title="6. Delivery">
              <p>
                Delivery is carried out by GetMed&apos;s vetted driver network. Estimated delivery
                times are provided as a guide and are not guaranteed. GetMed is not liable for
                delays caused by weather, traffic, or circumstances beyond our control.
              </p>
              <p>
                You must ensure someone is available to receive controlled substances or
                refrigerated medications at the delivery address. GetMed reserves the right to
                return such orders to the pharmacy if delivery cannot be completed safely.
              </p>
            </Section>

            <Section title="7. Fees & Payments">
              <ul>
                <li>Prescription pricing is set by the dispensing pharmacy and may include dispensing fees as permitted by provincial regulation.</li>
                <li>A delivery fee applies to each order. This fee is displayed before you confirm your order.</li>
                <li>Payments are processed securely through our payment provider. GetMed does not store full card details.</li>
                <li>Refunds are handled on a case-by-case basis. Contact support within 48 hours of delivery for any concerns.</li>
              </ul>
            </Section>

            <Section title="8. Pharmacy Partners">
              <p>
                Pharmacies that join GetMed agree to maintain valid provincial licences, comply
                with all applicable pharmacy regulations, and fulfill orders accurately and in a
                timely manner. GetMed reserves the right to suspend or remove any pharmacy from
                the platform for non-compliance, patient safety concerns, or breach of these Terms.
              </p>
              <p>
                GetMed charges no commission on prescription sales. A delivery service fee applies
                per completed delivery as agreed in the pharmacy&apos;s service agreement.
              </p>
            </Section>

            <Section title="9. Prohibited Conduct">
              <p>You agree not to:</p>
              <ul>
                <li>Submit false, altered, or fraudulent prescriptions.</li>
                <li>Use the platform for any unlawful purpose.</li>
                <li>Attempt to circumvent security measures or access accounts that are not yours.</li>
                <li>Harass, threaten, or abuse pharmacists, drivers, or GetMed staff.</li>
                <li>Resell medications obtained through GetMed.</li>
                <li>Use automated scripts or bots to interact with the platform.</li>
              </ul>
            </Section>

            <Section title="10. Disclaimer of Warranties">
              <p>
                GetMed is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied.
                We do not warrant that the platform will be uninterrupted, error-free, or free of
                viruses. Use of GetMed is at your own risk.
              </p>
            </Section>

            <Section title="11. Limitation of Liability">
              <p>
                To the maximum extent permitted by applicable law, GetMed Inc. and its officers,
                employees, and agents shall not be liable for any indirect, incidental, special, or
                consequential damages arising out of or related to your use of the platform,
                including but not limited to loss of data, lost profits, or personal injury.
                GetMed&apos;s total liability shall not exceed the amount you paid to GetMed in the
                three (3) months preceding the claim.
              </p>
            </Section>

            <Section title="12. Governing Law">
              <p>
                These Terms are governed by the laws of the Province of Ontario and the federal
                laws of Canada applicable therein. Any disputes shall be resolved in the courts
                of Ontario, Canada.
              </p>
            </Section>

            <Section title="13. Changes to These Terms">
              <p>
                We may update these Terms from time to time. Material changes will be notified
                via email or a prominent notice on the platform. Continued use of GetMed after
                changes take effect constitutes acceptance of the updated Terms.
              </p>
            </Section>

            <Section title="14. Contact">
              <p>Questions about these Terms? Reach us at:</p>
              <div className="mt-3 p-5 rounded-xl bg-[#f0faf8] border border-[#e2efed] text-sm space-y-1">
                <p><strong className="text-[#0d1f1c]">GetMed Inc.</strong></p>
                <p>Email: <a href="mailto:legal@getmed.ca" className="text-[#2a9d8f] hover:underline">legal@getmed.ca</a></p>
                <p>Support: <a href="/support" className="text-[#2a9d8f] hover:underline">getmed.ca/support</a></p>
              </div>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-[#0d1f1c] mb-3 pb-2 border-b border-[#e2efed]">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-[1.8] [&_ul]:mt-2 [&_ul]:space-y-1.5 [&_ul]:pl-4 [&_ul]:list-disc [&_a]:text-[#2a9d8f] [&_a]:hover:underline [&_strong]:text-[#0d1f1c]">
        {children}
      </div>
    </section>
  );
}
