import React, { useState, useEffect } from 'react';
import { JournalConfig } from './types';
import { DEFAULT_CONFIG, decodeConfig } from './data';
import ScrapbookFrame from './components/ScrapbookFrame';
import PersonalizePanel from './components/PersonalizePanel';
import { romanticThemePlayer } from './utils/audio';

export default function App() {
  const [config, setConfig] = useState<JournalConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    // 1. Check URL Hash for shared customized pages
    const loadFromHashAndLocation = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#story=')) {
        const hashStr = hash.replace('#story=', '');
        const decoded = decodeConfig(hashStr);
        if (decoded) {
          setConfig(decoded);
          // Save loaded custom setup as safe fallback
          localStorage.setItem('love_story_config', JSON.stringify(decoded));
          return;
        }
      }

      // 2. Fallback to LocalStorage
      const cached = localStorage.getItem('love_story_config');
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as JournalConfig;
          if (parsed && Array.isArray(parsed.slides)) {
            setConfig(parsed);
          }
        } catch (e) {
          console.warn('Failed to parse cached love story config', e);
        }
      }
    };

    loadFromHashAndLocation();

    // Listen for hash changes if sharing in real-time
    window.addEventListener('hashchange', loadFromHashAndLocation);
    
    return () => {
      window.removeEventListener('hashchange', loadFromHashAndLocation);
      // Ensure audio resources are released if unmounted
      romanticThemePlayer.stop();
    };
  }, []);

  const handleSaveConfig = (newConfig: JournalConfig) => {
    setConfig(newConfig);
    localStorage.setItem('love_story_config', JSON.stringify(newConfig));
    // Clear hash on saving customized setup so it doesn't conflict
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem('love_story_config');
  };

  return (
    <main className="w-full min-h-screen">
      {/* Principal interactive slide container */}
      <ScrapbookFrame config={config} onSave={handleSaveConfig} />

      {/* Love Customize control panel */}
      <PersonalizePanel 
        config={config} 
        onSave={handleSaveConfig} 
        onReset={handleResetConfig} 
      />
    </main>
  );
}
