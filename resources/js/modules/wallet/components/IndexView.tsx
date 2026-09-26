import type { PointerEventHandler, RefObject, UIEventHandler } from 'react';
import {
    artStyle,
    keyStyle,
    lcdChipStyle,
    pad,
    PAGES,
    PER_PAGE,
    SLOTS,
} from '@/modules/wallet/constants/wallet';
import type { Slot } from '@/modules/wallet/types';

export type Grab = { from: number; over: number; y: number };

type Props = {
    grab: Grab | null;
    listHandlers: {
        onPointerCancel: PointerEventHandler<HTMLDivElement>;
        onPointerDown: PointerEventHandler<HTMLDivElement>;
        onPointerMove: PointerEventHandler<HTMLDivElement>;
        onPointerUp: PointerEventHandler<HTMLDivElement>;
        onScroll: UIEventHandler<HTMLDivElement>;
    };
    listRef: RefObject<HTMLDivElement | null>;
    onClose: () => void;
    open: boolean;
    scrubHandlers: {
        onPointerDown: PointerEventHandler<HTMLDivElement>;
        onPointerMove: PointerEventHandler<HTMLDivElement>;
        onPointerUp: PointerEventHandler<HTMLDivElement>;
    };
    scrubbing: boolean;
    slots: Slot[];
    visiblePage: number;
};

export function IndexView({
    grab,
    listHandlers,
    listRef,
    onClose,
    open,
    scrubHandlers,
    scrubbing,
    slots,
    visiblePage,
}: Props) {
    const grabbed = grab ? slots[grab.from] : null;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                background: '#0c0c0d',
                transform: `translateY(${open ? '0%' : '100%'})`,
                transition: 'transform 380ms cubic-bezier(.2,.8,.2,1)',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 58,
                    left: 22,
                    right: 20,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                }}
            >
                <div>
                    <div
                        style={{
                            font: '700 30px/1 Archivo,sans-serif',
                            letterSpacing: '-.01em',
                        }}
                    >
                        Index
                    </div>
                    <div
                        style={{
                            ...lcdChipStyle,
                            marginTop: 8,
                            height: 22,
                            padding: '0 8px',
                            font: '700 14px/1 Doto,VT323,monospace',
                            textShadow: '0 0 4px rgba(52,232,218,.4)',
                        }}
                    >
                        {slots.filter(Boolean).length} DISCS · {SLOTS} SLOTS
                    </div>
                </div>
                <button
                    className="wallet-key"
                    onClick={onClose}
                    style={keyStyle}
                >
                    DONE
                </button>
            </div>
            <div
                style={{
                    position: 'absolute',
                    top: 124,
                    left: 22,
                    right: 20,
                    font: '400 11px/1.4 Archivo,sans-serif',
                    color: 'rgba(236,235,231,.4)',
                }}
            >
                Hold a row to grab it. Drag to swap, or release in place to set
                a slot number.
            </div>
            <div
                style={{
                    position: 'absolute',
                    top: 160,
                    left: 0,
                    right: 0,
                    bottom: 34,
                }}
            >
                <div
                    ref={listRef}
                    className="wallet-list"
                    {...listHandlers}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        right: 40,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        paddingBottom: 40,
                        scrollbarWidth: 'none',
                    }}
                >
                    {slots.map((album, i) => {
                        const isFrom = grab?.from === i;
                        const isOver =
                            grab && grab.over === i && grab.over !== grab.from;

                        return (
                            <div
                                key={i}
                                data-row={i}
                                style={{
                                    height: 56,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                    padding: '0 10px 0 22px',
                                    borderTop: `1px solid ${i % PER_PAGE === 0 && i > 0 ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.035)'}`,
                                    background: isOver
                                        ? 'oklch(0.86 0.13 190 / .12)'
                                        : 'transparent',
                                    opacity: isFrom ? 0.25 : 1,
                                    cursor: 'pointer',
                                }}
                            >
                                <div
                                    style={{
                                        width: 24,
                                        flex: 'none',
                                        font: '700 14px Doto,VT323,monospace',
                                        color: '#c9a23a',
                                    }}
                                >
                                    {pad(i + 1)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            font: '500 20px/1.15 Archivo,sans-serif',
                                            color: album
                                                ? '#ecebe7'
                                                : 'rgba(236,235,231,.22)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {album ? album.title : 'Empty'}
                                    </div>
                                    <div
                                        style={{
                                            font: '400 11px/1.3 Archivo,sans-serif',
                                            color: 'rgba(236,235,231,.4)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {album ? album.artist : ' '}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {grab && (
                    <div
                        style={{
                            position: 'absolute',
                            left: 8,
                            right: 46,
                            top: grab.y,
                            height: 56,
                            borderRadius: 6,
                            background: '#232326',
                            boxShadow:
                                '0 12px 30px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.08)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            padding: '0 14px',
                            pointerEvents: 'none',
                            transform: 'scale(1.03)',
                        }}
                    >
                        <div
                            style={{
                                width: 10,
                                height: 36,
                                borderRadius: 2,
                                flex: 'none',
                                ...(grabbed
                                    ? artStyle(grabbed.image)
                                    : { background: 'rgba(255,255,255,.1)' }),
                            }}
                        />
                        <div
                            style={{
                                flex: 1,
                                minWidth: 0,
                                font: '600 18px Archivo,sans-serif',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {grabbed ? grabbed.title : 'Empty slot'}
                        </div>
                        <div
                            style={{
                                font: '700 14px Doto,VT323,monospace',
                                color: '#34e8da',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            →{' '}
                            {grab.over === grab.from
                                ? 'SET #'
                                : `SLOT ${pad(grab.over + 1)}`}
                        </div>
                    </div>
                )}
                <div
                    {...scrubHandlers}
                    style={{
                        position: 'absolute',
                        right: 6,
                        top: 0,
                        bottom: 30,
                        width: 30,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        touchAction: 'none',
                        cursor: 'ns-resize',
                    }}
                >
                    {Array.from({ length: PAGES }, (_, i) => (
                        <div
                            key={i}
                            style={{
                                font: '700 12px/1 Doto,VT323,monospace',
                                color:
                                    i === visiblePage
                                        ? '#34e8da'
                                        : 'rgba(236,235,231,.35)',
                                transform: `scale(${i === visiblePage ? (scrubbing ? 1.5 : 1.2) : 1})`,
                                transition: 'transform 120ms, color 120ms',
                            }}
                        >
                            {pad(i + 1)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
