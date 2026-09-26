import { useCallback, useEffect, useRef, useState } from 'react';
import type { PlaybackState, SpotifyPlayer } from '@/modules/player/types';
import { token } from '@/routes/music';

const SDK_URL = 'https://sdk.scdn.co/spotify-player.js';

async function fetchToken(): Promise<string> {
    const response = await fetch(token.url(), {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
    });
    const data = (await response.json()) as { access_token: string };

    return data.access_token;
}

/**
 * Runs the in-browser Spotify player and exposes its state plus transport controls.
 */
export function usePlayer(onError: (message: string) => void) {
    const playerRef = useRef<SpotifyPlayer | null>(null);
    const deviceRef = useRef<string | null>(null);
    const onErrorRef = useRef(onError);
    const [state, setState] = useState<PlaybackState>({
        ready: false,
        paused: true,
        position: 0,
        duration: 0,
        trackIds: [],
        updatedAt: 0,
    });

    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    useEffect(() => {
        window.onSpotifyWebPlaybackSDKReady = () => {
            if (!window.Spotify) {
                return;
            }

            const player = new window.Spotify.Player({
                name: 'CD Player',
                getOAuthToken: (callback) => void fetchToken().then(callback),
                volume: 0.8,
            });

            player.addListener('ready', ({ device_id }) => {
                deviceRef.current = device_id;
                setState((s) => ({ ...s, ready: true }));
            });
            player.addListener('not_ready', () =>
                setState((s) => ({ ...s, ready: false })),
            );
            player.addListener('player_state_changed', (playback) => {
                if (!playback) {
                    return;
                }

                const track = playback.track_window.current_track;

                setState((s) => ({
                    ...s,
                    paused: playback.paused,
                    position: playback.position,
                    duration: playback.duration,
                    trackIds: [track?.id, track?.linked_from?.id].filter(
                        (id): id is string => !!id,
                    ),
                    updatedAt: performance.now(),
                }));
            });
            player.addListener('account_error', () =>
                onErrorRef.current('Spotify Premium required'),
            );
            player.addListener('authentication_error', () =>
                onErrorRef.current('Reconnect Spotify'),
            );
            player.addListener('initialization_error', () =>
                onErrorRef.current('Player unsupported here'),
            );
            player.addListener('playback_error', () =>
                onErrorRef.current('Playback error'),
            );

            void player.connect();
            playerRef.current = player;
        };

        if (window.Spotify) {
            window.onSpotifyWebPlaybackSDKReady();
        } else if (!document.querySelector(`script[src="${SDK_URL}"]`)) {
            const script = document.createElement('script');
            script.src = SDK_URL;
            script.async = true;
            document.body.appendChild(script);
        }

        return () => {
            playerRef.current?.disconnect();
            playerRef.current = null;
        };
    }, []);

    const playAlbum = useCallback(async (uri: string, trackIndex = 0) => {
        if (!deviceRef.current) {
            onErrorRef.current('Player not ready');

            return;
        }

        await playerRef.current?.activateElement();

        const response = await fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${deviceRef.current}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${await fetchToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    context_uri: uri,
                    offset: { position: trackIndex },
                }),
            },
        );

        if (!response.ok) {
            onErrorRef.current('Could not start playback');
        }
    }, []);

    const togglePlay = useCallback(
        () => void playerRef.current?.togglePlay(),
        [],
    );
    const pause = useCallback(() => void playerRef.current?.pause(), []);
    const seek = useCallback(
        (ms: number) => void playerRef.current?.seek(ms),
        [],
    );
    const nextTrack = useCallback(
        () => void playerRef.current?.nextTrack(),
        [],
    );
    const previousTrack = useCallback(
        () => void playerRef.current?.previousTrack(),
        [],
    );

    return {
        state,
        playAlbum,
        togglePlay,
        pause,
        seek,
        nextTrack,
        previousTrack,
    };
}
