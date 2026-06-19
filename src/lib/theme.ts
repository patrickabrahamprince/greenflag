// @ts-nocheck
export const theme = {
  colors: {
    // Custom GreenFlag spec colors
    green900: '#0D3D0D',
    green800: '#1A4D1A',
    green700: '#2D5F2D',
    green600: '#4A7A4A',
    green400: '#8FAE8F',
    
    // Additional UI highlights
    gold: '#D4AF37',
    goldLight: '#F4D03F',
    black: '#000000',
    white: '#FFFFFF',
    zinc900: '#18181B',
    zinc800: '#27272A',
    zinc400: '#A1A1AA',
    zinc600: '#52525B',
  },
  
  // Motion specifications: 400ms transitions
  animation: {
    duration: 400,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    transitionConfig: {
      duration: 400,
      useNativeDriver: true,
    }
  },
};

export default theme;
