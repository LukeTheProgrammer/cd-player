import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent, UIEvent } from 'react';
import { usePlayer } from '@/modules/player/hooks/usePlayer';
import { DiscSheet } from '@/modules/wallet/components/DiscSheet';
import { IndexView } from '@/modules/wallet/components/IndexView';
import type { Grab } from '@/modules/wallet/components/IndexView';
import { MoveBanner } from '@/modules/wallet/components/MoveBanner';
import { PlayerScreen } from '@/modules/wallet/components/PlayerScreen';
import { SlotPrompt } from '@/modules/wallet/components/SlotPrompt';
import { Toast } from '@/modules/wallet/components/Toast';
import { WalletCover } from '@/modules/wallet/components/WalletCover';
import { WalletInside } from '@/modules/wallet/components/WalletInside';
import {
    CAROUSEL_SIZE,
    formatTime,
    HEIGHT,
    pad,
    PAGES,
    PER_PAGE,
    ROW,
    SLOTS,
    WIDTH,
} from '@/modules/wallet/constants/wallet';
import type { Album, Slot } from '@/modules/wallet/types';
import { logout } from '@/routes';
import { connect } from '@/routes/music';
import { update } from '@/routes/wallet';

type Props = {
    connected: boolean;
    slots: Slot[];
};

type TrackPointer = {
    x: number;
    y: number;
    id: number;
    slot: number | null;
    drag: boolean;
    long: boolean;
    moved: boolean;
};
type ListPointer = {
    id: number;
    x: number;
    y: number;
    index: number;
    moved: boolean;
    grabbed: boolean;
};

export default function WalletPage({ connected, slots: initialSlots }: Props) {
    const [slots, setSlots] = useState<Slot[]>(initialSlots);
    const [opened, setOpened] = useState(false);
    const [screen, setScreen] = useState<'wallet' | 'player'>('wallet');
    const [page, setPage] = useState(0);
    const [dx, setDx] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [queue, setQueue] = useState<Album[]>([]);
    const [bay, setBay] = useState(0);
    const [press, setPress] = useState<number | null>(null);
    const [flash, setFlash] = useState<number | null>(null);
    const [sheet, setSheet] = useState<number | null>(null);
    const [moveFrom, setMoveFrom] = useState<number | null>(null);
    const [prompt, setPrompt] = useState<{
        slot: number;
        value: string;
    } | null>(null);
    const [indexOpen, setIndexOpen] = useState(false);
    const [grab, setGrab] = useState<Grab | null>(null);
    const [visiblePage, setVisiblePage] = useState(0);
    const [scrubbing, setScrubbing] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        undo?: () => void;
    } | null>(null);
    const [scale, setScale] = useState(1);
    const [now, setNow] = useState(0);

    const listRef = useRef<HTMLDivElement>(null);
    const trackPointer = useRef<TrackPointer | null>(null);
    const listPointer = useRef<ListPointer | null>(null);
    const grabStartY = useRef<number | null>(null);
    const scrubActive = useRef(false);
    const lastTrack = useRef<{ albumId: string | null; index: number }>({
        albumId: null,
        index: -1,
    });
    const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const later = (name: string, callback: () => void, ms: number) => {
        clearTimeout(timers.current[name]);
        timers.current[name] = setTimeout(callback, ms);
    };

    const showToast = useCallback((message: string, undo?: () => void) => {
        setToast({ message, undo });
        clearTimeout(timers.current.toast);
        timers.current.toast = setTimeout(() => setToast(null), 2800);
    }, []);

    const player = usePlayer(showToast);
    const current = queue[bay] ?? null;
    const trackIndex = current
        ? current.trackIds.findIndex((id) => player.state.trackIds.includes(id))
        : -1;
    const playing = !!current && !player.state.paused;
    const elapsed =
        player.state.position +
        (playing ? Math.max(0, now - player.state.updatedAt) : 0);

    useEffect(() => {
        const fit = () =>
            setScale(
                Math.min(
                    1,
                    (innerHeight - 32) / HEIGHT,
                    (innerWidth - 16) / WIDTH,
                ),
            );
        fit();
        window.addEventListener('resize', fit);

        return () => window.removeEventListener('resize', fit);
    }, []);

    useEffect(() => {
        if (!playing) {
            return;
        }

        const interval = setInterval(() => setNow(performance.now()), 500);

        return () => clearInterval(interval);
    }, [playing]);

    useEffect(() => {
        const list = listRef.current;
        const preventScrollWhileGrabbed = (e: TouchEvent) => {
            if (listPointer.current?.grabbed) {
                e.preventDefault();
            }
        };

        list?.addEventListener('touchmove', preventScrollWhileGrabbed, {
            passive: false,
        });

        return () =>
            list?.removeEventListener('touchmove', preventScrollWhileGrabbed);
    }, []);

    const playBay = (albums: Album[], index: number, trackOffset = 0) => {
        setBay(index);
        void player.playAlbum(albums[index].uri, trackOffset);
    };

    // Advance to the next bay when an album finishes (context ends or autoplay moves past it).
    useEffect(() => {
        if (!current) {
            return;
        }

        const previous = lastTrack.current;
        lastTrack.current = { albumId: current.id, index: trackIndex };

        if (previous.albumId !== current.id) {
            return;
        }

        const last = current.trackIds.length - 1;
        const finished =
            trackIndex === -1 ||
            (trackIndex === 0 &&
                player.state.paused &&
                player.state.position === 0);

        if (last >= 0 && previous.index === last && finished) {
            if (bay + 1 < queue.length) {
                playBay(queue, bay + 1);
            } else {
                player.pause();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trackIndex, player.state.paused, player.state.position]);

    const persist = (next: Slot[]) => {
        setSlots(next);
        router.put(
            update.url(),
            { slots: next.map((album) => album?.id ?? null) },
            { preserveState: true, preserveScroll: true },
        );
    };

    const flashSlot = (slot: number) => {
        setFlash(slot);
        later('flash', () => setFlash(null), 1400);
    };

    const swap = (a: number, b: number) => {
        const next = [...slots];
        [next[a], next[b]] = [next[b], next[a]];
        persist(next);
        flashSlot(b);
        showToast(
            next[a]
                ? `Swapped slots ${pad(a + 1)} and ${pad(b + 1)}`
                : `Moved to slot ${pad(b + 1)}`,
        );
    };

    // Transport

    const load = (album: Album) => {
        const next = [...queue];
        let index = next.findIndex((q) => q.id === album.id);

        if (index < 0) {
            if (next.length < CAROUSEL_SIZE) {
                next.push(album);
                index = next.length - 1;
            } else {
                index = bay;
                next[bay] = album;
            }
        }

        const same = index === bay && queue[bay]?.id === album.id;
        setQueue(next);
        setScreen('player');

        if (!same) {
            playBay(next, index);
        } else if (!playing) {
            togglePlay();
        }
    };

    const togglePlay = () => {
        if (!current) {
            return;
        }

        if (trackIndex < 0) {
            void player.playAlbum(current.uri);
        } else {
            player.togglePlay();
        }
    };

    const next = () => {
        if (!current) {
            return;
        }

        if (trackIndex < 0) {
            void player.playAlbum(current.uri);
        } else if (trackIndex + 1 < current.trackIds.length) {
            player.nextTrack();
        } else if (bay + 1 < queue.length) {
            playBay(queue, bay + 1);
        } else {
            player.pause();
        }
    };

    const previous = () => {
        if (!current) {
            return;
        }

        if (elapsed > 3000 || (trackIndex <= 0 && bay === 0)) {
            player.seek(0);
        } else if (trackIndex > 0) {
            player.previousTrack();
        } else {
            playBay(queue, bay - 1, queue[bay - 1].trackIds.length - 1);
        }
    };

    const eject = () => {
        if (!current) {
            return;
        }

        const remaining = queue.filter((_, i) => i !== bay);
        const nextBay = Math.min(bay, Math.max(0, remaining.length - 1));
        setQueue(remaining);
        setBay(nextBay);

        if (!remaining.length) {
            player.pause();
        } else if (playing) {
            playBay(remaining, nextBay);
        }

        showToast(`Ejected ${current.title}`);
    };

    const selectBay = (index: number) => {
        if (index < queue.length && index !== bay) {
            playBay(queue, index);
        }
    };

    // Wallet paging

    const goPage = (target: number, to: number) => {
        setAnimating(true);
        setDx(to);
        later(
            'page',
            () => {
                setAnimating(false);
                setDx(0);
                setPage(target);
            },
            300,
        );
    };

    const settle = () => {
        const threshold = WIDTH * 0.18;

        if (dx < -threshold && page < PAGES - 1) {
            goPage(page + 1, -WIDTH);
        } else if (dx > threshold && page > 0) {
            goPage(page - 1, WIDTH);
        } else {
            setAnimating(true);
            setDx(0);
            later('page', () => setAnimating(false), 300);
        }
    };

    const jumpPage = (target: number) => {
        if (target === page || animating) {
            return;
        }

        if (Math.abs(target - page) === 1) {
            goPage(target, target > page ? -WIDTH : WIDTH);
        } else {
            setPage(target);
        }
    };

    const tapSlot = (slot: number) => {
        if (moveFrom !== null) {
            if (slot !== moveFrom) {
                swap(moveFrom, slot);
            }

            setMoveFrom(null);

            return;
        }

        const album = slots[slot];

        if (album) {
            load(album);
        }
    };

    const trackHandlers = {
        onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
            if (animating || sheet !== null) {
                return;
            }

            const element = (e.target as HTMLElement).closest<HTMLElement>(
                '[data-slot]',
            );
            const slot = element ? Number(element.dataset.slot) : null;
            trackPointer.current = {
                x: e.clientX,
                y: e.clientY,
                id: e.pointerId,
                slot,
                drag: false,
                long: false,
                moved: false,
            };
            e.currentTarget.setPointerCapture(e.pointerId);

            if (slot !== null && slots[slot] && moveFrom === null) {
                later(
                    'longPress',
                    () => {
                        if (!trackPointer.current) {
                            return;
                        }

                        trackPointer.current.long = true;
                        navigator.vibrate?.(12);
                        setPress(null);
                        setSheet(slot);
                    },
                    450,
                );
            }

            setPress(slot);
        },
        onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
            const p = trackPointer.current;

            if (!p || p.id !== e.pointerId || p.long) {
                return;
            }

            const deltaX = (e.clientX - p.x) / scale;
            const deltaY = (e.clientY - p.y) / scale;

            if (!p.moved && (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8)) {
                clearTimeout(timers.current.longPress);
                p.moved = true;
                p.drag = Math.abs(deltaX) > Math.abs(deltaY);
                setPress(null);
            }

            if (p.drag) {
                const resisted =
                    (page === 0 && deltaX > 0) ||
                    (page === PAGES - 1 && deltaX < 0);
                setDx(resisted ? deltaX * 0.3 : deltaX);
            }
        },
        onPointerUp: () => {
            const p = trackPointer.current;
            trackPointer.current = null;
            clearTimeout(timers.current.longPress);

            if (!p || p.long) {
                return;
            }

            if (p.drag) {
                settle();

                return;
            }

            setPress(null);

            if (!p.moved && p.slot !== null) {
                tapSlot(p.slot);
            }
        },
        onPointerCancel: () => {
            const p = trackPointer.current;
            trackPointer.current = null;
            clearTimeout(timers.current.longPress);
            setPress(null);

            if (p?.drag) {
                settle();
            }
        },
    };

    // Index

    const openIndex = () => {
        if (indexOpen) {
            return;
        }

        if (listRef.current) {
            listRef.current.scrollTop = page * PER_PAGE * ROW;
        }

        setIndexOpen(true);
        setMoveFrom(null);
        setVisiblePage(page);
    };

    const grabHandlers = {
        onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
            grabStartY.current = e.clientY;
            e.currentTarget.setPointerCapture(e.pointerId);
        },
        onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
            if (
                grabStartY.current !== null &&
                (grabStartY.current - e.clientY) / scale > 36
            ) {
                grabStartY.current = null;
                openIndex();
            }
        },
        onPointerUp: () => {
            if (grabStartY.current !== null) {
                grabStartY.current = null;
                openIndex();
            }
        },
    };

    const listPosition = (e: PointerEvent<HTMLDivElement>) => {
        const list = listRef.current!;
        const rect = list.getBoundingClientRect();
        const y = (e.clientY - rect.top) / scale;

        return {
            y,
            index: Math.max(
                0,
                Math.min(SLOTS - 1, Math.floor((y + list.scrollTop) / ROW)),
            ),
            height: rect.height / scale,
        };
    };

    const listHandlers = {
        onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
            const row = (e.target as HTMLElement).closest<HTMLElement>(
                '[data-row]',
            );

            if (!row) {
                return;
            }

            const index = Number(row.dataset.row);
            const pointerId = e.pointerId;
            const target = e.currentTarget;
            listPointer.current = {
                id: pointerId,
                x: e.clientX,
                y: e.clientY,
                index,
                moved: false,
                grabbed: false,
            };

            later(
                'grab',
                () => {
                    if (!listPointer.current) {
                        return;
                    }

                    listPointer.current.grabbed = true;
                    navigator.vibrate?.(12);
                    target.setPointerCapture(pointerId);
                    setGrab({
                        from: index,
                        over: index,
                        y: index * ROW - (listRef.current?.scrollTop ?? 0),
                    });
                },
                380,
            );
        },
        onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
            const p = listPointer.current;

            if (!p || p.id !== e.pointerId) {
                return;
            }

            if (!p.grabbed) {
                if (
                    Math.abs(e.clientY - p.y) > 8 ||
                    Math.abs(e.clientX - p.x) > 8
                ) {
                    clearTimeout(timers.current.grab);
                    p.moved = true;
                }

                return;
            }

            const { y, index, height } = listPosition(e);
            const list = listRef.current!;

            if (y < 50) {
                list.scrollTop -= 10;
            } else if (y > height - 50) {
                list.scrollTop += 10;
            }

            setGrab(
                (g) =>
                    g && {
                        ...g,
                        over: index,
                        y: Math.max(-10, Math.min(height - 40, y - ROW / 2)),
                    },
            );
        },
        onPointerUp: () => {
            const p = listPointer.current;
            listPointer.current = null;
            clearTimeout(timers.current.grab);

            if (!p) {
                return;
            }

            if (p.grabbed) {
                setGrab(null);

                if (grab && grab.over !== grab.from) {
                    swap(grab.from, grab.over);
                } else if (grab) {
                    setPrompt({ slot: grab.from, value: '' });
                }

                return;
            }

            if (!p.moved) {
                setIndexOpen(false);
                setPage(Math.floor(p.index / PER_PAGE));
                flashSlot(p.index);
            }
        },
        onPointerCancel: () => {
            clearTimeout(timers.current.grab);
            listPointer.current = null;
            setGrab(null);
        },
        onScroll: (e: UIEvent<HTMLDivElement>) => {
            setVisiblePage(
                Math.min(
                    PAGES - 1,
                    Math.floor(
                        (e.currentTarget.scrollTop + ROW) / (PER_PAGE * ROW),
                    ),
                ),
            );
        },
    };

    const scrubTo = (e: PointerEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const target = Math.max(
            0,
            Math.min(
                PAGES - 1,
                Math.floor(((e.clientY - rect.top) / rect.height) * PAGES),
            ),
        );

        if (listRef.current) {
            listRef.current.scrollTop = target * PER_PAGE * ROW;
        }

        setVisiblePage(target);
    };

    const scrubHandlers = {
        onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
            scrubActive.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            scrubTo(e);
            setScrubbing(true);
        },
        onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
            if (scrubActive.current) {
                scrubTo(e);
            }
        },
        onPointerUp: () => {
            scrubActive.current = false;
            setScrubbing(false);
        },
    };

    // Sheet & prompt

    const sheetAlbum = sheet !== null ? slots[sheet] : null;

    const addToCarousel = () => {
        setSheet(null);

        if (!sheetAlbum || queue.some((q) => q.id === sheetAlbum.id)) {
            return;
        }

        if (queue.length >= CAROUSEL_SIZE) {
            showToast('Carousel is full. Eject a disc first.');

            return;
        }

        setQueue([...queue, sheetAlbum]);
        showToast(`Loaded into bay ${queue.length + 1}`);
    };

    const remove = () => {
        if (sheet === null || !sheetAlbum) {
            return;
        }

        const before = slots;
        const next = [...slots];
        next[sheet] = null;
        persist(next);
        setSheet(null);
        showToast(`Removed ${sheetAlbum.title}`, () => {
            persist(before);
            setToast(null);
        });
    };

    const confirmPrompt = (target: number) => {
        if (!prompt) {
            return;
        }

        if (target !== prompt.slot) {
            swap(prompt.slot, target);
        }

        setPrompt(null);

        if (!indexOpen) {
            setPage(Math.floor(target / PER_PAGE));
        } else if (listRef.current) {
            listRef.current.scrollTop = Math.max(0, target * ROW - 160);
        }
    };

    const openWallet = () => {
        if (connected) {
            setOpened(true);
        } else {
            window.location.href = connect.url();
        }
    };

    return (
        <>
            <Head title="Wallet" />
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px 8px',
                    background: '#e4e1db',
                    fontFamily: 'Archivo,system-ui,sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                }}
            >
                <Link
                    href={logout()}
                    as="button"
                    onClick={() => router.flushAll()}
                    data-test="logout-button"
                    style={{
                        position: 'fixed',
                        top: 16,
                        right: 16,
                        zIndex: 10,
                        padding: '6px 12px',
                        border: 0,
                        borderRadius: 999,
                        background: 'rgba(16,16,17,.08)',
                        color: '#3b3b3e',
                        font: 'inherit',
                        fontSize: 13,
                        cursor: 'pointer',
                    }}
                >
                    Log out
                </Link>
                <div
                    style={{
                        width: WIDTH * scale,
                        height: HEIGHT * scale,
                        flex: 'none',
                    }}
                >
                    <div
                        style={{
                            width: WIDTH,
                            height: HEIGHT,
                            transform: `scale(${scale})`,
                            transformOrigin: '0 0',
                            position: 'relative',
                            borderRadius: 56,
                            overflow: 'hidden',
                            background: '#101011',
                            boxShadow:
                                '0 0 0 10px #0a0a0b, 0 0 0 11px #3b3b3e, 0 40px 90px rgba(0,0,0,.35)',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            WebkitTapHighlightColor: 'transparent',
                            color: '#ecebe7',
                        }}
                    >
                        <WalletInside
                            animating={animating}
                            bay={bay}
                            current={current}
                            dx={dx}
                            flash={flash}
                            grabHandlers={grabHandlers}
                            moveFrom={moveFrom}
                            onClose={() => {
                                setOpened(false);
                                setMoveFrom(null);
                            }}
                            onGoPlayer={() => current && setScreen('player')}
                            onJumpPage={jumpPage}
                            page={page}
                            playing={playing}
                            press={press}
                            queue={queue}
                            slots={slots}
                            trackHandlers={trackHandlers}
                        />
                        <IndexView
                            grab={grab}
                            listHandlers={listHandlers}
                            listRef={listRef}
                            onClose={() => setIndexOpen(false)}
                            open={indexOpen}
                            scrubHandlers={scrubHandlers}
                            scrubbing={scrubbing}
                            slots={slots}
                            visiblePage={visiblePage}
                        />
                        <PlayerScreen
                            bay={bay}
                            current={current}
                            onBack={() => setScreen('wallet')}
                            onEject={eject}
                            onNext={next}
                            onPrevious={previous}
                            onSelectBay={selectBay}
                            onTogglePlay={togglePlay}
                            open={screen === 'player'}
                            playing={playing}
                            queue={queue}
                            time={
                                current && trackIndex >= 0
                                    ? formatTime(elapsed)
                                    : '--:--'
                            }
                            track={
                                current && trackIndex >= 0
                                    ? `TRK ${pad(trackIndex + 1)}`
                                    : 'TRK --'
                            }
                        />
                        <WalletCover
                            connected={connected}
                            onOpen={openWallet}
                            opened={opened}
                        />

                        {moveFrom !== null &&
                            screen === 'wallet' &&
                            !indexOpen &&
                            opened && (
                                <MoveBanner
                                    onCancel={() => setMoveFrom(null)}
                                    title={slots[moveFrom]?.title ?? ''}
                                />
                            )}
                        {sheet !== null && sheetAlbum && (
                            <DiscSheet
                                album={sheetAlbum}
                                inCarousel={queue.some(
                                    (q) => q.id === sheetAlbum.id,
                                )}
                                onAddToCarousel={addToCarousel}
                                onClose={() => setSheet(null)}
                                onMove={() => {
                                    setSheet(null);
                                    setMoveFrom(sheet);
                                }}
                                onRemove={remove}
                                onSetSlot={() => {
                                    setSheet(null);
                                    setPrompt({ slot: sheet, value: '' });
                                }}
                                queueCount={queue.length}
                                slot={sheet}
                            />
                        )}
                        {prompt && (
                            <SlotPrompt
                                onCancel={() => setPrompt(null)}
                                onChange={(value) =>
                                    setPrompt({ ...prompt, value })
                                }
                                onConfirm={confirmPrompt}
                                slot={prompt.slot}
                                slots={slots}
                                value={prompt.value}
                            />
                        )}
                        {toast && (
                            <Toast
                                message={toast.message}
                                onUndo={toast.undo}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
