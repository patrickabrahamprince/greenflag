import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-[0.5px] border-accent/30 animate-pulse" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
