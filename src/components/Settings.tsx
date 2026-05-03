/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe, Bell, Calendar as CalendarIcon, MapPin, Moon, Sun, Palette, Image as ImageIcon, Music, Play, Pause } from 'lucide-react';
import { motion } from 'motion/react';

import { countries } from '../data/locations';

const BACKGROUNDS = [
  { id: 'default', labelAr: 'الافترضي', labelEn: 'Default', url: '' },
  { id: 'ali', labelAr: 'الإمام علي (ع)', labelEn: 'Imam Ali (as)', url: 'https://i.postimg.cc/mDnj96Mt/c8ec608b86c94b0d962dcf99f5f09048.jpg' },
  { id: 'hussain', labelAr: 'الإمام الحسين (ع)', labelEn: 'Imam Hussain (as)', url: 'https://i.postimg.cc/dVnx16WT/1559205391-2765.jpg' },
  { id: 'abbas', labelAr: 'أبي الفضل العباس (ع)', labelEn: 'Al-Abbas (as)', url: 'https://i.postimg.cc/Dwfxts2X/1602496196-6251.jpg' },
  { id: 'kadhim', labelAr: 'الإمام الكاظم (ع)', labelEn: 'Imam Kadhim (as)', url: 'https://i.postimg.cc/V6tgjWFq/aee5efb133c2eb3dd5321f09b9927743.jpg' },
  { id: 'askari', labelAr: 'الإمام العسكري (ع)', labelEn: 'Imam Askari (as)', url: 'https://i.postimg.cc/ZK4Hd3v7/FB-IMG-1777609747766.jpg' },
];

const MUEZZINS = [
  { nameAr: 'أباذر الحلواچي', nameEn: 'Abather Al-Halwachi', url: 'https://mp4.shabakngy.com/m/m/2-XRbcLQ6b8.mp3' },
  { nameAr: 'نزار القطري', nameEn: 'Nazar Al-Qatari', url: 'https://mp4.shabakngy.com/m/m/F2MwKS9YWqo.mp3' },
  { nameAr: 'ميثم التمار', nameEn: 'Maitham Al-Tamar', url: 'https://mp4.shabakngy.com/m/m/f1E-0dOZgbM.mp3' },
  { nameAr: 'علي الكعبي', nameEn: 'Ali Al-Kaabi', url: 'https://mp3s.shabakngy.com/m/new/coFlsVgI7rQ.mp3' },
  { nameAr: 'أسامة الكربلائي', nameEn: 'Osama Al-Karbalai', url: 'https://mp3s.shabakngy.com/m/new/NElxRnNGxQ8.mp3' },
  { nameAr: 'عامر الكاظمي', nameEn: 'Amer Al-Kazemi', url: 'https://mp4.shabakngy.com/m/m/GuA48u4-MHo.mp3' },
  { nameAr: 'هاني الموسوي', nameEn: 'Hani Al-Mousawi', url: 'https://mp4.shabakngy.com/m/m/nahmgalT3Zo.mp3' },
  { nameAr: 'شبر معله', nameEn: 'Shubbar Maala', url: 'https://mp4.shabakngy.com/m/m/lKK4cOnIitg.mp3' },
  { nameAr: 'روح الله كاظم زاده', nameEn: 'Rohullah Kazimzadeh', url: 'https://mp3s.shabakngy.com/m/new/IUuGAeK5Hi0.mp3' },
  { nameAr: 'حسين علي شريف', nameEn: 'Hussein Ali Sharif', url: 'https://mp4.shabakngy.com/m/m/_nxxDh9BkzQ.mp3' },
];

const Settings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const isAr = settings.language === 'ar';

  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = React.useRef<Promise<void> | null>(null);
  const isProcessingRef = React.useRef(false);

  const togglePreview = async (url: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      // Handle switching to a different audio source or toggling existing
      if (audioRef.current && audioRef.current.src !== url) {
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current;
          } catch (e) {}
        }
        audioRef.current.pause();
        // Instead of removing src and calling load, we just prepare for a new instance
        // or clear if needed. Setting src to empty string or about:blank is safer.
        audioRef.current.src = '';
        setIsPreviewing(false);
        audioRef.current = null;
      }

      if (audioRef.current && audioRef.current.src === url) {
        if (isPreviewing) {
          if (playPromiseRef.current) {
            try {
              await playPromiseRef.current;
            } catch (e) {}
          }
          audioRef.current.pause();
          setIsPreviewing(false);
        } else {
          try {
            const promise = audioRef.current.play();
            playPromiseRef.current = promise;
            await promise;
            setIsPreviewing(true);
          } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
              console.error("Playback failed:", error.message || error);
            }
          } finally {
            playPromiseRef.current = null;
          }
        }
        return;
      }

      // New audio source
      const newAudio = new Audio(url);
      newAudio.onended = () => setIsPreviewing(false);
      newAudio.onerror = () => {
        console.error("Audio error: source not supported or failed to load");
        setIsPreviewing(false);
        audioRef.current = null;
      };
      audioRef.current = newAudio;
      
      try {
        const promise = newAudio.play();
        playPromiseRef.current = promise;
        await promise;
        setIsPreviewing(true);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Failed to start playback:", error.message || error);
        }
        setIsPreviewing(false);
      } finally {
        playPromiseRef.current = null;
      }
    } finally {
      isProcessingRef.current = false;
    }
  };

  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const selectedCountry = countries.find(c => c.nameEn === settings.country) || countries[0];

  const glassCardClasses = "bg-white/40 dark:bg-dark-card/40 backdrop-blur-2xl rounded-[40px] p-8 border border-white/40 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all hover:bg-white/50 dark:hover:bg-dark-card/50";

  return (
    <div className="p-6 max-w-lg mx-auto flex flex-col gap-10 bg-transparent min-h-full transition-all duration-300 pb-20">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-black text-natural-dark dark:text-white font-serif-header tracking-tight">
          {isAr ? 'الإعدادات' : 'Settings'}
        </h1>
        <p className="text-natural-dark/50 dark:text-white/40 text-[11px] font-black uppercase tracking-[0.2em]">
          {isAr ? 'تخصيص تجربة نهج النور' : 'Customize Nahj Al-Nur Experience'}
        </p>
        <div className="w-12 h-1 bg-natural-accent dark:bg-dark-accent rounded-full" />
      </header>

      <div className="grid gap-8">
        {/* Theme Toggle */}
        <section className={glassCardClasses}>
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-2xl ${settings.theme === 'dark' ? 'bg-dark-accent/20 text-dark-accent' : 'bg-amber-500/10 text-amber-600'}`}>
              {settings.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <h2 className="font-black text-base text-natural-dark dark:text-white">{isAr ? 'المظهر العام' : 'App Theme'}</h2>
          </div>
          <div className="flex bg-black/5 dark:bg-black/20 p-1.5 rounded-[20px] border border-white/10">
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                settings.theme === 'light' ? 'bg-white shadow-xl text-natural-accent' : 'text-natural-dark/40 dark:text-white/40'
              }`}
            >
              <Sun size={16} />
              {isAr ? 'نهاري' : 'Light Mode'}
            </button>
            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                settings.theme === 'dark' ? 'bg-dark-card shadow-xl text-dark-accent' : 'text-natural-dark/40 dark:text-white/40'
              }`}
            >
              <Moon size={16} />
              {isAr ? 'ليلي' : 'Dark Mode'}
            </button>
          </div>
        </section>

        {/* Background Selection Section */}
        <section className={glassCardClasses}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Palette size={20} />
            </div>
            <h2 className="font-black text-base text-natural-dark dark:text-white">{isAr ? 'الخلفية الروحانية' : 'Spiritual Themes'}</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => updateSettings({ backgroundImage: bg.url })}
                className={`relative h-28 rounded-[28px] overflow-hidden border-2 transition-all group ${
                  settings.backgroundImage === bg.url 
                    ? 'border-natural-accent dark:border-dark-accent scale-[1.05] shadow-[0_20px_40px_-10px_rgba(180,83,9,0.3)] z-10' 
                    : 'border-white/20 dark:border-white/5 hover:border-white/40'
                }`}
              >
                {bg.url ? (
                  <img src={bg.url} alt={bg.labelEn} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" />
                ) : (
                  <div className="w-full h-full bg-white/20 dark:bg-black/20 flex items-center justify-center">
                    <ImageIcon className="text-natural-dark/20 dark:text-white/10" size={28} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-4">
                   <div className="flex flex-col items-start translate-y-1 group-hover:translate-y-0 transition-transform">
                     <span className="text-[10px] font-black text-white/90 drop-shadow-md">{isAr ? bg.labelAr : bg.labelEn}</span>
                     {settings.backgroundImage === bg.url && <span className="text-[8px] font-black text-natural-accent/90 uppercase tracking-tighter">{isAr ? 'مُفعّل' : 'Active'}</span>}
                   </div>
                </div>
                {settings.backgroundImage === bg.url && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-natural-accent dark:bg-dark-accent rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/10 animate-scale-in">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Language Selection */}
        <section className={glassCardClasses}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <Globe size={20} />
            </div>
            <h2 className="font-black text-base text-natural-dark dark:text-white">{isAr ? 'اللغة والتطبيق' : 'Language'}</h2>
          </div>
          <div className="flex bg-black/5 dark:bg-black/20 p-1.5 rounded-[20px] border border-white/10">
            <button
              onClick={() => updateSettings({ language: 'ar' })}
              className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                settings.language === 'ar' ? 'bg-white shadow-xl text-natural-accent' : 'text-natural-dark/40 dark:text-white/40'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => updateSettings({ language: 'en' })}
              className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                settings.language === 'en' ? 'bg-white shadow-xl text-natural-accent' : 'text-natural-dark/40 dark:text-white/40'
              }`}
            >
              English
            </button>
          </div>
        </section>

        {/* Location Section */}
        <section className={glassCardClasses}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <MapPin size={20} />
            </div>
            <h2 className="font-black text-base text-natural-dark dark:text-white">{isAr ? 'الموقع الجغرافي' : 'Location Settings'}</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center py-1">
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-natural-dark/70 dark:text-white/50 uppercase tracking-[0.1em]">
                  {isAr ? 'تحديث تلقائي للموقع' : 'Auto-Detect Location'}
                </span>
                <p className="text-[9px] font-bold text-natural-dark/40 dark:text-white/30">{isAr ? 'استخدام مستشعر الـ GPS' : 'Use device GPS sensor'}</p>
              </div>
              <button 
                onClick={() => updateSettings({ autoLocation: !settings.autoLocation })}
                className={`w-14 h-8 rounded-full transition-all relative border border-white/20 ${settings.autoLocation ? 'bg-natural-dark dark:bg-dark-accent' : 'bg-black/5 dark:bg-white/5'}`}
              >
                <motion.div 
                  animate={{ x: settings.autoLocation ? 28 : 4 }}
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-2xl"
                />
              </button>
            </div>

            {!settings.autoLocation ? (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-5 pt-6 border-t border-white/10"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-natural-dark/40 dark:text-white/30 uppercase tracking-[0.2em] ml-2">
                    {isAr ? 'اختيار الدولة' : 'Select Country'}
                  </label>
                  <select 
                    value={settings.country}
                    onChange={(e) => {
                      const newCountry = e.target.value;
                      const countryData = countries.find(c => c.nameEn === newCountry);
                      updateSettings({ 
                        country: newCountry, 
                        city: countryData ? countryData.cities[0].nameEn : settings.city 
                      });
                    }}
                    className="w-full bg-white/40 dark:bg-black/20 p-4 rounded-[20px] border border-white/20 dark:border-white/10 text-natural-dark dark:text-white text-sm font-black focus:outline-none backdrop-blur-md"
                  >
                    {countries.map(c => (
                      <option key={c.nameEn} value={c.nameEn} className="bg-white dark:bg-dark-card">{isAr ? c.nameAr : c.nameEn}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-natural-dark/40 dark:text-white/30 uppercase tracking-[0.2em] ml-2">
                    {isAr ? 'اختيار المدينة' : 'Select City'}
                  </label>
                  <select 
                    value={settings.city}
                    onChange={(e) => updateSettings({ city: e.target.value })}
                    className="w-full bg-white/40 dark:bg-black/20 p-4 rounded-[20px] border border-white/20 dark:border-white/10 text-natural-dark dark:text-white text-sm font-black focus:outline-none backdrop-blur-md"
                  >
                    {selectedCountry.cities.map(city => (
                      <option key={city.nameEn} value={city.nameEn} className="bg-white dark:bg-dark-card">{isAr ? city.nameAr : city.nameEn}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white/40 dark:bg-black/20 p-5 rounded-[24px] border border-white/20 flex items-center justify-between shadow-inner">
                <div className="flex flex-col">
                  <span className="text-base font-black text-natural-dark dark:text-white">{settings.city}</span>
                  <span className="text-[9px] font-black text-natural-accent dark:text-dark-accent uppercase tracking-[0.2em]">
                    {isAr ? 'تم التحديد عبر الـ GPS' : 'Detected via GPS'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-natural-accent/20 flex items-center justify-center shadow-lg">
                  <MapPin size={18} className="text-natural-accent" />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Hijri Adjustment */}
        <section className={glassCardClasses}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <CalendarIcon size={20} />
            </div>
            <h2 className="font-black text-base text-natural-dark dark:text-white">{isAr ? 'التاريخ الهجري' : 'Hijri Offset'}</h2>
          </div>
          <div className="flex items-center justify-between bg-black/5 dark:bg-black/20 p-5 rounded-[28px] border border-white/10">
            <button 
              onClick={() => updateSettings({ hijriOffset: settings.hijriOffset - 1 })}
              className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-natural-accent dark:text-dark-accent font-black text-2xl active:scale-90 transition-all hover:bg-natural-accent hover:text-white"
            >
              -
            </button>
            <div className="text-center">
              <span className="text-4xl font-mono font-black text-natural-dark dark:text-white tabular-nums tracking-tighter">
                {settings.hijriOffset > 0 ? `+${settings.hijriOffset}` : settings.hijriOffset}
              </span>
              <p className="text-[9px] text-natural-dark/40 dark:text-white/30 font-black uppercase tracking-[0.2em] mt-1">{isAr ? 'أيام' : 'Days'}</p>
            </div>
            <button 
              onClick={() => updateSettings({ hijriOffset: settings.hijriOffset + 1 })}
              className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-natural-accent dark:text-dark-accent font-black text-2xl active:scale-90 transition-all hover:bg-natural-accent hover:text-white"
            >
              +
            </button>
          </div>
        </section>

        {/* Prayer Time Notifications */}
        <section className={glassCardClasses}>
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 shadow-sm border border-rose-500/20">
              <Bell size={20} />
            </div>
            <div className="flex flex-col">
              <h2 className="font-black text-lg text-natural-dark dark:text-white leading-none">
                {isAr ? 'تنبيهات الصلاة' : 'Prayer Notifications'}
              </h2>
              <p className="text-[10px] font-bold text-natural-dark/40 dark:text-white/30 uppercase tracking-[0.1em] mt-1">
                {isAr ? 'تخصيص إشعارات الأذان' : 'Manage Azan Alerts'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Notification Permission Info */}
            <div className="flex items-center gap-4 p-4 rounded-[24px] bg-amber-500/5 border border-amber-500/10 mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <Bell size={18} className="text-amber-600" />
              </div>
              <p className="text-[11px] font-bold text-amber-900/60 dark:text-amber-200/40 leading-relaxed">
                {isAr 
                  ? 'تأكد من السماح للمتصفح بإرسال الإشعارات لتفعيل هذه الميزة.' 
                  : 'Please ensure browser notification permissions are granted to receive alerts.'}
              </p>
            </div>

            {Object.entries(settings.adhanEnabled).map(([key, val]) => {
              const prayerLabels: Record<string, { ar: string, en: string, icon: React.ReactNode }> = {
                fajr: { ar: 'الفجر', en: 'Fajr', icon: <div className="w-2 h-2 rounded-full bg-blue-400" /> },
                dhuhr: { ar: 'الظهر', en: 'Dhuhr', icon: <div className="w-2 h-2 rounded-full bg-amber-400" /> },
                asr: { ar: 'العصر', en: 'Asr', icon: <div className="w-2 h-2 rounded-full bg-orange-400" /> },
                maghrib: { ar: 'المغرب', en: 'Maghrib', icon: <div className="w-2 h-2 rounded-full bg-indigo-500" /> },
                isha: { ar: 'العشاء', en: 'Isha', icon: <div className="w-2 h-2 rounded-full bg-slate-800" /> }
              };
              
              const info = prayerLabels[key as keyof typeof prayerLabels] || { ar: key, en: key, icon: null };
              const label = isAr ? info.ar : info.en;

              return (
                <div 
                  key={key} 
                  className={`flex justify-between items-center p-4 rounded-[28px] border transition-all duration-300 group ${
                    val 
                    ? 'bg-white/60 dark:bg-black/20 border-white/40 dark:border-white/10 shadow-sm' 
                    : 'bg-black/5 dark:bg-white/5 border-transparent opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl transition-all ${val ? 'bg-white shadow-md scale-110' : 'bg-transparent'}`}>
                      {info.icon}
                    </div>
                    <span className={`text-sm font-black uppercase tracking-tight ${val ? 'text-natural-dark dark:text-white' : 'text-natural-dark/40 dark:text-white/20'}`}>
                      {label}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => updateSettings({ 
                      adhanEnabled: { ...settings.adhanEnabled, [key]: !val } 
                    })}
                    className={`w-14 h-8 rounded-full transition-all relative border-2 ${
                      val 
                      ? 'bg-natural-dark dark:bg-dark-accent border-transparent' 
                      : 'bg-transparent border-natural-dark/20 dark:border-white/20'
                    }`}
                  >
                    <motion.div 
                      animate={{ x: val ? 26 : 4 }}
                      className={`absolute top-1 w-5 h-5 rounded-full shadow-2xl transition-colors ${
                        val ? 'bg-white' : 'bg-natural-dark/20 dark:bg-white/20'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Adhan Voice Selection */}
        <section className={glassCardClasses}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-500">
              <Music size={20} />
            </div>
            <h2 className="font-black text-base text-natural-dark dark:text-white">{isAr ? 'صوت الأذان' : 'Adhan Voice'}</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative">
              <select
                value={settings.selectedAdhanUrl}
                onChange={(e) => updateSettings({ selectedAdhanUrl: e.target.value })}
                className="w-full bg-white/40 dark:bg-black/20 p-4 pl-12 pr-12 rounded-[24px] border border-white/20 dark:border-white/10 text-natural-dark dark:text-white text-sm font-black focus:outline-none backdrop-blur-md appearance-none rtl:text-right"
              >
                {MUEZZINS.map((m) => (
                  <option key={m.url} value={m.url} className="bg-white dark:bg-dark-card">
                    {isAr ? m.nameAr : m.nameEn}
                  </option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-natural-dark/40 dark:text-white/40">
                <Music size={18} />
              </div>
              <button
                onClick={() => togglePreview(settings.selectedAdhanUrl || MUEZZINS[0].url)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-natural-accent dark:bg-dark-accent text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                title={isAr ? 'معاينة الصوت' : 'Preview Voice'}
              >
                {isPreviewing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              </button>
            </div>
          </div>
        </section>

      </div>
      
      <div className="text-center flex flex-col items-center gap-3 mt-12 mb-10">
        <p className="text-[10px] font-black text-natural-dark/40 dark:text-white/30 uppercase tracking-[0.4em]">Nahj al-Nur v1.1.2</p>
        <div className="w-16 h-1 bg-natural-accent/40 rounded-full" />
      </div>
    </div>
  );
};

export default Settings;
