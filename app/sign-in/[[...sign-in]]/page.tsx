import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthFrame } from "@/components/site/AuthFrame";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Log in: Agentronics" };

// After sign-in, go back where the console sent you (?redirect_url=…), or to the console.
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "/";

export default function SignInPage() {
  return (
    <AuthFrame eyebrow="Log in" title="Welcome back.">
      <SignIn signUpUrl="/sign-up" fallbackRedirectUrl={DASHBOARD_URL} />
    </AuthFrame>
  );
}
