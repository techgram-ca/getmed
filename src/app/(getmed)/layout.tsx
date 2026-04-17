import GoogleMapsScript from "@/components/GetMed/GoogleMapsScript";

export default function GetMedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleMapsScript />
      {children}
    </>
  );
}
