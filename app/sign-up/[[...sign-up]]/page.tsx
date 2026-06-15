import { SignUp } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

// After sign-up, send the user to the dashboard app.
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "/";

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4 py-16">
      <SignUp signInUrl="/sign-in" forceRedirectUrl={DASHBOARD_URL} />
    </div>
  );
}
