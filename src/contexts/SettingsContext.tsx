import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, AIProvider, CustomApiKeys, TarotDeckStyle } from '../types';
import { detectDeviceHardware, runHardwareInspection, DeviceHardwareInfo } from '../utils/deviceBenchmark';

interface SettingsContextType {
  settings: AppSettings;
  deviceInfo: DeviceHardwareInfo;
  isBenchmarking: boolean;
  toggleTheme: () => void;
  toggleEffects: () => void;
  setEffectsEnabled: (enabled: boolean) => void;
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
    case 'gemini': return 'gemini-flash-latest';
    case 'openrouter': return 'openrouter/free';
    default: return 'auto';
  }
};

const defaultSettings: AppSettings = {
  theme: 'dark',
  effectsEnabled: true,
  autoOptimizeHardware: false, // Default false to strictly preserve user's choice
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
    try {
      const saved = localStorage.getItem('celestial-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // CRITICAL FIX: If user explicitly configured effectsEnabled, ALWAYS honor it without override!
        const effectsVal = typeof parsed.effectsEnabled === 'boolean'
          ? parsed.effectsEnabled
          : true;

        return {
          ...defaultSettings,
          ...parsed,
          effectsEnabled: effectsVal,
          autoOptimizeHardware: parsed.autoOptimizeHardware ?? false,
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
    // Default initial load: effects enabled by default
    return {
      ...defaultSettings,
      effectsEnabled: true,
      autoOptimizeHardware: false,
    };
  });

  // Background hardware inspection for informational stats only - NEVER silently override user's effects setting!
  useEffect(() => {
    let isMounted = true;
    runHardwareInspection().then((hw) => {
      if (!isMounted) return;
      setDeviceInfo(hw);
      // Only tune if user explicitly enabled auto-hardware optimization and has NOT set effects manually
      setSettings(prev => {
        if (!prev.autoOptimizeHardware) return prev;
        return {
          ...prev,
          effectsEnabled: !hw.isLowEnd,
        };
      });
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('celestial-settings', JSON.stringify(settings));
    } catch (e) {}
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
    setSettings(prev => {
      const nextVal = !prev.effectsEnabled;
      const updated = {
        ...prev,
        effectsEnabled: nextVal,
        autoOptimizeHardware: false, // User took manual control
      };
      try {
        localStorage.setItem('celestial-settings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const setEffectsEnabled = (enabled: boolean) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        effectsEnabled: enabled,
        autoOptimizeHardware: false,
      };
      try {
        localStorage.setItem('celestial-settings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const setAutoOptimizeHardware = (enabled: boolean) => {
    setSettings(prev => {
      const newEffects = enabled ? !deviceInfo.isLowEnd : prev.effectsEnabled;
      const updated = {
        ...prev,
        autoOptimizeHardware: enabled,
        effectsEnabled: newEffects,
      };
      try {
        localStorage.setItem('celestial-settings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
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
        setEffectsEnabled,
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
