// @ts-nocheck
import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

interface CustomTextProps extends TextProps {
  variant?: 'normal' | 'serif' | 'bold' | 'gold' | 'green';
  className?: string;
}

export const Text: React.FC<CustomTextProps> = ({
  children,
  variant = 'normal',
  className = '',
  style,
  ...props
}) => {
  let styleClass = 'text-zinc-100';

  if (variant === 'serif') {
    styleClass = 'font-serif text-white text-2xl italic';
  } else if (variant === 'bold') {
    styleClass = 'font-bold text-white';
  } else if (variant === 'gold') {
    styleClass = 'text-[#D4AF37] font-bold';
  } else if (variant === 'green') {
    styleClass = 'text-[#8FAE8F] font-semibold';
  }

  return (
    <RNText
      className={`${styleClass} ${className}`}
      style={[{ fontFamily: variant === 'serif' ? 'Cormorant Garamond' : undefined }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default Text;
