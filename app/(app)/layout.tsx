import { ProgressBar } from "@/components/feedback/ProgressBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-[100dvh]">
      <ProgressBar />
      {children}
    </div>
  );
}
