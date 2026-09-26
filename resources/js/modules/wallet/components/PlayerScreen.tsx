import { useEffect, useRef } from 'react';
import {
    artStyle,
    CAROUSEL_SIZE,
    keyStyle,
    LCD,
    LCD_GLOW,
    skewKeyStyle,
} from '@/modules/wallet/constants/wallet';
import type { Album } from '@/modules/wallet/types';

type Props = {
    bay: number;
    current: Album | null;
    onBack: () => void;
    onEject: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onSelectBay: (bay: number) => void;
    onTogglePlay: () => void;
    open: boolean;
    playing: boolean;
    queue: Album[];
    time: string;
    track: string;
};

const lcdText = { color: LCD, textShadow: `0 0 6px ${LCD_GLOW}` };
const glowTriangle = {
    width: 10,
    height: 12,
    background: LCD,
    filter: 'drop-shadow(0 0 3px rgba(52,232,218,.7))',
};

export function PlayerScreen({
    bay,
    current,
    onBack,
    onEject,
    onNext,
    onPrevious,
    onSelectBay,
    onTogglePlay,
    open,
    playing,
    queue,
    time,
    track,
}: Props) {
    const discRef = useRef<HTMLDivElement>(null);
    const barsRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const playingRef = useRef(playing);

    useEffect(() => {
        playingRef.current = playing;
    }, [playing]);

    useEffect(() => {
        let frame = 0;
        let raf = 0;
        let angle = 0;
        let speed = 0;
        let marqueeX = 0;

        const loop = () => {
            raf = requestAnimationFrame(loop);
            const on = playingRef.current;
            speed += ((on ? 3.4 : 0) - speed) * 0.035;
            angle = (angle + speed) % 360;
            frame++;

            if (discRef.current) {
                discRef.current.style.transform = `rotate(${angle}deg)`;
            }

            if (barsRef.current && frame % 4 === 0) {
                Array.from(barsRef.current.children).forEach((bar, i) => {
                    const height = on
                        ? 2 +
                          Math.random() *
                              22 *
                              (1 - i / 22) *
                              (0.6 + 0.4 * Math.sin(frame / 20 + i))
                        : 2;
                    (bar as HTMLElement).style.height =
                        Math.max(2, height).toFixed(0) + 'px';
                });
            }

            if (marqueeRef.current) {
                const width = marqueeRef.current.scrollWidth / 2;
                marqueeX -= 0.45;

                if (width && -marqueeX > width) {
                    marqueeX += width;
                }

                marqueeRef.current.style.transform = `translateX(${marqueeX}px)`;
            }
        };

        loop();

        return () => cancelAnimationFrame(raf);
    }, []);

    const marquee = current
        ? `${current.artist.toUpperCase()} — ${current.title.toUpperCase()} (${current.year})   ***   `
        : 'INSERT DISC   ***   ';

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                background: '#0c0c0e',
                transform: `translateX(${open ? '0%' : '100%'})`,
                transition: 'transform 440ms cubic-bezier(.2,.8,.2,1)',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'radial-gradient(60% 34% at 50% 30%, #5a5d66, rgba(0,0,0,0))',
                    opacity: 0.22,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 56,
                    left: 16,
                    right: 18,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <button
                    className="wallet-key"
                    onClick={onBack}
                    style={keyStyle}
                >
                    ◀ WALLET
                </button>
                <div
                    style={{
                        font: '400 9px Silkscreen,monospace',
                        color: '#8b8fa0',
                    }}
                >
                    CAROUSEL {queue.length}/{CAROUSEL_SIZE}
                </div>
            </div>

            <div
                style={{
                    position: 'absolute',
                    top: 104,
                    left: 0,
                    right: 0,
                    height: 324,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {current ? (
                    <div
                        ref={discRef}
                        style={{
                            width: 292,
                            height: 292,
                            borderRadius: '50%',
                            background:
                                'conic-gradient(from 0deg,#aeb1b8 0 12%,#7f848d 12% 25%,#c9cbd1 25% 37%,#8f8a9c 37% 50%,#aeb1b8 50% 62%,#7f848d 62% 75%,#c9cbd1 75% 87%,#8f8a9c 87% 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 20px 40px rgba(0,0,0,.6)',
                        }}
                    >
                        <div
                            style={{
                                width: 196,
                                height: 196,
                                borderRadius: '50%',
                                ...artStyle(current.image),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div
                                style={{
                                    width: 54,
                                    height: 54,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        background: '#0c0c0e',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            font: '700 21px Doto,VT323,monospace',
                            color: '#3a3c44',
                        }}
                    >
                        NO DISC
                    </div>
                )}
            </div>

            <div
                style={{
                    position: 'absolute',
                    left: 8,
                    right: 8,
                    bottom: 30,
                    height: 384,
                    borderRadius: 14,
                    background:
                        'linear-gradient(180deg,#1b1c20 0%,#0d0e10 45%,#08080a 100%)',
                    boxShadow:
                        '0 0 0 1px #2c2d33, inset 0 1px 0 rgba(255,255,255,.12), 0 -8px 40px rgba(0,0,0,.6)',
                    padding: '12px 12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        left: 14,
                        right: 14,
                        top: 6,
                        height: 1,
                        background:
                            'linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.28),rgba(255,255,255,0))',
                    }}
                />
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        height: 26,
                    }}
                >
                    <button
                        className="wallet-skew-key"
                        onClick={onEject}
                        style={{ ...skewKeyStyle, width: 40, height: 24 }}
                    >
                        <div
                            style={{
                                transform: 'skewX(12deg)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <div
                                style={{
                                    width: 10,
                                    height: 6,
                                    background: LCD,
                                    clipPath: 'polygon(50% 0,100% 100%,0 100%)',
                                }}
                            />
                            <div
                                style={{
                                    width: 10,
                                    height: 2,
                                    background: LCD,
                                }}
                            />
                        </div>
                    </button>
                    <div
                        style={{
                            flex: 1,
                            height: 10,
                            borderRadius: 5,
                            background: '#000',
                            boxShadow:
                                'inset 0 2px 3px rgba(0,0,0,1), 0 1px 0 rgba(255,255,255,.1)',
                        }}
                    />
                    <div
                        style={{
                            font: '400 7px Silkscreen,monospace',
                            letterSpacing: '.1em',
                            color: '#6d7079',
                        }}
                    >
                        DISC-6
                    </div>
                </div>

                <div
                    style={{
                        position: 'relative',
                        height: 116,
                        borderRadius: 6,
                        background: '#030809',
                        boxShadow:
                            'inset 0 2px 8px rgba(0,0,0,1), 0 0 0 1px #1f2126',
                        padding: '10px 12px',
                        display: 'flex',
                        gap: 10,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div
                            style={{
                                height: 40,
                                overflow: 'hidden',
                                whiteSpace: 'pre',
                                font: '700 34px/40px Doto,VT323,monospace',
                                textTransform: 'uppercase',
                                ...lcdText,
                            }}
                        >
                            <div
                                ref={marqueeRef}
                                style={{
                                    display: 'inline-block',
                                    willChange: 'transform',
                                }}
                            >
                                {marquee + marquee}
                            </div>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: 12,
                                font: '700 20px/1 Doto,VT323,monospace',
                                ...lcdText,
                            }}
                        >
                            <span>{track}</span>
                            <span>{time}</span>
                            <span style={{ flex: 1 }} />
                            <div
                                ref={barsRef}
                                style={{
                                    height: 22,
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    gap: 2,
                                }}
                            >
                                {Array.from({ length: 16 }, (_, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            width: 3,
                                            height: 2,
                                            background: LCD,
                                            boxShadow: `0 0 4px ${LCD_GLOW}`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                gap: 10,
                                font: '400 8px Silkscreen,monospace',
                                color: '#2a9d94',
                            }}
                        >
                            <span style={{ color: LCD }}>
                                {!current ? 'STOP' : playing ? 'PLAY' : 'PAUSE'}
                            </span>
                            <span>CD-DA</span>
                            <span>44.1K</span>
                        </div>
                    </div>
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            pointerEvents: 'none',
                            background:
                                'linear-gradient(168deg,rgba(255,255,255,.07),rgba(255,255,255,0) 42%)',
                        }}
                    />
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        height: 112,
                    }}
                >
                    <div
                        className="wallet-knob"
                        onClick={onTogglePlay}
                        style={{
                            width: 108,
                            height: 108,
                            flex: 'none',
                            borderRadius: '50%',
                            background:
                                'conic-gradient(from 30deg,#8d9097,#3a3c42,#c6c8cd,#44464c,#8d9097)',
                            padding: 5,
                            boxShadow:
                                '0 6px 16px rgba(0,0,0,.7), 0 0 0 1px #000',
                            cursor: 'pointer',
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                background:
                                    'radial-gradient(circle at 38% 30%,#3a3b40,#0b0b0d 70%)',
                                boxShadow:
                                    'inset 0 0 0 2px rgba(52,232,218,.35), 0 0 14px rgba(52,232,218,.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4,
                            }}
                        >
                            {playing ? (
                                <>
                                    <div
                                        style={{
                                            width: 6,
                                            height: 22,
                                            background: LCD,
                                            boxShadow:
                                                '0 0 6px rgba(52,232,218,.8)',
                                        }}
                                    />
                                    <div
                                        style={{
                                            width: 6,
                                            height: 22,
                                            background: LCD,
                                            boxShadow:
                                                '0 0 6px rgba(52,232,218,.8)',
                                        }}
                                    />
                                </>
                            ) : (
                                <div
                                    style={{
                                        width: 18,
                                        height: 22,
                                        marginLeft: 4,
                                        background: LCD,
                                        clipPath:
                                            'polygon(0 0,100% 50%,0 100%)',
                                        filter: 'drop-shadow(0 0 4px rgba(52,232,218,.8))',
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                        }}
                    >
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                className="wallet-skew-key"
                                onClick={onPrevious}
                                style={{ ...skewKeyStyle, flex: 1, height: 48 }}
                            >
                                <div
                                    style={{
                                        transform: 'skewX(12deg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 3,
                                            height: 12,
                                            background: LCD,
                                        }}
                                    />
                                    <div
                                        style={{
                                            ...glowTriangle,
                                            clipPath:
                                                'polygon(100% 0,0 50%,100% 100%)',
                                        }}
                                    />
                                    <div
                                        style={{
                                            ...glowTriangle,
                                            clipPath:
                                                'polygon(100% 0,0 50%,100% 100%)',
                                        }}
                                    />
                                </div>
                            </button>
                            <button
                                className="wallet-skew-key"
                                onClick={onNext}
                                style={{ ...skewKeyStyle, flex: 1, height: 48 }}
                            >
                                <div
                                    style={{
                                        transform: 'skewX(12deg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            ...glowTriangle,
                                            clipPath:
                                                'polygon(0 0,100% 50%,0 100%)',
                                        }}
                                    />
                                    <div
                                        style={{
                                            ...glowTriangle,
                                            clipPath:
                                                'polygon(0 0,100% 50%,0 100%)',
                                        }}
                                    />
                                    <div
                                        style={{
                                            width: 3,
                                            height: 12,
                                            background: LCD,
                                        }}
                                    />
                                </div>
                            </button>
                        </div>
                        <div
                            style={{
                                font: '400 7px Silkscreen,monospace',
                                letterSpacing: '.08em',
                                color: '#6d7079',
                                paddingLeft: 4,
                            }}
                        >
                            PUSH KNOB · PLAY / PAUSE
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 6, height: 44 }}>
                    {Array.from({ length: CAROUSEL_SIZE }, (_, i) => {
                        const album = queue[i];
                        const active = i === bay && !!album;

                        return (
                            <div
                                key={i}
                                className="wallet-skew-key"
                                onClick={() => onSelectBay(i)}
                                style={{
                                    ...skewKeyStyle,
                                    flex: 1,
                                    height: 44,
                                    flexDirection: 'column',
                                    gap: 4,
                                }}
                            >
                                <div
                                    style={{
                                        transform: 'skewX(12deg)',
                                        font: '700 16px/1 Doto,VT323,monospace',
                                        color: active
                                            ? LCD
                                            : album
                                              ? '#1f8f86'
                                              : '#2a2c31',
                                        textShadow: active
                                            ? '0 0 6px rgba(52,232,218,.8)'
                                            : 'none',
                                    }}
                                >
                                    {i + 1}
                                </div>
                                <div
                                    style={{
                                        transform: 'skewX(12deg)',
                                        width: 18,
                                        height: 3,
                                        borderRadius: 1,
                                        opacity: 0.9,
                                        ...(album
                                            ? artStyle(album.image)
                                            : { background: 'transparent' }),
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
