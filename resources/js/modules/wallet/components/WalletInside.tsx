import type { PointerEventHandler } from 'react';
import {
    ACCENT,
    artStyle,
    CAROUSEL_SIZE,
    keyStyle,
    lcdChipStyle,
    pad,
    PAGES,
    PER_PAGE,
    WIDTH,
} from '@/modules/wallet/constants/wallet';
import type { Album, Slot } from '@/modules/wallet/types';

type PointerHandlers = {
    onPointerCancel?: PointerEventHandler<HTMLDivElement>;
    onPointerDown: PointerEventHandler<HTMLDivElement>;
    onPointerMove: PointerEventHandler<HTMLDivElement>;
    onPointerUp: PointerEventHandler<HTMLDivElement>;
};

type Props = {
    animating: boolean;
    bay: number;
    current: Album | null;
    dx: number;
    flash: number | null;
    grabHandlers: PointerHandlers;
    moveFrom: number | null;
    onClose: () => void;
    onGoPlayer: () => void;
    onJumpPage: (page: number) => void;
    page: number;
    playing: boolean;
    press: number | null;
    queue: Album[];
    slots: Slot[];
    trackHandlers: PointerHandlers;
};

const SHEEN = 3;
const PARALLAX = 1;

export function WalletInside({
    animating,
    bay,
    current,
    dx,
    flash,
    grabHandlers,
    moveFrom,
    onClose,
    onGoPlayer,
    onJumpPage,
    page,
    playing,
    press,
    queue,
    slots,
    trackHandlers,
}: Props) {
    const transition = animating
        ? 'transform 300ms cubic-bezier(.2,.8,.2,1)'
        : 'none';
    const sheen = `linear-gradient(104deg, rgba(255,255,255,0) 18%, rgba(255,255,255,${(0.04 * SHEEN).toFixed(3)}) 34%, rgba(255,255,255,0) 50%, rgba(255,255,255,${(0.015 * SHEEN).toFixed(3)}) 72%, rgba(255,255,255,0) 86%)`;

    const badgeFor = (album: Album): string | null => {
        const index = queue.findIndex((q) => q.id === album.id);

        if (index < 0) {
            return null;
        }

        return index === bay
            ? playing
                ? 'PLAYING'
                : 'LOADED'
            : `BAY ${index + 1}`;
    };

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#1a1a1c',
                backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(255,255,255,.012) 0 2px, rgba(0,0,0,0) 2px 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,.18) 0 2px, rgba(0,0,0,0) 2px 4px)',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: 10,
                    background: 'linear-gradient(90deg,#0c0c0d,#161618)',
                    borderRight: '1px dashed rgba(255,255,255,.05)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 56,
                    left: 20,
                    right: 20,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <button
                    className="wallet-key"
                    onClick={onClose}
                    style={keyStyle}
                >
                    ZIP UP
                </button>
                <div
                    style={{
                        font: "600 13px 'Archivo Narrow',sans-serif",
                        letterSpacing: '.32em',
                        color: 'rgba(236,235,231,.55)',
                    }}
                >
                    SLEEVE·72
                </div>
                <div
                    style={{
                        ...lcdChipStyle,
                        height: 26,
                        padding: '0 10px',
                        font: '700 16px/1 Doto,VT323,monospace',
                        textShadow: '0 0 5px rgba(52,232,218,.45)',
                    }}
                >
                    PG {pad(page + 1)} / {PAGES}
                </div>
            </div>

            <div
                style={{
                    position: 'absolute',
                    top: 106,
                    left: 20,
                    right: 20,
                    display: 'flex',
                    gap: 4,
                }}
            >
                {Array.from({ length: PAGES }, (_, i) => {
                    const filled = slots
                        .slice(i * PER_PAGE, i * PER_PAGE + PER_PAGE)
                        .some(Boolean);

                    return (
                        <div
                            key={i}
                            onClick={() => onJumpPage(i)}
                            style={{
                                flex: 1,
                                height: 10,
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <div
                                style={{
                                    width: '100%',
                                    height: 3,
                                    borderRadius: 2,
                                    background:
                                        i === page
                                            ? ACCENT
                                            : filled
                                              ? 'rgba(255,255,255,.22)'
                                              : 'rgba(255,255,255,.08)',
                                    transition: 'background 200ms',
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            <div
                {...trackHandlers}
                style={{
                    position: 'absolute',
                    top: 122,
                    left: 0,
                    right: 0,
                    height: 586,
                    overflow: 'hidden',
                    touchAction: 'none',
                }}
            >
                {[-1, 0, 1].map((offset) => {
                    const p = page + offset;
                    const base = offset * WIDTH + dx;

                    if (p < 0 || p >= PAGES) {
                        return null;
                    }

                    return (
                        <div
                            key={p}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                padding: '8px 14px 8px 20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                transform: `translateX(${base}px)`,
                                transition,
                            }}
                        >
                            {Array.from({ length: PER_PAGE }, (_, k) => {
                                const slot = p * PER_PAGE + k;
                                const album = slots[slot];
                                const highlight =
                                    moveFrom === slot || flash === slot;
                                const badge = album ? badgeFor(album) : null;

                                return (
                                    <div
                                        key={slot}
                                        data-slot={slot}
                                        style={{
                                            position: 'relative',
                                            flex: 1,
                                            minHeight: 0,
                                            borderRadius: 10,
                                            background:
                                                'rgba(255,255,255,.022)',
                                            border: '1px solid rgba(255,255,255,.055)',
                                            boxShadow:
                                                'inset 0 1px 0 rgba(255,255,255,.04)' +
                                                (highlight
                                                    ? `, 0 0 0 1.5px ${ACCENT}`
                                                    : ''),
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 16,
                                            padding: '0 16px 0 10px',
                                            transform: `scale(${press === slot ? 0.975 : 1})`,
                                            opacity:
                                                moveFrom === slot ? 0.5 : 1,
                                            transition:
                                                'transform 160ms, opacity 200ms, box-shadow 200ms',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: 'absolute',
                                                inset: 4,
                                                border: '1px dashed rgba(255,255,255,.04)',
                                                borderRadius: 7,
                                                pointerEvents: 'none',
                                            }}
                                        />
                                        <div
                                            style={{
                                                width: 116,
                                                height: 116,
                                                flex: 'none',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                borderRadius: 2,
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            {album ? (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        bottom: 0,
                                                        left: -10,
                                                        right: -10,
                                                        ...artStyle(
                                                            album.image,
                                                        ),
                                                        transform: `translateX(${Math.max(-10, Math.min(10, -base * 0.05 * PARALLAX))}px)`,
                                                        transition,
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        inset: 6,
                                                        border: '1px dashed rgba(255,255,255,.12)',
                                                        borderRadius: 3,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        font: "500 9px 'IBM Plex Mono',monospace",
                                                        letterSpacing: '.16em',
                                                        color: 'rgba(255,255,255,.25)',
                                                    }}
                                                >
                                                    EMPTY
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            style={{
                                                flex: 1,
                                                minWidth: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 4,
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        font: '400 8px Silkscreen,monospace',
                                                        letterSpacing: '.06em',
                                                        color: 'rgba(236,235,231,.4)',
                                                    }}
                                                >
                                                    SLOT {pad(slot + 1)}
                                                </div>
                                                {badge && (
                                                    <div
                                                        style={{
                                                            font: '700 12px/1 Doto,VT323,monospace',
                                                            letterSpacing:
                                                                '.04em',
                                                            padding:
                                                                '2px 6px 1px',
                                                            borderRadius: 3,
                                                            background:
                                                                '#050806',
                                                            color: '#34e8da',
                                                            textShadow:
                                                                '0 0 4px rgba(52,232,218,.45)',
                                                        }}
                                                    >
                                                        {badge}
                                                    </div>
                                                )}
                                            </div>
                                            {album && (
                                                <>
                                                    <div
                                                        style={{
                                                            font: '600 16px/1.2 Archivo,sans-serif',
                                                            color: '#ecebe7',
                                                            display:
                                                                '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient:
                                                                'vertical',
                                                            overflow: 'hidden',
                                                            textWrap: 'pretty',
                                                        }}
                                                    >
                                                        {album.title}
                                                    </div>
                                                    <div
                                                        style={{
                                                            font: '400 13px/1.3 Archivo,sans-serif',
                                                            color: 'rgba(236,235,231,.6)',
                                                            whiteSpace:
                                                                'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow:
                                                                'ellipsis',
                                                        }}
                                                    >
                                                        {album.artist}
                                                    </div>
                                                    <div
                                                        style={{
                                                            font: "400 10px 'IBM Plex Mono',monospace",
                                                            color: 'rgba(236,235,231,.35)',
                                                        }}
                                                    >
                                                        {album.year}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                pointerEvents: 'none',
                                                background: sheen,
                                                transform: `translateX(${-base * 0.22 * PARALLAX}px)`,
                                                transition,
                                            }}
                                        />
                                        <div
                                            style={{
                                                position: 'absolute',
                                                left: 8,
                                                right: 8,
                                                top: 9,
                                                height: 1,
                                                background:
                                                    'rgba(255,255,255,.05)',
                                                pointerEvents: 'none',
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            <div
                {...grabHandlers}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 104,
                    height: 34,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    touchAction: 'none',
                    cursor: 'pointer',
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 4,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,.22)',
                    }}
                />
                <div
                    style={{
                        font: '400 8px Silkscreen,monospace',
                        letterSpacing: '.08em',
                        color: 'rgba(236,235,231,.4)',
                    }}
                >
                    ▲ SWIPE UP · INDEX
                </div>
            </div>

            <div
                onClick={onGoPlayer}
                style={{
                    position: 'absolute',
                    left: 14,
                    right: 14,
                    bottom: 38,
                    height: 62,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.07)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '0 14px',
                    cursor: current ? 'pointer' : 'default',
                }}
            >
                {current ? (
                    <>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                flex: 'none',
                                background:
                                    'conic-gradient(from 20deg,#b9bcc2,#8b9098,#d4d6da,#858b93,#b9bcc2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div
                                style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    ...artStyle(current.image),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: '50%',
                                        background: '#1a1a1c',
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    font: '700 12px/1 Doto,VT323,monospace',
                                    letterSpacing: '.06em',
                                    color: '#34e8da',
                                    textShadow: '0 0 4px rgba(52,232,218,.4)',
                                }}
                            >
                                {playing ? '▶ PLAYING' : '❚❚ PAUSED'} · CAROUSEL{' '}
                                {queue.length}/{CAROUSEL_SIZE}
                            </div>
                            <div
                                style={{
                                    font: '600 14px/1.3 Archivo,sans-serif',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {current.title}{' '}
                                <span
                                    style={{
                                        fontWeight: 400,
                                        color: 'rgba(236,235,231,.55)',
                                    }}
                                >
                                    — {current.artist}
                                </span>
                            </div>
                        </div>
                        <div
                            style={{
                                ...keyStyle,
                                height: 34,
                                padding: '0 10px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            PLAYER ▶
                        </div>
                    </>
                ) : (
                    <>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                border: '1px dashed rgba(255,255,255,.18)',
                                flex: 'none',
                            }}
                        />
                        <div
                            style={{
                                font: '400 13px Archivo,sans-serif',
                                color: 'rgba(236,235,231,.4)',
                            }}
                        >
                            No disc loaded. Tap an album to play.
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
