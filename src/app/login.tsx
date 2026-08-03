import { PublicRoute } from '@/auth';
import { LoginScreen } from '@/components/auth';

export default function LoginRoute() {
  return (
    <PublicRoute redirectTo="/demo">
      <LoginScreen />
    </PublicRoute>
  );
}
