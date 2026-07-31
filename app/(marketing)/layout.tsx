import "./new-design.css";
import { ContactWidget } from "@/components/layout/ContactWidget";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ContactWidget />
    </>
  );
}
