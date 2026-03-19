import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignUp
        fallbackRedirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
