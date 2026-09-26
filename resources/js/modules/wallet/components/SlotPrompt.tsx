import { useEffect, useRef } from 'react';
import { keyStyle, pad, SLOTS } from '@/modules/wallet/constants/wallet';
import type { Slot } from '@/modules/wallet/types';

type Props = {
    onCancel: () => void;
    onChange: (value: string) => void;
    onConfirm: (target: number) => void;
    slot: number;
    slots: Slot[];
    value: string;
};

export function SlotPrompt({
    onCancel,
    onChange,
    onConfirm,
    slot,
    slots,
    value,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const number = parseInt(value, 10);
    const target = number >= 1 && number <= SLOTS ? number - 1 : null;
    const current = slots[slot];
    const occupant = target !== null && target !== slot ? slots[target] : null;

    const note = !value
        ? ''
        : target === null
          ? `Enter 1–${SLOTS}`
          : target === slot
            ? 'Same slot'
            : occupant
              ? `Swaps with ${occupant.title}`
              : `Slot ${pad(target + 1)} is empty`;

    const confirm = () => {
        if (target !== null) {
            onConfirm(target);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => inputRef.current?.focus(), 30);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            <div
                onClick={onCancel}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,.6)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: 36,
                    right: 36,
                    top: 230,
                    borderRadius: 10,
                    background: '#1d1d20',
                    padding: '20px 18px 16px',
                    boxShadow: '0 20px 50px rgba(0,0,0,.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                }}
            >
                <div>
                    <div
                        style={{
                            font: '400 8px Silkscreen,monospace',
                            letterSpacing: '.08em',
                            color: 'rgba(236,235,231,.4)',
                            marginBottom: 6,
                        }}
                    >
                        SET SLOT #
                    </div>
                    <div
                        style={{
                            font: '400 13px/1.35 Archivo,sans-serif',
                            color: 'rgba(236,235,231,.65)',
                        }}
                    >
                        {current ? current.title : 'Empty sleeve'} is in slot{' '}
                        {pad(slot + 1)}.
                    </div>
                </div>
                <div
                    style={{
                        position: 'relative',
                        background: '#020502',
                        borderRadius: 6,
                        boxShadow:
                            'inset 0 2px 6px rgba(0,0,0,.9), 0 1px 0 rgba(255,255,255,.06)',
                    }}
                >
                    <input
                        ref={inputRef}
                        value={value}
                        onChange={(e) =>
                            onChange(
                                e.target.value.replace(/\D/g, '').slice(0, 2),
                            )
                        }
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                confirm();
                            }

                            if (e.key === 'Escape') {
                                onCancel();
                            }
                        }}
                        inputMode="numeric"
                        placeholder="__"
                        style={{
                            width: '100%',
                            height: 68,
                            border: 0,
                            background: 'transparent',
                            color: '#34e8da',
                            font: '700 46px Doto,VT323,monospace',
                            textAlign: 'center',
                            outline: 'none',
                            letterSpacing: '.12em',
                            textShadow: '0 0 6px rgba(52,232,218,.55)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: 6,
                            pointerEvents: 'none',
                            background:
                                'repeating-linear-gradient(0deg,rgba(0,0,0,.35) 0 1px,rgba(0,0,0,0) 1px 3px)',
                        }}
                    />
                </div>
                <div
                    style={{
                        minHeight: 17,
                        font: '700 14px/1 Doto,VT323,monospace',
                        color: 'rgba(236,235,231,.55)',
                    }}
                >
                    {note}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className="wallet-key"
                        onClick={onCancel}
                        style={{ ...keyStyle, flex: 1, height: 42 }}
                    >
                        CANCEL
                    </button>
                    <button
                        className="wallet-key"
                        onClick={confirm}
                        style={{
                            ...keyStyle,
                            flex: 1,
                            height: 42,
                            opacity: target !== null ? 1 : 0.4,
                        }}
                    >
                        SET
                    </button>
                </div>
            </div>
        </>
    );
}
