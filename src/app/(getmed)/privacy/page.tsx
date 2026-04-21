import type { Metadata } from "next";
import Navbar from "@/components/GetMed/Navbar";
import Footer from "@/components/GetMed/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — GetMed",
  description: "Learn how GetMed collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-[760px] mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2a9d8f] mb-3">Legal</p>
            <h1 className="text-[clamp(2rem,4vw,2.8rem)] font-extrabold tracking-tight text-[#0d1f1c]">
              Privacy Policy
            </h1>
            <p className="mt-3 text-[#6b8280] text-sm">
              Last updated: <span className="font-medium text-[#0d1f1c]">April 21, 2026</span>
            </p>
            <p className="mt-4 text-[1rem] text-[#6b8280] leading-[1.75]">
              GetMed Inc. (&ldquo;GetMed&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your
              privacy. This policy explains what information we collect, how we use it, and
              your rights as a user of our platform.
            </p>
          </div>

          <div className="space-y-10 text-[#4a5568]">
            <Section title="1. Information We Collect">
              <p>We collect information you provide directly to us, including:</p>
              <ul>
                <li><strong>Account information</strong> — name, email address, phone number, and password when you create an account.</li>
                <li><strong>Order information</strong> — prescription details, delivery address, and payment data when you place an order.</li>
                <li><strong>Consultation data</strong> — health conditions, symptoms, and notes shared during pharmacist consultations.</li>
                <li><strong>Pharmacy registration data</strong> — business name, license number, address, and banking details when a pharmacy joins GetMed.</li>
                <li><strong>Usage data</strong> — pages visited, features used, device type, browser, and IP address collected automatically.</li>
              </ul>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Process and fulfill prescription orders and deliveries.</li>
                <li>Connect patients with licensed pharmacists for consultations.</li>
                <li>Send order status notifications, receipts, and support messages.</li>
                <li>Verify pharmacy credentials and maintain platform integrity.</li>
                <li>Improve our platform, detect fraud, and ensure security.</li>
                <li>Comply with applicable Canadian health and privacy laws.</li>
              </ul>
            </Section>

            <Section title="3. Sharing Your Information">
              <p>We do not sell your personal information. We share data only as follows:</p>
              <ul>
                <li><strong>Pharmacies</strong> — we share your name, contact details, delivery address, and prescription with the pharmacy fulfilling your order.</li>
                <li><strong>Delivery partners</strong> — drivers receive your name, phone number, and delivery address to complete the delivery.</li>
                <li><strong>Service providers</strong> — we use third-party providers for payments, cloud storage, and analytics. These providers are bound by confidentiality agreements.</li>
                <li><strong>Legal obligations</strong> — we may disclose information if required by law, court order, or regulatory authority.</li>
              </ul>
            </Section>

            <Section title="4. Health Information">
              <p>
                Prescription and health data shared on GetMed is treated with the highest level of
                care. This data is transmitted securely, stored in encrypted form, and accessible
                only to the pharmacy or pharmacist involved in your care. We comply with applicable
                Canadian provincial health privacy legislation including PIPEDA and applicable
                provincial health information acts.
              </p>
            </Section>

            <Section title="5. Data Retention">
              <p>
                We retain your personal information for as long as your account is active or as
                needed to provide services. Order and prescription records may be retained for up
                to seven (7) years to comply with pharmacy regulatory requirements. You may
                request deletion of your account at any time by contacting us — subject to legal
                retention obligations.
              </p>
            </Section>

            <Section title="6. Cookies & Tracking">
              <p>
                We use cookies and similar technologies to keep you logged in, remember preferences,
                and analyze platform usage. You can disable cookies in your browser settings, though
                some features may not function correctly without them. We do not use third-party
                advertising trackers.
              </p>
            </Section>

            <Section title="7. Your Rights">
              <p>Under Canadian privacy law, you have the right to:</p>
              <ul>
                <li>Access the personal information we hold about you.</li>
                <li>Correct inaccurate or incomplete information.</li>
                <li>Request deletion of your data (subject to legal retention requirements).</li>
                <li>Withdraw consent to certain uses of your data.</li>
                <li>Lodge a complaint with the Office of the Privacy Commissioner of Canada.</li>
              </ul>
              <p>To exercise any of these rights, contact us at <a href="mailto:privacy@getmed.ca">privacy@getmed.ca</a>.</p>
            </Section>

            <Section title="8. Security">
              <p>
                We implement industry-standard security measures including TLS encryption in
                transit, AES-256 encryption at rest, access controls, and regular security audits.
                No system is completely secure — if you suspect unauthorized access to your
                account, contact us immediately.
              </p>
            </Section>

            <Section title="9. Children's Privacy">
              <p>
                GetMed is not intended for use by individuals under the age of 16. We do not
                knowingly collect personal information from children. If we become aware that a
                child has provided us with personal data, we will delete it promptly.
              </p>
            </Section>

            <Section title="10. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. When we do, we will update
                the &ldquo;Last updated&rdquo; date at the top of this page and notify users via email if
                the changes are material. Continued use of GetMed after changes are posted
                constitutes acceptance of the updated policy.
              </p>
            </Section>

            <Section title="11. Contact Us">
              <p>
                Questions about this Privacy Policy? Reach us at:
              </p>
              <div className="mt-3 p-5 rounded-xl bg-[#f0faf8] border border-[#e2efed] text-sm space-y-1">
                <p><strong className="text-[#0d1f1c]">GetMed Inc.</strong></p>
                <p>Email: <a href="mailto:privacy@getmed.ca" className="text-[#2a9d8f] hover:underline">privacy@getmed.ca</a></p>
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
