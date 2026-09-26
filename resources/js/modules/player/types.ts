export type SpotifyTrack = {
    id: string | null;
    linked_from?: { id: string | null };
};

export type SpotifyPlaybackState = {
    paused: boolean;
    position: number;
    duration: number;
    track_window: { current_track: SpotifyTrack | null };
};

export type SpotifyPlayer = {
    connect(): Promise<boolean>;
    disconnect(): void;
    activateElement(): Promise<void>;
    togglePlay(): Promise<void>;
    pause(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    nextTrack(): Promise<void>;
    previousTrack(): Promise<void>;
    addListener(
        event: 'ready' | 'not_ready',
        callback: (data: { device_id: string }) => void,
    ): void;
    addListener(
        event: 'player_state_changed',
        callback: (state: SpotifyPlaybackState | null) => void,
    ): void;
    addListener(
        event:
            | 'initialization_error'
            | 'authentication_error'
            | 'account_error'
            | 'playback_error',
        callback: (error: { message: string }) => void,
    ): void;
};

export type PlaybackState = {
    ready: boolean;
    paused: boolean;
    position: number;
    duration: number;
    trackIds: string[];
    updatedAt: number;
};

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady?: () => void;
        Spotify?: {
            Player: new (options: {
                name: string;
                getOAuthToken: (callback: (token: string) => void) => void;
                volume?: number;
            }) => SpotifyPlayer;
        };
    }
}
