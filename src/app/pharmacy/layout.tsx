import GoogleMapsScript from "@/components/Pharmacy/GoogleMapsScript";

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleMapsScript />
      {children}
    </>
  );
}
