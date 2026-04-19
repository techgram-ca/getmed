import GoogleMapsScript from "@/components/Pharmacy/GoogleMapsScript";

export default function PharmacySignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleMapsScript />
      {children}
    </>
  );
}
