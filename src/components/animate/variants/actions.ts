// ----------------------------------------------------------------------

export const varHover = (scale = 1.09) => ({ scale });

export const varTap = (scale = 0.97) => ({ scale });

export const transitionTap = (duration = 0.2) => ({ duration, ease: 'easeInOut' as const });
