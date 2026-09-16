import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const geminiKeys = env.GEMINI_API_KEYS || env.GEMINI_API_KEY || process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  const deepseekKey = env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || env.VITE_DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || '';
  const groqKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '';
  const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '';
  const openrouterKey = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || '';
  const ninerouterKey = env.NINEROUTER_API_KEY || process.env.NINEROUTER_API_KEY || env.VITE_NINEROUTER_API_KEY || process.env.VITE_NINEROUTER_API_KEY || env['9ROUTER_API_KEY'] || process.env['9ROUTER_API_KEY'] || '';
  const ninerouterBase = env.NINEROUTER_API_BASE || process.env.NINEROUTER_API_BASE || env.VITE_NINEROUTER_API_BASE || process.env.VITE_NINEROUTER_API_BASE || env.NINEROUTER_BASE_URL || process.env.NINEROUTER_BASE_URL || env['9ROUTER_API_BASE'] || process.env['9ROUTER_API_BASE'] || '';

  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKeys),
      'process.env.GEMINI_API_KEYS': JSON.stringify(geminiKeys),
      'process.env.DEEPSEEK_API_KEY': JSON.stringify(deepseekKey),
      'process.env.GROQ_API_KEY': JSON.stringify(groqKey),
      'process.env.OPENAI_API_KEY': JSON.stringify(openaiKey),
      'process.env.OPENROUTER_API_KEY': JSON.stringify(openrouterKey),
      'process.env.NINEROUTER_API_KEY': JSON.stringify(ninerouterKey),
      'process.env.NINEROUTER_API_BASE': JSON.stringify(ninerouterBase),
      'process.env.VITE_APP_URL': JSON.stringify(env.VITE_APP_URL || process.env.VITE_APP_URL || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
