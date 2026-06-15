import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

// After sign-in, send the user to the dashboard app.
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "/";

export default function SignInPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4 py-16">
      <SignIn signUpUrl="/sign-up" forceRedirectUrl={DASHBOARD_URL} />
    </div>
  );
}
