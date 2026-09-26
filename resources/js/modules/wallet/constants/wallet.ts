import type { CSSProperties } from 'react';

export const SLOTS = 72;
export const PER_PAGE = 4;
export const PAGES = SLOTS / PER_PAGE;
export const WIDTH = 390;
export const HEIGHT = 844;
export const ROW = 56;
export const CAROUSEL_SIZE = 6;
export const ACCENT = 'oklch(0.86 0.13 190)';
export const LCD = '#34e8da';
export const LCD_GLOW = 'rgba(52,232,218,.6)';

export const pad = (n: number): string => String(n).padStart(2, '0');

export const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);

    return pad(Math.floor(seconds / 60)) + ':' + pad(seconds % 60);
};

export const keyStyle: CSSProperties = {
    height: 30,
    padding: '0 12px',
    border: 0,
    borderRadius: 6,
    background: 'linear-gradient(180deg,#3d3e44,#2c2d32)',
    boxShadow: '0 2px 0 #0e0e10, inset 0 1px 0 rgba(255,255,255,.09)',
    color: '#dfe2ea',
    font: '400 9px Silkscreen,monospace',
    letterSpacing: '.06em',
    cursor: 'pointer',
};

export const skewKeyStyle: CSSProperties = {
    transform: 'skewX(-12deg)',
    border: 0,
    borderRadius: 4,
    background: 'linear-gradient(180deg,#2b2c31,#141518)',
    boxShadow:
        'inset 0 1px 0 rgba(255,255,255,.14), 0 2px 0 #050506, 0 0 0 1px #050506',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

export const lcdChipStyle: CSSProperties = {
    borderRadius: 6,
    background: '#050806',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,.8), 0 1px 0 rgba(255,255,255,.06)',
    display: 'inline-flex',
    alignItems: 'center',
    color: LCD,
    whiteSpace: 'nowrap',
};

export const artStyle = (image: string | null): CSSProperties =>
    image
        ? {
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
          }
        : { background: '#3a3c44' };
