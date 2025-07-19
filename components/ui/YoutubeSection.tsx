"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
};

const YouTubeSection = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchYouTubeVideos = async () => {
      try {
       
        const channelId = "UCB9fnHRQEk7q78syODk8Fdg"; 
        const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

        if (!apiKey) {
          throw new Error("YouTube API key is missing");
        }
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
        );
        const channelData = await channelResponse.json();

        if (channelData.error) {
          throw new Error(channelData.error.message);
        }

        const uploadsPlaylistId = channelData.items[0]?.contentDetails.relatedPlaylists.uploads;

        if (!uploadsPlaylistId) {
          throw new Error("Uploads playlist not found");
        }

        const playlistResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=6&key=${apiKey}`
        );
        const playlistData = await playlistResponse.json();

        if (playlistData.error) {
          throw new Error(playlistData.error.message);
        }

        const fetchedVideos = playlistData.items.map((item: any) => ({
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails?.medium?.url || "",
          publishedAt: item.snippet.publishedAt,
        }));

        setVideos(fetchedVideos);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch YouTube videos");
        setLoading(false);
      }
    };

    fetchYouTubeVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading YouTube videos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-2xl">{error}</div>
      </div>
    );
  }

  return (
    <section className="min-h-screen py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-6xl font-light text-center mb-20 tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          My YouTube Journey
        </motion.h2>

        <motion.p
          className="text-center text-lg mb-12 text-gray-300"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Check out my latest videos on{" "}
          <a
            href="https://www.youtube.com/@prashantdubey1924"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            @prashantdubey1924
          </a>
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              className="bg-gray-900 rounded-lg overflow-hidden shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
              </a>
              <div className="p-4">
                <h3 className="text-xl font-medium text-white mb-2">
                  {video.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {video.description || "No description available"}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </span>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;