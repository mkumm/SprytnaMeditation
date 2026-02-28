import { useEffect, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const MINUTE_OPTIONS = Array.from({ length: 120 }, (_, i) => i + 1);
const ITEM_HEIGHT = 54;
const VISIBLE_ITEMS = 5;

export default function App() {
  const [selectedMinutes, setSelectedMinutes] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const soundRef = useRef(null);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
    });
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
      if (timerRef.current) clearInterval(timerRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Scroll picker to initial selection on mount
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: (selectedMinutes - 1) * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  }, []);

  async function playGong() {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/sounds/gong.mp3')
    );
    soundRef.current = sound;
    await sound.playAsync();
  }

  async function startTimer() {
    await activateKeepAwakeAsync();
    await playGong();
    const totalSeconds = selectedMinutes * 60;
    setSecondsLeft(totalSeconds);
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleTimerEnd() {
    setIsRunning(false);
    deactivateKeepAwake();
    await playGong();
    setSecondsLeft(null);
  }

  function stopTimer() {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setSecondsLeft(null);
    deactivateKeepAwake();
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // Native: fires after momentum/drag ends — snap is handled by snapToInterval
  function handleScrollNative(event) {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(MINUTE_OPTIONS.length - 1, index));
    setSelectedMinutes(MINUTE_OPTIONS[clamped]);
  }

  // Web: debounce onScroll, then manually snap to nearest item
  function handleScrollWeb(event) {
    const y = event.nativeEvent.contentOffset.y;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      const index = Math.round(y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(MINUTE_OPTIONS.length - 1, index));
      scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
      setSelectedMinutes(MINUTE_OPTIONS[clamped]);
    }, 150);
  }

  const pickerHeight = ITEM_HEIGHT * VISIBLE_ITEMS;
  const centerOffset = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);
  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>Meditation Timer</Text>

      {!isRunning ? (
        <>
          <View style={styles.pickerWrapper}>
            {/* Selection highlight */}
            <View
              style={[
                styles.selectionBar,
                { top: centerOffset, height: ITEM_HEIGHT },
              ]}
            />

            <ScrollView
              ref={scrollRef}
              style={{ height: pickerHeight }}
              showsVerticalScrollIndicator={false}
              snapToInterval={isWeb ? undefined : ITEM_HEIGHT}
              decelerationRate={isWeb ? undefined : 'fast'}
              onMomentumScrollEnd={isWeb ? undefined : handleScrollNative}
              onScrollEndDrag={isWeb ? undefined : handleScrollNative}
              onScroll={isWeb ? handleScrollWeb : undefined}
              scrollEventThrottle={isWeb ? 16 : undefined}
              contentContainerStyle={{
                paddingVertical: centerOffset,
              }}
            >
              {MINUTE_OPTIONS.map((min) => {
                const isSelected = min === selectedMinutes;
                return (
                  <View
                    key={min}
                    style={[styles.pickerItem, { height: ITEM_HEIGHT }]}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        isSelected && styles.pickerTextSelected,
                      ]}
                    >
                      {min} {min === 1 ? 'minute' : 'minutes'}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startTimer}>
            <Text style={styles.startButtonText}>Begin</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.countdown}>
            {secondsLeft !== null ? formatTime(secondsLeft) : '00:00'}
          </Text>

          <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
            <Text style={styles.stopButtonText}>End Session</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const BG = '#1a1a2e';
const ACCENT = '#c9a96e';
const MUTED = 'rgba(255,255,255,0.3)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    color: ACCENT,
    fontSize: 22,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 48,
    fontWeight: '300',
  },
  pickerWrapper: {
    width: 240,
    position: 'relative',
    marginBottom: 48,
  },
  selectionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(201,169,110,0.12)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: ACCENT,
    zIndex: 1,
    pointerEvents: 'none',
  },
  pickerItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerText: {
    color: MUTED,
    fontSize: 20,
    fontWeight: '300',
  },
  pickerTextSelected: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '400',
  },
  startButton: {
    borderWidth: 1,
    borderColor: ACCENT,
    paddingVertical: 14,
    paddingHorizontal: 56,
    borderRadius: 4,
  },
  startButtonText: {
    color: ACCENT,
    fontSize: 18,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '300',
  },
  countdown: {
    color: '#ffffff',
    fontSize: 80,
    fontWeight: '100',
    letterSpacing: 4,
    marginBottom: 64,
    fontVariant: ['tabular-nums'],
  },
  stopButton: {
    borderWidth: 1,
    borderColor: MUTED,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 4,
  },
  stopButtonText: {
    color: MUTED,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '300',
  },
});
