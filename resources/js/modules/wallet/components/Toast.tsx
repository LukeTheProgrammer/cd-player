import { keyStyle, LCD } from '@/modules/wallet/constants/wallet';

type Props = {
    message: string;
    onUndo?: () => void;
};

export function Toast({ message, onUndo }: Props) {
    return (
        <div
            style={{
                position: 'absolute',
                left: '50%',
                bottom: 112,
                transform: 'translateX(-50%)',
                maxWidth: 350,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '6px 6px 6px 12px',
                borderRadius: 6,
                background: '#050806',
                color: LCD,
                boxShadow:
                    '0 10px 30px rgba(0,0,0,.5), inset 0 0 0 1px rgba(52,232,218,.25)',
                whiteSpace: 'nowrap',
            }}
        >
            <div
                style={{
                    font: '700 15px/1 Doto,VT323,monospace',
                    letterSpacing: '.03em',
                    textTransform: 'uppercase',
                    textShadow: '0 0 4px rgba(52,232,218,.45)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    padding: '5px 4px 5px 0',
                }}
            >
                &gt; {message}
            </div>
            {onUndo && (
                <button
                    className="wallet-key"
                    onClick={onUndo}
                    style={{ ...keyStyle, height: 28, padding: '0 10px' }}
                >
                    UNDO
                </button>
            )}
        </div>
    );
}
