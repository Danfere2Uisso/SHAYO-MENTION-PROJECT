import React from 'react';
import { OfficialRadioKwizeraLogo, RadioKwizeraCompactLogo, OFFICIAL_LOGO_SRC } from './logos/RadioKwizeraLogos';

export interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'light' | 'dark' | 'auto';
  showText?: boolean;
  alt?: string;
}

/**
 * Standard Radio Kwizera Official Logo component
 * Uses the authentic logo unaltered.
 */
export const Logo: React.FC<LogoProps> = ({
  className = 'w-12 h-12',
  alt = 'JRS Radio Kwizera 97.7 FM',
}) => {
  return (
    <OfficialRadioKwizeraLogo className={className} alt={alt} />
  );
};

export default Logo;
export { OfficialRadioKwizeraLogo, RadioKwizeraCompactLogo, OFFICIAL_LOGO_SRC };
