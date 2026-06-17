import { Suspense } from "react";
import ReportForm from "./ReportForm";

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-[0.5px] border-accent/30 animate-pulse" />
      </div>
    }>
      <ReportForm />
    </Suspense>
  );
}
