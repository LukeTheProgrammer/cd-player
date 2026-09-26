export type Album = {
    id: string;
    uri: string;
    title: string;
    artist: string;
    year: string;
    image: string | null;
    trackIds: string[];
};

export type Slot = Album | null;
