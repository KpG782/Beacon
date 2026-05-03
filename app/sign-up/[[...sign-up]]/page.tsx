import { SignUp } from '@clerk/nextjs'
import { AuthShell } from '@/components/auth/auth-shell'

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Provision Access"
      title="Create your Beacon account"
      description="Store research state per user, keep API keys isolated, and move between devices without losing context."
      footerHref="/sign-in"
      footerLabel="Back to sign in"
    >
      <SignUp path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/profile/setup" />
    </AuthShell>
  )
}
