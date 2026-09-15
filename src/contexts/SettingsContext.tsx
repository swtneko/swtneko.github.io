import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, AIProvider, CustomApiKeys, TarotDeckStyle } from '../types';

interface SettingsContextType {
  settings: AppSettings;
  toggleTheme: () => void;
  toggleEffects: () => void;
  toggleSound: () => void;
  setAiProvider: (provider: AIProvider) => void;
  setAiModel: (model: string) => void;
  setAllowFallback: (allow: boolean) => void;
  setCustomKey: (provider: keyof CustomApiKeys, key: string) => void;
  setTarotDeckStyle: (style: TarotDeckStyle) => void;
}

const getDefaultModelForProvider = (provider: AIProvider): string => {
  switch (provider) {
    case 'gemini': return 'gemini-3.8-flash';
    case 'groq': return 'llama-3.3-70b-versatile';
    case 'deepseek': return 'deepseek-chat';
    case 'openai': return 'gpt-4o-mini';
    case 'openrouter': return 'openrouter/free';
    default: return 'auto';
  }
};

const defaultSettings: AppSettings = {
  theme: 'dark',
  effectsEnabled: true,
  soundEnabled: true,
  aiProvider: 'auto',
  aiModel: 'auto',
  allowFallback: true,
  customKeys: {},
  tarotDeckStyle: 'rider-waite',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('celestial-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultSettings,
          ...parsed,
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
    return defaultSettings;
  });

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
    setSettings(prev => ({ ...prev, effectsEnabled: !prev.effectsEnabled }));
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
        toggleTheme,
        toggleEffects,
        toggleSound,
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
