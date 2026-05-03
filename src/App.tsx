/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from 'motion/react';
import { Book, Compass, Home as HomeIcon, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import Home from './components/Home';
import Tasbih from './components/Tasbih';
import Library from './components/Library';
import Settings from './components/Settings';
import Qibla from './components/Qibla';

function MainLayout() {
  const { activeTab, setActiveTab, settings } = useApp();
  const isAr = settings.language === 'ar';

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'tasbih': return <Tasbih />;
      case 'library': return <Library />;
      case 'qibla': return <Qibla />;
      case 'settings': return <Settings />;
      default: return <Home />;
    }
  };

  const navItems = [
    { id: 'home', icon: HomeIcon, label: isAr ? 'الرئيسية' : 'Home' },
    { id: 'tasbih', icon: Sparkles, label: isAr ? 'المسبحة' : 'Tasbih' },
    { id: 'qibla', icon: Compass, label: isAr ? 'القبلة' : 'Qibla' },
    { id: 'library', icon: Book, label: isAr ? 'المكتبة' : 'Library' },
    { id: 'settings', icon: SettingsIcon, label: isAr ? 'الإعدادات' : 'Settings' },
  ];

  return (
    <div 
      className="flex flex-col h-screen bg-natural-bg dark:bg-dark-bg text-natural-text dark:text-dark-text font-sans selection:bg-natural-accent/20 transition-all duration-700 bg-cover bg-center bg-fixed relative overflow-hidden"
      style={settings.backgroundImage ? { backgroundImage: `url(${settings.backgroundImage})` } : {}}
    >
      {/* Background Overlay for better readability */}
      {settings.backgroundImage && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0" />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-40 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="min-h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Glassmorphic */}
      <nav className="fixed bottom-0 left-0 right-0 bg-natural-dark/60 dark:bg-dark-card/60 backdrop-blur-xl px-4 py-3 flex justify-around items-center z-50 shadow-2xl rounded-t-[32px] border-t border-white/10 dark:border-white/5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${
                isActive ? 'text-white scale-110' : 'text-white/60 hover:text-white/80'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-1 w-1 h-1 bg-natural-accent rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

