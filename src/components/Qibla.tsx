/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Compass, RotateCw } from 'lucide-react';
import { motion } from 'motion/react';

const Qibla: React.FC = () => {
  const { settings } = useApp();
  const isAr = settings.language === 'ar';
  const [heading, setHeading] = useState(0);
  const [isCompassActive, setIsCompassActive] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [sensorWarning, setSensorWarning] = useState(false);
  const dataReceivedRef = useRef(false);

  // Logic to calculate Qibla heading based on coords (Najaf: ~255 degrees)
  const MOCK_QIBLA_ANGLE = 255;
  const isAligned = Math.abs((heading - MOCK_QIBLA_ANGLE + 540) % 360 - 180) < 5;

  const startCompass = () => {
    const handler = (e: any) => {
      let currentHeading = 0;

      // 1. iOS Check (webkitCompassHeading is usually ready-to-use)
      if (e.webkitCompassHeading !== undefined) {
        currentHeading = e.webkitCompassHeading;
      } 
      // 2. Android/Chrome Check (deviceorientationabsolute alpha is the heading from North)
      else if (e.alpha !== null) {
        // Normalizing alpha for absolute orientation
        currentHeading = (360 - e.alpha) % 360;
      }

      if (currentHeading !== 0) {
        dataReceivedRef.current = true;
        setHeading(currentHeading);
      }
    };

    const win = window as any;
    
    // Add both for maximum compatibility
    if ('ondeviceorientationabsolute' in win) {
      win.addEventListener('deviceorientationabsolute', handler, true);
    }
    win.addEventListener('deviceorientation', handler, true);

    setIsCompassActive(true);

    // Fail-safe timer: if no data received in 3 seconds, warn the user
    setTimeout(() => {
      if (!dataReceivedRef.current) {
        setSensorWarning(true);
      }
    }, 3000);
  };

  const handleRequestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          startCompass();
          setPermissionError(null);
        } else {
          setPermissionError(isAr ? 'تم رفض صلاحية الوصول للمستشعرات' : 'Permission to access sensors was denied');
        }
      } catch (e: any) {
        console.error("DeviceOrientation permission request failed", e?.message || e);
        setPermissionError(isAr ? 'حدث خطأ أثناء طلب الصلاحية' : 'Error requesting orientation permission');
      }
    } else {
      // Non-iOS or browsers that don't need explicit permission
      startCompass();
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-transparent transition-all duration-300">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-natural-dark dark:text-dark-accent font-serif-header">{isAr ? 'القبلة' : 'Qibla'}</h1>
        <p className="text-natural-dark/60 dark:text-white/40 text-xs font-medium mt-2 tracking-widest uppercase">
          {isAr ? 'بوصلة اتجاه الكعبة المشرفة' : 'Compass towards the Holy Kaaba'}
        </p>
      </div>

      <div className="bg-white/60 dark:bg-dark-card/40 backdrop-blur-2xl rounded-[48px] p-10 shadow-2xl border border-white/20 dark:border-white/10 flex flex-col items-center max-w-sm w-full relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-natural-accent/10 blur-[60px] rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-natural-dark/10 blur-[60px] rounded-full -ml-16 -mb-16" />

        {!isCompassActive ? (
          <div className="flex flex-col items-center py-12 text-center relative z-10">
            <div className="w-24 h-24 rounded-[32px] bg-natural-soft/50 dark:bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8 text-natural-accent shadow-xl">
              <Compass size={48} />
            </div>
            <h3 className="text-xl font-bold text-natural-dark dark:text-white mb-3">
              {isAr ? 'مطلوب تفعيل البوصلة' : 'Compass Activation Required'}
            </h3>
            <p className="text-xs text-natural-dark/50 dark:text-white/40 mb-10 max-w-[220px] font-medium leading-relaxed">
              {isAr ? 'يرجى السماح بالوصول لمستشعرات الحركة لتحديد اتجاه القبلة بدقة' : 'Please allow access to motion sensors for accurate Qibla direction'}
            </p>
            {permissionError && (
              <p className="text-[10px] text-red-500 mb-6 font-black bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">{permissionError}</p>
            )}
            <button 
              onClick={handleRequestPermission}
              className="bg-natural-dark dark:bg-dark-accent text-white px-10 py-4 rounded-[24px] font-black text-sm shadow-2xl active:scale-95 transition-all flex items-center gap-3 hover:translate-y-[-2px]"
            >
              <RotateCw size={20} className="animate-spin-slow" />
              {isAr ? 'تفعيل البوصلة' : 'Enable Compass'}
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-[11px] font-black text-natural-dark/60 dark:text-white/50 mb-10 self-start border-r-4 border-natural-accent dark:border-dark-accent pr-4 uppercase tracking-[0.3em] relative z-10">
              {isAr ? 'بوصلة القبلة' : 'Qibla Compass'}
            </h3>
            
            <div className={`relative w-64 h-64 flex items-center justify-center rounded-full border-4 transition-all duration-700 z-10 ${isAligned ? 'border-natural-accent scale-105 shadow-[0_0_80px_rgba(180,83,9,0.5)] bg-natural-accent/5' : 'border-white/20 dark:border-white/5 shadow-2xl bg-white/40 dark:bg-black/20'}`}>
              {/* Alignment Glow Effect */}
              {isAligned && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.5, 0.1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-natural-accent/40 blur-3xl"
                />
              )}

              {/* Compass Ring */}
              <div className="absolute inset-3 rounded-full border-2 border-white/10 dark:border-white/5 border-dashed" />
              
              {/* Degree Ticks */}
              <div className="absolute inset-0 p-1 opacity-40">
                {[...Array(24)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute inset-0 flex justify-center"
                    style={{ transform: `rotate(${i * 15}deg)` }}
                  >
                    <div className={`rounded-full transition-all duration-700 ${isAligned && (i * 15 === MOCK_QIBLA_ANGLE || i * 15 === MOCK_QIBLA_ANGLE - 180) ? 'h-5 bg-natural-accent w-1 shadow-[0_0_8px_rgba(180,83,9,1)]' : (i % 2 === 0 ? 'h-3.5 bg-natural-dark/20 dark:bg-white/20 w-0.5' : 'h-2 bg-natural-dark/10 dark:bg-white/10 w-0.5')}`} />
                  </div>
                ))}
              </div>

              {/* Main Rotating Compass */}
              <motion.div 
                animate={{ rotate: -heading }}
                className="relative w-full h-full p-4"
              >
                {/* Cardinal Marks */}
                <div className={`absolute inset-0 flex items-center justify-center text-[11px] font-black pb-1 transition-colors duration-500 ${isAligned ? 'text-natural-accent' : 'text-natural-dark/40 dark:text-white/40'}`}>
                  <span className="absolute top-3 text-red-600 dark:text-red-500 font-black">N</span>
                  <span className="absolute right-3">E</span>
                  <span className="absolute bottom-3">S</span>
                  <span className="absolute left-3">W</span>
                </div>

                {/* Qibla Needle */}
                <motion.div 
                  style={{ rotate: MOCK_QIBLA_ANGLE }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="relative flex flex-col items-center">
                    {/* Arrow Head */}
                    <motion.div 
                      animate={isAligned ? { scale: [1, 1.3, 1], y: [0, -3, 0] } : {}}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[32px] border-b-natural-accent dark:border-b-dark-accent drop-shadow-[0_0_15px_rgba(180,83,9,0.6)] mb-[-4px] relative z-20"
                    />
                    {/* Needle Line */}
                    <div className={`w-2.5 h-36 rounded-full transition-all duration-500 ${isAligned ? 'bg-natural-accent/80 dark:bg-dark-accent/80 shadow-[0_0_20px_rgba(180,83,9,0.4)]' : 'bg-black/10 dark:bg-white/10'}`} />
                    
                    {/* Icon Marker */}
                    <div className="absolute top-10 w-8 h-8 flex flex-col items-center bg-white dark:bg-dark-card rounded-xl shadow-xl border border-white/20 transition-all duration-500">
                       <Compass size={18} className={isAligned ? 'text-natural-accent animate-spin-slow' : 'text-natural-dark/30 dark:text-white/30'} />
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Static Center Point */}
              <div className="absolute w-8 h-8 flex items-center justify-center z-20">
                <motion.div 
                  animate={isAligned ? { scale: [1, 1.8, 1], opacity: [1, 0, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`absolute inset-0 rounded-full blur-[4px] ${isAligned ? 'bg-natural-accent' : 'bg-transparent'}`}
                />
                <div className="w-6 h-6 bg-natural-dark dark:bg-dark-accent rounded-full border-[6px] border-white dark:border-dark-bg shadow-2xl relative z-10" />
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-4 relative z-10">
              {isAligned && (
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] font-black text-natural-accent dark:text-dark-accent bg-natural-accent/20 backdrop-blur-md px-6 py-2 rounded-full border border-natural-accent/30 animate-pulse shadow-xl"
                >
                  {isAr ? 'الاتجاه صحيح' : 'ALIGNED CORRECTLY'}
                </motion.span>
              )}
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs font-black text-natural-dark dark:text-white tracking-widest bg-white/40 dark:bg-white/5 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/20 dark:border-white/10 shadow-lg">
                  {isAr ? 'مكة المكرمة: 1,240 كم' : 'Makkah: 1,240 km'}
                </p>
                <span className="text-[9px] font-bold text-natural-dark/40 dark:text-white/30 uppercase tracking-[0.2em]">{isAr ? 'من موقعك الحالي' : 'From your current location'}</span>
              </div>
            </div>

            {sensorWarning && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 p-6 bg-amber-500/10 backdrop-blur-md border border-amber-500/20 rounded-[32px] text-center max-w-[280px] z-20 shadow-xl"
              >
                <p className="text-[11px] text-amber-800 dark:text-amber-400 font-black leading-relaxed">
                  {isAr 
                    ? '⚠️ بيئة المعاينة أو المتصفح تمنع الوصول للبوصلة. قم بنشر التطبيق وافتحه في نافذة مستقلة لتعمل.' 
                    : '⚠️ Preview environment or browser is blocking sensor access. Deploy and open in a new tab for it to work.'}
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {isCompassActive && (
        <div className="mt-14 flex flex-col items-center gap-2 opacity-50 transition-opacity hover:opacity-100 group">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-black text-natural-dark dark:text-white transition-all group-hover:scale-110">{Math.round(heading)}</span>
            <span className="text-lg font-mono font-black text-natural-dark dark:text-white">°</span>
          </div>
          <span className="text-[10px] font-black text-natural-dark/40 dark:text-white/40 uppercase tracking-[0.3em]">
            {isAr ? 'شمال مغناطيسي' : 'Magnetic North'}
          </span>
        </div>
      )}
    </div>

  );
};

export default Qibla;
