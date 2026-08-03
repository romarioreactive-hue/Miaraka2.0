import { useRouter } from 'expo-router';
import { useState } from 'react';

import { PublicRoute } from '@/auth';
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { WelcomeScreen } from '@/components/onboarding/welcome-screen';

let onboardingFinishedForSession = false;

export default function HomeScreen() {
  const router = useRouter();
  const [step, setStep] = useState(onboardingFinishedForSession ? 5 : 0);

  // "Voir la démonstration" menait directement à /demo. Cet écran étant
  // désormais protégé par une vraie session, il redirige vers l'inscription.
  function goToSignUp() {
    onboardingFinishedForSession = true;
    router.push('/signup');
  }

  function goToLogin() {
    onboardingFinishedForSession = true;
    router.push('/login');
  }

  return (
    <PublicRoute redirectTo="/demo">
      {step < 5 ? (
        <OnboardingScreen
          step={step}
          onBack={() => setStep((current) => Math.max(0, current - 1))}
          onContinue={() => setStep((current) => Math.min(5, current + 1))}
          onSkip={() => setStep(5)}
        />
      ) : (
        <WelcomeScreen onDemo={goToSignUp} onLogin={goToLogin} />
      )}
    </PublicRoute>
  );
}
