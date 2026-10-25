import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthFrame } from "@/components/site/AuthFrame";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sign up: Agentronics" };

// After sign-up, go to the console (or back where it sent you, via ?redirect_url=…).
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "/";

export default function SignUpPage() {
  return (
    <AuthFrame eyebrow="Start free" title="Make your site agent-ready.">
      <SignUp signInUrl="/sign-in" fallbackRedirectUrl={DASHBOARD_URL} />
    </AuthFrame>
  );
}
