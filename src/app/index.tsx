import { useRouter } from 'expo-router';
import { useState } from 'react';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { WelcomeScreen } from '@/components/onboarding/welcome-screen';

let onboardingFinishedForSession = false;

export default function HomeScreen() {
  const router = useRouter();
  const [step, setStep] = useState(onboardingFinishedForSession ? 5 : 0);

  function openDemo() {
    onboardingFinishedForSession = true;
    router.replace('/demo');
  }

  if (step < 5) {
    return (
      <OnboardingScreen
        step={step}
        onBack={() => setStep((current) => Math.max(0, current - 1))}
        onContinue={() => setStep((current) => Math.min(5, current + 1))}
        onSkip={() => setStep(5)}
      />
    );
  }

  return <WelcomeScreen onOpenDemo={openDemo} />;
}
