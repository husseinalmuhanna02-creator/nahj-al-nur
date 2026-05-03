/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getHijriDate, getPrayerTimes } from '../services/prayerService';
import { Clock, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

import { countries } from '../data/locations';

const Home: React.FC = () => {
  const { settings } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const isAr = settings.language === 'ar';

  // Find coordinates based on selected city/country
  const selectedCountry = countries.find(c => c.nameEn === settings.country) || countries[0];
  const selectedCity = selectedCountry.cities.find(c => c.nameEn === settings.city) || selectedCountry.cities[0];
  
  const coords = { lat: selectedCity.lat, lng: selectedCity.lng };
  const prayers = getPrayerTimes(coords);
  const hijri = getHijriDate(settings.hijriOffset, isAr ? 'ar' : 'en');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerList = [
    { name: isAr ? 'الفجر' : 'Fajr', time: prayers.fajr },
    { name: isAr ? 'الشروق' : 'Sunrise', time: prayers.sunrise },
    { name: isAr ? 'الإشراق' : 'Ishraq', time: new Date(prayers.sunrise.getTime() + 20 * 60 * 1000) },
    { name: isAr ? 'الظهر' : 'Dhuhr', time: prayers.dhuhr },
    { name: isAr ? 'العصر' : 'Asr', time: prayers.asr },
    { name: isAr ? 'المغرب' : 'Maghrib', time: prayers.maghrib },
    { name: isAr ? 'العشاء' : 'Isha', time: prayers.isha },
  ];

  // Find next prayer
  const nextPrayer = prayerList.find(p => p.time > currentTime) || prayerList[0];
  const diff = nextPrayer.time.getTime() - currentTime.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  const glassCardClasses = "bg-white/40 dark:bg-dark-card/40 backdrop-blur-3xl rounded-[40px] p-8 border border-white/40 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all hover:bg-white/50 dark:hover:bg-dark-card/50";

  return (
    <div className="p-6 flex flex-col gap-10 max-w-lg mx-auto w-full">
      {/* Header Section */}
      <header className="flex justify-between items-center border-b border-natural-accent/20 pb-4">
        <div className="flex flex-col gap-1">
          <img src="https://i.postimg.cc/W3GNBg1D/Picsart-26-05-03-03-32-46-424.jpg" alt="شعار" className="w-12 h-12 rounded-xl mb-2 shadow-sm" />
          <h1 className="text-4xl font-black text-natural-dark dark:text-natural-light">
            <span className="text-[9px] text-natural-accent dark:text-natural-accent-dark block mb-1">
              Nahj Al-Nur &bull; Path of Light
            </span>
          </h1>
        </div>

        <div className="text-left flex items-center gap-4">
          <div className="text-right flex flex-col items-end">
            <p id="hijri-date" className="text-base font-black text-natural-dark dark:text-white leading-tight">
              {hijri}
            </p>
            <p id="gregorian-date" className="text-[10px] text-natural-dark/50 dark:text-white/40 font-black uppercase tracking-tight">
              {format(currentTime, isAr ? 'EEEE، d MMMM' : 'EEEE, d MMMM')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-md flex items-center justify-center text-natural-dark dark:text-white shadow-lg border border-white/20">
            <Clock size={20} />
          </div>
        </div>
      </header>

      {/* Hero Section / Next Prayer */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/50 dark:bg-dark-card/50 backdrop-blur-3xl rounded-[48px] p-12 border border-white/50 dark:border-white/10 flex flex-col items-center justify-center relative shadow-[0_48px_96px_-24px_rgba(0,0,0,0.2)] text-center overflow-hidden"
      >
        {/* Animated Glows */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 right-0 w-48 h-48 bg-natural-accent/30 dark:bg-dark-accent/20 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-48 h-48 bg-natural-dark/20 dark:bg-dark-accent/10 blur-[80px] rounded-full -ml-20 -mb-20 pointer-events-none" 
        />

        <div className="absolute top-8 text-natural-accent dark:text-dark-accent text-[11px] font-black tracking-[0.4em] uppercase opacity-80">
          {isAr ? 'الصلاة القادمة' : 'Next Prayer'}
        </div>
        
        <div className="flex flex-col items-center gap-2 mb-8 mt-6 relative z-10">
          <h3 className="text-7xl font-black text-natural-dark dark:text-white font-serif-header tracking-tighter drop-shadow-md">
            {nextPrayer.name}
          </h3>
          <div className="bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
            <div className="w-2 h-2 bg-natural-accent dark:bg-dark-accent rounded-full animate-pulse" />
            <p className="text-[11px] font-black text-natural-dark/60 dark:text-white/50 uppercase tracking-widest font-mono">
              -{String(hours).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="text-4xl font-mono font-black text-natural-accent dark:text-dark-accent bg-white/40 dark:bg-black/20 backdrop-blur-2xl px-12 py-5 rounded-[32px] border border-white/50 dark:border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] relative z-10 transition-all hover:scale-110 active:scale-95 group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]" />
          {format(nextPrayer.time, 'HH:mm')}
        </div>
      </motion.div>

      {/* Grid of Prayers (Quick View) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={glassCardClasses}
      >
        <div className="flex flex-col gap-1 mb-8">
          <h2 className="text-lg font-black text-natural-dark dark:text-white uppercase tracking-tight">
            {isAr ? 'جدول الصلوات' : "Prayer Schedule"}
          </h2>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-natural-dark/40 dark:text-white/30">
             <MapPin size={10} />
             <span>{settings.city}, {settings.country}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {prayerList.filter(p => !['Sunrise', 'الشروق'].includes(p.name)).map((p) => {
            const isNext = p === nextPrayer;
            return (
              <div 
                key={p.name}
                className={`flex flex-col items-center gap-2 p-3 rounded-[24px] border transition-all duration-300 ${
                  isNext 
                  ? 'bg-natural-dark dark:bg-dark-accent text-white border-transparent shadow-xl scale-110 z-10' 
                  : 'bg-white/40 dark:bg-black/20 text-natural-dark dark:text-white border-white/40 dark:border-white/5'
                }`}
              >
                <span className={`text-[8px] font-black uppercase ${isNext ? 'opacity-70' : 'opacity-40'}`}>{p.name}</span>
                <span className={`text-xs font-mono font-black tabular-nums tracking-tighter ${isNext ? 'text-white' : ''}`}>
                  {format(p.time, 'HH:mm')}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Detailed Schedule List */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-natural-dark/40 dark:text-white/30 uppercase tracking-[0.3em] ml-4 flex items-center gap-4">
          {isAr ? 'تفاصيل المواعيد' : 'Full Daily Schedule'}
          <div className="flex-1 h-[1px] bg-natural-dark/10 dark:bg-white/10" />
        </h3>
        <div className="grid gap-3">
          {prayerList.map((p, i) => {
            const isNext = p === nextPrayer;
            return (
              <motion.div
                key={p.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`flex justify-between items-center p-6 rounded-[32px] border backdrop-blur-3xl transition-all duration-500 overflow-hidden relative group ${
                  isNext 
                  ? 'bg-natural-dark dark:bg-dark-accent text-white shadow-[0_24px_48px_-12px_rgba(180,83,9,0.4)] scale-[1.05] border-transparent z-10' 
                  : 'bg-white/50 dark:bg-dark-card/40 text-natural-dark dark:text-white border-white/40 dark:border-white/5 hover:bg-white/70'
                }`}
              >
                {isNext && (
                  <motion.div 
                    animate={{ x: [-200, 400] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" 
                  />
                )}
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-2 h-2 rounded-full ${isNext ? 'bg-white animate-pulse' : 'bg-natural-accent dark:bg-dark-accent opacity-40'}`} />
                  <span className={`font-black text-base tracking-tight ${isNext ? 'text-white' : 'text-natural-dark/70 dark:text-white/70 uppercase tracking-widest'}`}>
                    {p.name}
                  </span>
                </div>
                <div className="flex flex-col items-end relative z-10">
                  <span className={`font-mono font-black tabular-nums transition-all ${isNext ? 'text-3xl' : 'text-xl'}`}>
                    {format(p.time, 'HH:mm')}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
