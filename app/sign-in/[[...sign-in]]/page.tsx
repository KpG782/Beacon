import { SignIn } from '@clerk/nextjs'
import { AuthShell } from '@/components/auth/auth-shell'

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Operator Access"
      title="Sign in to Beacon"
      description="Resume your research workspace, memory graph, and workflow history."
      footerHref="/sign-up"
      footerLabel="Create account"
    >
      <SignIn path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
    </AuthShell>
  )
}
