import { PublicRoute } from '@/auth';
import { SignUpScreen } from '@/components/auth';

export default function SignUpRoute() {
  return (
    <PublicRoute redirectTo="/demo">
      <SignUpScreen />
    </PublicRoute>
  );
}
