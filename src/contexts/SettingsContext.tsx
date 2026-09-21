import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, AIProvider, CustomApiKeys, TarotDeckStyle } from '../types';
import { detectDeviceHardware, runHardwareInspection, DeviceHardwareInfo } from '../utils/deviceBenchmark';

interface SettingsContextType {
  settings: AppSettings;
  deviceInfo: DeviceHardwareInfo;
  isBenchmarking: boolean;
  toggleTheme: () => void;
  toggleEffects: () => void;
  toggleSound: () => void;
  setAutoOptimizeHardware: (enabled: boolean) => void;
  rebenchmarkDevice: () => Promise<DeviceHardwareInfo>;
  setAiProvider: (provider: AIProvider) => void;
  setAiModel: (model: string) => void;
  setAllowFallback: (allow: boolean) => void;
  setCustomKey: (provider: keyof CustomApiKeys, key: string) => void;
  setTarotDeckStyle: (style: TarotDeckStyle) => void;
}

const getDefaultModelForProvider = (provider: AIProvider): string => {
  switch (provider) {
    case 'gemini': return 'gemini-2.5-flash';
    case 'openrouter': return 'openrouter/free';
    default: return 'auto';
  }
};

const defaultSettings: AppSettings = {
  theme: 'dark',
  effectsEnabled: true,
  autoOptimizeHardware: true,
  soundEnabled: true,
  aiProvider: 'openrouter',
  aiModel: 'openrouter/free',
  allowFallback: true,
  customKeys: {},
  tarotDeckStyle: 'rider-waite',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceHardwareInfo>(() => detectDeviceHardware());
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const detected = detectDeviceHardware();
    try {
      const saved = localStorage.getItem('celestial-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        const autoOpt = parsed.autoOptimizeHardware ?? true;
        // If auto-optimize is enabled and user hasn't explicitly locked effects, tune to hardware
        const effectsVal = autoOpt ? !detected.isLowEnd : (parsed.effectsEnabled ?? !detected.isLowEnd);

        return {
          ...defaultSettings,
          ...parsed,
          effectsEnabled: effectsVal,
          autoOptimizeHardware: autoOpt,
          aiModel: parsed.aiModel || getDefaultModelForProvider(parsed.aiProvider || 'auto'),
          allowFallback: parsed.allowFallback ?? true,
          customKeys: {
            ...defaultSettings.customKeys,
            ...(parsed.customKeys || {}),
          },
        };
      }
    } catch (e) {
      console.error("Failed to parse settings", e);
    }
    // Default initial load: adjust effects based on detected hardware
    return {
      ...defaultSettings,
      effectsEnabled: !detected.isLowEnd,
      autoOptimizeHardware: true,
    };
  });

  // Perform full hardware inspection on mount
  useEffect(() => {
    let isMounted = true;
    runHardwareInspection().then((hw) => {
      if (!isMounted) return;
      setDeviceInfo(hw);
      if (settings.autoOptimizeHardware) {
        setSettings(prev => ({
          ...prev,
          effectsEnabled: !hw.isLowEnd,
        }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('celestial-settings', JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const toggleEffects = () => {
    setSettings(prev => ({ 
      ...prev, 
      effectsEnabled: !prev.effectsEnabled,
      // If user manually toggles effects, remember that they took manual control
      autoOptimizeHardware: false 
    }));
  };

  const setAutoOptimizeHardware = (enabled: boolean) => {
    setSettings(prev => {
      const newEffects = enabled ? !deviceInfo.isLowEnd : prev.effectsEnabled;
      return {
        ...prev,
        autoOptimizeHardware: enabled,
        effectsEnabled: newEffects,
      };
    });
  };

  const rebenchmarkDevice = async (): Promise<DeviceHardwareInfo> => {
    setIsBenchmarking(true);
    try {
      const hw = await runHardwareInspection();
      setDeviceInfo(hw);
      if (settings.autoOptimizeHardware) {
        setSettings(prev => ({ ...prev, effectsEnabled: !hw.isLowEnd }));
      }
      return hw;
    } finally {
      setIsBenchmarking(false);
    }
  };

  const toggleSound = () => {
    setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const setAiProvider = (provider: AIProvider) => {
    setSettings(prev => ({
      ...prev,
      aiProvider: provider,
      aiModel: getDefaultModelForProvider(provider),
    }));
  };

  const setAiModel = (model: string) => {
    setSettings(prev => ({ ...prev, aiModel: model }));
  };

  const setAllowFallback = (allow: boolean) => {
    setSettings(prev => ({ ...prev, allowFallback: allow }));
  };

  const setCustomKey = (provider: keyof CustomApiKeys, key: string) => {
    setSettings(prev => ({
      ...prev,
      customKeys: {
        ...prev.customKeys,
        [provider]: key.trim(),
      },
    }));
  };

  const setTarotDeckStyle = (style: TarotDeckStyle) => {
    setSettings(prev => ({ ...prev, tarotDeckStyle: style }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        deviceInfo,
        isBenchmarking,
        toggleTheme,
        toggleEffects,
        toggleSound,
        setAutoOptimizeHardware,
        rebenchmarkDevice,
        setAiProvider,
        setAiModel,
        setAllowFallback,
        setCustomKey,
        setTarotDeckStyle,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
