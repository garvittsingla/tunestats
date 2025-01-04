import { getAccessToken } from "@/lib/getAccessToken";

export default async function handler(req, res) {
    const { userId, timeRange } = req.query;

    try {
        const accessToken = await getAccessToken(userId);

        const response = await fetch(
            `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=50`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (response.ok) {
            const data = await response.json();
            const topTracks = data.items.map((track) => ({
                trackId: track.id,
                trackName: track.name,
                trackArtists: track.artists.map((_artist) => _artist.name).join(", "),
                trackAlbum: track.album.name,
                trackAlbumImage: track.album.images[0].url,
            }));
            res.status(200).json({ topTracks });
        } else {
            console.error("Failed to fetch top tracks", response.statusText);
            res.status(response.status).json({ error: "Failed to fetch top tracks" });
        }
    } catch (error) {
        console.error("Error fetching top tracks:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}