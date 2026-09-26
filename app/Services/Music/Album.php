<?php

namespace App\Services\Music;

final readonly class Album
{
    /**
     * @param  array<int, string>  $trackIds
     */
    public function __construct(
        public string $id,
        public string $uri,
        public string $title,
        public string $artist,
        public string $year,
        public ?string $image,
        public array $trackIds,
    ) {}

    /**
     * @return array{id: string, uri: string, title: string, artist: string, year: string, image: string|null, trackIds: array<int, string>}
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'uri' => $this->uri,
            'title' => $this->title,
            'artist' => $this->artist,
            'year' => $this->year,
            'image' => $this->image,
            'trackIds' => $this->trackIds,
        ];
    }
}
