import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useTheme } from "../ThemeContext";

const YouTubeSection = () => {
  const { theme } = useTheme();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
        if (!apiKey) {
          throw new Error("YouTube API key is not set");
        }
        const channelId = "UCB9fnHRQEk7q78syODk8Fdg"; 
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=6&order=date&type=video&key=${apiKey}`
        );
        if (!res.ok) {
          throw new Error(`API request failed with status ${res.status}`);
        }
        const data = await res.json();
        if (!data.items || data.items.length === 0) {
          setError("No videos found for this channel.");
        } else {
          setVideos(data.items);
        }
      } catch (error: any) {
        console.error("Failed to fetch YouTube videos:", error);
        setError(error.message || "Failed to load YouTube videos.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  return (
    <section
      className={`min-h-screen py-24 relative z-10 ${
        theme === "light" ? "bg-white" : "bg-black"
      } ${theme === "light" ? "text-gray-900" : "text-white"}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-6xl font-light text-center mb-20 tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          YouTube Content
        </motion.h2>
        {loading ? (
          <p className="text-center">Loading YouTube videos...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : videos.length === 0 ? (
          <p className="text-center">No videos available.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, index) => (
              <motion.div
                key={video.id.videoId}
                className={`p-6 rounded-2xl shadow-lg backdrop-blur-lg ${
                  theme === "light" ? "bg-white/80 border border-emerald-600/20" : "bg-black/80 border border-emerald-400/20"
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  borderColor: theme === "light" ? "rgb(5 150 105 / 0.5)" : "rgb(16 185 129 / 0.5)",
                  scale: 1.02,
                }}
              >
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <h3 className="text-lg font-semibold">{video.snippet.title}</h3>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                  className={`mt-2 inline-flex items-center ${
                    theme === "light" ? "text-emerald-600 hover:text-emerald-700" : "text-emerald-400 hover:text-emerald-300"
                  }`}
                >
                  Watch Video <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default YouTubeSection;