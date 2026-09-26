import type { CSSProperties } from 'react';
import {
    ACCENT,
    artStyle,
    CAROUSEL_SIZE,
    pad,
} from '@/modules/wallet/constants/wallet';
import type { Album } from '@/modules/wallet/types';

type Props = {
    album: Album;
    inCarousel: boolean;
    onAddToCarousel: () => void;
    onClose: () => void;
    onMove: () => void;
    onRemove: () => void;
    onSetSlot: () => void;
    queueCount: number;
    slot: number;
};

const rowStyle: CSSProperties = {
    width: '100%',
    height: 54,
    border: 0,
    borderBottom: '1px solid rgba(255,255,255,.06)',
    background: 'none',
    color: '#ecebe7',
    font: '500 16px Archivo,sans-serif',
    textAlign: 'left',
    padding: '0 6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
};

export function DiscSheet({
    album,
    inCarousel,
    onAddToCarousel,
    onClose,
    onMove,
    onRemove,
    onSetSlot,
    queueCount,
    slot,
}: Props) {
    const full = queueCount >= CAROUSEL_SIZE;

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,.55)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '10px 10px 0 0',
                    background: '#1d1d20',
                    padding: '10px 16px 40px',
                    boxShadow: '0 -10px 40px rgba(0,0,0,.5)',
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 4,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,.2)',
                        margin: '0 auto 14px',
                    }}
                />
                <div
                    style={{
                        font: '400 8px Silkscreen,monospace',
                        letterSpacing: '.08em',
                        color: 'rgba(236,235,231,.4)',
                        padding: '0 4px 10px',
                    }}
                >
                    DISC OPTIONS
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '0 4px 16px',
                        borderBottom: '1px solid rgba(255,255,255,.07)',
                    }}
                >
                    <div
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: 3,
                            flex: 'none',
                            ...artStyle(album.image),
                        }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                font: '600 16px/1.25 Archivo,sans-serif',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {album.title}
                        </div>
                        <div
                            style={{
                                font: '400 13px Archivo,sans-serif',
                                color: 'rgba(236,235,231,.55)',
                            }}
                        >
                            {album.artist}
                        </div>
                    </div>
                    <div
                        style={{
                            font: '700 14px/1 Doto,VT323,monospace',
                            padding: '3px 7px 2px',
                            background: '#020502',
                            borderRadius: 6,
                            boxShadow:
                                'inset 0 2px 6px rgba(0,0,0,.9), 0 1px 0 rgba(255,255,255,.06)',
                            color: '#34e8da',
                        }}
                    >
                        SLOT {pad(slot + 1)}
                    </div>
                </div>
                <button
                    onClick={onAddToCarousel}
                    style={{
                        ...rowStyle,
                        color:
                            inCarousel || full
                                ? 'rgba(236,235,231,.35)'
                                : ACCENT,
                    }}
                >
                    <span style={{ flex: 1, whiteSpace: 'nowrap' }}>
                        {inCarousel
                            ? 'Already in carousel'
                            : full
                              ? 'Carousel full'
                              : 'Add to carousel'}
                    </span>
                    <span
                        style={{
                            font: '700 14px/1 Doto,VT323,monospace',
                            color: 'rgba(236,235,231,.45)',
                        }}
                    >
                        {queueCount}/{CAROUSEL_SIZE}
                    </span>
                </button>
                <button onClick={onMove} style={rowStyle}>
                    <span style={{ flex: 1, whiteSpace: 'nowrap' }}>Move</span>
                </button>
                <button onClick={onSetSlot} style={rowStyle}>
                    <span style={{ flex: 1, whiteSpace: 'nowrap' }}>
                        Set slot #
                    </span>
                </button>
                <button
                    onClick={onRemove}
                    style={{
                        ...rowStyle,
                        borderBottom: 0,
                        color: 'oklch(0.72 0.15 25)',
                    }}
                >
                    Remove from wallet
                </button>
            </div>
        </>
    );
}
