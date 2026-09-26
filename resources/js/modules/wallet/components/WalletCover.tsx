type Props = {
    connected: boolean;
    onOpen: () => void;
    opened: boolean;
};

export function WalletCover({ connected, onOpen, opened }: Props) {
    return (
        <div
            onClick={onOpen}
            style={{
                position: 'absolute',
                inset: 0,
                transformOrigin: '0 50%',
                transform: `perspective(1600px) rotateY(${opened ? -104 : 0}deg)`,
                opacity: opened ? 0 : 1,
                pointerEvents: opened ? 'none' : 'auto',
                transition: `transform 850ms cubic-bezier(.6,.05,.3,1), opacity 300ms ease ${opened ? 520 : 0}ms`,
                backgroundColor: '#121213',
                backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(255,255,255,.035) 0 2px, rgba(0,0,0,0) 2px 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,.45) 0 2px, rgba(0,0,0,0) 2px 4px), radial-gradient(130% 90% at 35% 15%, #2a2a2d, #0d0d0e)',
                cursor: 'pointer',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: 30,
                    background:
                        'linear-gradient(90deg,#0a0a0b,#18181a 70%,#101011)',
                    boxShadow: '1px 0 0 rgba(255,255,255,.04)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 34,
                    borderLeft: '1px dashed rgba(255,255,255,.08)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bottom: 12,
                    left: -40,
                    border: '14px solid #1b1b1d',
                    borderRadius: 46,
                    boxShadow:
                        'inset 0 0 0 1px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.03)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 17.5,
                    right: 17.5,
                    bottom: 17.5,
                    left: -34.5,
                    border: '3px dashed #6f7074',
                    borderRadius: 41,
                    opacity: 0.85,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    right: 9,
                    top: 318,
                    width: 20,
                    height: 34,
                    borderRadius: 5,
                    background:
                        'linear-gradient(90deg,#5d5f63,#c9cbcf 50%,#6c6e72)',
                    boxShadow: '0 2px 4px rgba(0,0,0,.6)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    right: 12,
                    top: 346,
                    width: 14,
                    height: 54,
                    borderRadius: 7,
                    background:
                        'linear-gradient(90deg,#55575b,#bfc1c5 50%,#606266)',
                    boxShadow: '0 3px 6px rgba(0,0,0,.6)',
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: 30,
                }}
            >
                <div
                    style={{
                        width: 5,
                        height: 16,
                        borderRadius: 3,
                        background: '#141415',
                    }}
                />
            </div>
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 196,
                    height: 118,
                    margin: '-59px 0 0 -84px',
                    borderRadius: 10,
                    background: '#1c1c1e',
                    boxShadow:
                        '0 1px 0 rgba(255,255,255,.05), inset 0 1px 0 rgba(255,255,255,.04), 0 6px 14px rgba(0,0,0,.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 6,
                        border: '1px dashed rgba(255,255,255,.1)',
                        borderRadius: 6,
                    }}
                />
                <div
                    style={{
                        font: "700 32px/1 'Archivo Narrow',sans-serif",
                        letterSpacing: '.24em',
                        marginLeft: '.24em',
                        color: '#343437',
                        textShadow:
                            '0 1px 0 rgba(255,255,255,.07), 0 -1px 0 rgba(0,0,0,.7)',
                    }}
                >
                    SLEEVE
                </div>
                <div
                    style={{
                        font: '400 8px Silkscreen,monospace',
                        letterSpacing: '.14em',
                        color: '#4c4c50',
                    }}
                >
                    72 DISC WALLET
                </div>
            </div>
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 92,
                    textAlign: 'center',
                    font: '400 9px Silkscreen,monospace',
                    letterSpacing: '.12em',
                    color: 'rgba(236,235,231,.4)',
                }}
            >
                &gt; {connected ? 'TAP TO UNZIP' : 'TAP TO CONNECT SPOTIFY'} _
            </div>
        </div>
    );
}
