import { keyStyle, LCD } from '@/modules/wallet/constants/wallet';

type Props = {
    onCancel: () => void;
    title: string;
};

export function MoveBanner({ onCancel, title }: Props) {
    return (
        <div
            style={{
                position: 'absolute',
                top: 52,
                left: 12,
                right: 12,
                height: 52,
                borderRadius: 10,
                background: LCD,
                color: '#041006',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '0 8px 0 14px',
                boxShadow: '0 8px 24px rgba(0,0,0,.4)',
            }}
        >
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        font: '400 8px Silkscreen,monospace',
                        letterSpacing: '.06em',
                        opacity: 0.7,
                    }}
                >
                    MOVE MODE
                </div>
                <div
                    style={{
                        font: '500 13px/1.25 Archivo,sans-serif',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    Moving <b>{title}</b>. Tap a sleeve.
                </div>
            </div>
            <button
                className="wallet-key"
                onClick={onCancel}
                style={{ ...keyStyle, height: 32, padding: '0 10px' }}
            >
                CANCEL
            </button>
        </div>
    );
}
