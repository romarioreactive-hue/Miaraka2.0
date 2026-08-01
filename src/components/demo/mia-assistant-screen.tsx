import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/ui/app-background';
import { Avatar } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/language-context';
import { alpha, avatars, darkColors, radius, spacing, typography } from '@/theme';

import { DemoTab, DemoTabBar } from './demo-tab-bar';

type MiaState = 'idle' | 'listening' | 'thinking' | 'answered';
type AnswerKey = 'mia.sampleResponse' | 'mia.answer2' | 'mia.answer3';

type MiaAssistantScreenProps = {
  activeTab: DemoTab;
  onNavigate: (tab: DemoTab) => void;
  onClose: () => void;
};

const SUGGESTIONS: { questionKey: 'mia.suggestion1' | 'mia.suggestion2' | 'mia.suggestion3'; answerKey: AnswerKey }[] = [
  { questionKey: 'mia.suggestion1', answerKey: 'mia.sampleResponse' },
  { questionKey: 'mia.suggestion2', answerKey: 'mia.answer2' },
  { questionKey: 'mia.suggestion3', answerKey: 'mia.answer3' },
];

export function MiaAssistantScreen({ activeTab, onNavigate, onClose }: MiaAssistantScreenProps) {
  const { t } = useLanguage();
  const [state, setState] = useState<MiaState>('idle');
  const [answerKey, setAnswerKey] = useState<AnswerKey>('mia.sampleResponse');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  function askDirectly(key: AnswerKey) {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setAnswerKey(key);
    setState('thinking');
    timers.current.push(setTimeout(() => setState('answered'), 900));
  }

  function handleMicPress() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (state === 'listening' || state === 'thinking') {
      setState('idle');
      return;
    }
    setState('listening');
    timers.current.push(
      setTimeout(() => {
        setAnswerKey('mia.sampleResponse');
        setState('thinking');
        timers.current.push(setTimeout(() => setState('answered'), 900));
      }, 1100),
    );
  }

  return (
    <AppBackground style={styles.root} variant="default">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <View style={styles.topBarIdentity}>
            <Avatar backgroundColor="#253B63" name={t('common.me')} ringColor={alpha.white24} size={32} source={avatars.moi} />
            <Text accessibilityRole="header" style={styles.title}>{t('mia.title')}</Text>
          </View>
          <Pressable
            accessibilityLabel={t('common.notifications')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }}
              size={20}
              tintColor={darkColors.primary}
              weight="medium"
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.responseArea}>
            {state === 'thinking' ? (
              <Animated.View entering={FadeIn.duration(250)} style={styles.glassPanel}>
                <Text style={styles.searchingText}>{t('mia.searching')}</Text>
              </Animated.View>
            ) : state === 'answered' ? (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.glassPanel}>
                <Text style={styles.responseText}>{t(answerKey)}</Text>
                <View style={styles.analysisRow}>
                  <SymbolView name={{ ios: 'clock.fill', android: 'history', web: 'history' }} size={14} tintColor={darkColors.textMuted} />
                  <Text style={styles.analysisText}>{t('mia.analysisComplete')}</Text>
                </View>
              </Animated.View>
            ) : (
              <View style={styles.idleHint}>
                <Text style={styles.idleHintText}>{t('mia.idleLabel')}</Text>
              </View>
            )}
          </View>

          <View style={styles.micArea}>
            <PulsingRings active={state === 'idle' || state === 'listening'} />
            <Waveform active={state === 'listening'} />
            <Pressable
              accessibilityLabel={t('mia.micAccessibility')}
              accessibilityRole="button"
              onPress={handleMicPress}
              style={({ pressed }) => [styles.micButton, pressed && styles.micButtonPressed]}>
              <SymbolView
                name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
                size={34}
                tintColor={darkColors.textInverse}
                weight="medium"
              />
            </Pressable>
            <Text style={styles.stateLabel}>
              {state === 'listening' ? t('mia.listeningLabel') : state === 'thinking' ? t('mia.searching') : t('mia.idleLabel')}
            </Text>
          </View>

          <View style={styles.suggestions}>
            <Text style={styles.suggestionsLabel}>{t('mia.suggestionsLabel')}</Text>
            {SUGGESTIONS.map((suggestion) => (
              <Pressable
                accessibilityRole="button"
                key={suggestion.questionKey}
                onPress={() => askDirectly(suggestion.answerKey)}
                style={({ pressed }) => [styles.suggestionButton, pressed && styles.pressed]}>
                <Text style={styles.suggestionText}>{t(suggestion.questionKey)}</Text>
                <Text style={styles.suggestionChevron}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <DemoTabBar
          activeTab={activeTab}
          onChangeTab={onNavigate}
          onPressMia={onClose}
        />
      </SafeAreaView>
    </AppBackground>
  );
}

function PulsingRings({ active }: { active: boolean }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!active) return;
    scale.value = withRepeat(withSequence(withTiming(1.35, { duration: 1400, easing: Easing.out(Easing.ease) }), withTiming(1, { duration: 0 })), -1, false);
  }, [active, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: active ? 0.35 * (1.35 - scale.value) / 0.35 : 0,
  }));

  return <Animated.View pointerEvents="none" style={[styles.pulseRing, style]} />;
}

function Waveform({ active }: { active: boolean }) {
  const heights = [12, 25, 38, 20, 30];
  return (
    <View style={styles.wave}>
      {heights.map((height, index) => (
        <WaveBar key={index} baseHeight={height} delay={index * 90} active={active} />
      ))}
    </View>
  );
}

function WaveBar({ baseHeight, delay, active }: { baseHeight: number; delay: number; active: boolean }) {
  const scaleY = useSharedValue(0.4);

  useEffect(() => {
    if (!active) {
      scaleY.value = withTiming(0.4, { duration: 200 });
      return;
    }
    scaleY.value = withRepeat(
      withSequence(withTiming(1.6, { duration: 420, easing: Easing.inOut(Easing.ease) }), withTiming(0.5, { duration: 420, easing: Easing.inOut(Easing.ease) })),
      -1,
      true,
    );
  }, [active, delay, scaleY]);

  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: scaleY.value }] }));

  return <Animated.View style={[styles.waveBar, { height: baseHeight }, style]} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: spacing[4], paddingTop: spacing[2] },
  topBarIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  title: { ...typography.titleLarge, color: darkColors.accent },
  notificationButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, backgroundColor: darkColors.surfaceElevated },
  pressed: { opacity: 0.78 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingVertical: spacing[5] },
  responseArea: { width: '100%', minHeight: 96, justifyContent: 'center' },
  glassPanel: { padding: spacing[4], borderRadius: radius.extraLarge, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surfaceElevated },
  responseText: { ...typography.bodyLarge, color: darkColors.textPrimary, textAlign: 'center' },
  analysisRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[1], marginTop: spacing[3] },
  analysisText: { ...typography.caption, color: darkColors.textMuted },
  searchingText: { ...typography.bodyMedium, color: darkColors.textSecondary, textAlign: 'center' },
  idleHint: { alignItems: 'center' },
  idleHintText: { ...typography.caption, color: darkColors.textMuted },
  micArea: { alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  pulseRing: { position: 'absolute', width: 140, height: 140, borderRadius: radius.circle, backgroundColor: alpha.primary12, top: -20 },
  wave: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing[2] },
  waveBar: { width: 5, borderRadius: radius.pill, backgroundColor: darkColors.accent },
  micButton: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circle,
    backgroundColor: darkColors.primary,
    shadowColor: darkColors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  micButtonPressed: { transform: [{ scale: 0.94 }] },
  stateLabel: { ...typography.labelMedium, color: darkColors.primary, letterSpacing: 1, textTransform: 'uppercase' },
  suggestions: { width: '100%', gap: spacing[2] },
  suggestionsLabel: { ...typography.caption, color: darkColors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing[1] },
  suggestionButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], borderRadius: radius.pill, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  suggestionText: { ...typography.bodyMedium, color: darkColors.textSecondary, flex: 1 },
  suggestionChevron: { color: darkColors.textMuted, fontSize: 22, fontWeight: '300' },
});
