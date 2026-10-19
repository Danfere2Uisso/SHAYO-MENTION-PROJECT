import React from 'react';
import { useRadioApp } from '../../context/RadioAppContext';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'light' | 'dark' | 'auto';
  showText?: boolean;
}

export const OFFICIAL_LOGO_SRC = '/radio-kwizera-logo.png';

/**
 * Official Radio Kwizera Logo Image
 * Directly displays the user-provided official station logo PNG without redraws or modifications.
 */
export const OfficialRadioKwizeraLogo: React.FC<{
  className?: string;
  alt?: string;
}> = ({ className = 'w-12 h-12', alt = 'Radio Kwizera 97.7 FM' }) => {
  return (
    <img
      src={OFFICIAL_LOGO_SRC}
      alt={alt}
      referrerPolicy="no-referrer"
      className={`object-contain ${className}`}
    />
  );
};

/**
 * Compact "Radio Kwizera" Station Brand for Headers & Navbars
 * Integrates the official un-altered logo image alongside station branding.
 */
export const RadioKwizeraCompactLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'auto',
  showText = true,
}) => {
  const { studioDarkMode } = useRadioApp();
  const isDark = variant === 'auto' ? studioDarkMode : variant === 'dark';

  const logoDims = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none shrink-0 ${className}`}>
      {/* Official Unaltered Radio Kwizera Logo */}
      <img
        src={OFFICIAL_LOGO_SRC}
        alt="Radio Kwizera 97.7 FM"
        referrerPolicy="no-referrer"
        className={`${logoDims[size]} object-contain shrink-0 drop-shadow-sm`}
      />
      {showText && (
        <div className="flex flex-col leading-none text-left">
          <div className="flex items-center gap-1.5">
            <span className={`font-black text-sm tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
              RADIO KWIZERA
            </span>
            <span className="text-[10px] font-black bg-[#EE1C25] text-white px-1.5 py-0.5 rounded shadow-xs">
              97.7 FM
            </span>
          </div>
          <span className={`text-[10px] font-medium tracking-normal mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Jukwaa la Matumaini • JRS
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Station Broadcast Seal & Identity Emblem
 * Uses the exact provided official Radio Kwizera logo file, sized appropriately.
 */
export const RadioKwizeraSunburstLogo: React.FC<LogoProps & { animated?: boolean }> = ({
  className = '',
  size = 'lg',
  showText = false,
  variant = 'auto',
}) => {
  const { studioDarkMode } = useRadioApp();
  const isDark = variant === 'auto' ? studioDarkMode : variant === 'dark';

  const sizeClasses = {
    xs: 'w-10 h-10',
    sm: 'w-14 h-14 sm:w-16 sm:h-16',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-28 h-28 sm:w-32 sm:h-32',
    xl: 'w-36 h-36 sm:w-40 sm:h-40',
    '2xl': 'w-44 h-44 sm:w-52 sm:h-52',
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none text-center ${className}`}>
      <img
        src={OFFICIAL_LOGO_SRC}
        alt="Radio Kwizera 97.7 FM Logo"
        referrerPolicy="no-referrer"
        className={`${sizeClasses[size]} object-contain drop-shadow-sm`}
      />
      {showText && (
        <div className="mt-2.5 text-center">
          <h2 className={`text-base sm:text-lg font-black tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
            RADIO KWIZERA 97.7 FM
          </h2>
          <p className={`text-[11px] font-medium tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Jukwaa la Matumaini • Jesuit Refugee Service
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Full Station Lockup with Official Logo
 */
export const RadioKwizeraFullLogo: React.FC<LogoProps> = ({
  className = '',
  variant = 'auto',
}) => {
  const { studioDarkMode } = useRadioApp();
  const isDark = variant === 'auto' ? studioDarkMode : variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img
        src={OFFICIAL_LOGO_SRC}
        alt="Radio Kwizera 97.7 FM"
        referrerPolicy="no-referrer"
        className="w-12 h-12 object-contain shrink-0"
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-black text-lg tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
            RADIO KWIZERA
          </span>
          <span className="text-xs font-black bg-[#EE1C25] text-white px-2 py-0.5 rounded">
            97.7 FM
          </span>
        </div>
        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Jukwaa la Matumaini • Jesuit Refugee Service (JRS)
        </span>
      </div>
    </div>
  );
};

export default RadioKwizeraCompactLogo;
