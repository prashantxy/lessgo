"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Slider from "react-slick";
import { useTheme } from "../ThemeContext";

const PrevArrow = ({
  className,
  style,
  onClick,
  theme,
}: {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  theme: "light" | "dark";
}) => (
  <button
    className={`${className || ""} slick-prev flex items-center justify-center w-10 h-10 rounded-full z-10 ${
      theme === "light"
        ? "bg-gray-800/50 text-black hover:bg-gray-800/80"
        : "bg-gray-200/50 text-emerald-400 hover:bg-gray-200/80"
    }`}
    style={{ ...style, left: "10px" }}
    onClick={onClick}
    aria-label="Previous video"
  >
    ←
  </button>
);

const NextArrow = ({
  className,
  style,
  onClick,
  theme,
}: {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  theme: "light" | "dark";
}) => (
  <button
    className={`${className || ""} slick-next flex items-center justify-center w-10 h-10 rounded-full z-10 ${
      theme === "light"
        ? "bg-gray-800/50 text-black hover:bg-gray-800/80"
        : "bg-gray-200/50 text-emerald-400 hover:bg-gray-200/80"
    }`}
    style={{ ...style, right: "10px" }}
    onClick={onClick}
    aria-label="Next video"
  >
    →
  </button>
);

const carouselSettings = (theme: "light" | "dark") => ({
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
  autoplay: false,
  prevArrow: <PrevArrow theme={theme} />,
  nextArrow: <NextArrow theme={theme} />,
});

const YouTubeSection = () => {
  const { theme } = useTheme();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

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
          throw new Error(
            `API request failed with status ${res.status}: daily quota exceeded kal tak wait karlo`
          );
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

  const displayedVideos = showAll ? videos : videos.slice(0, 3);

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
          <>
            {/* Mobile View: Carousel with all videos */}
            <div className="block md:hidden">
              <Slider {...carouselSettings(theme)}>
                {videos.map((video, index) => (
                  <div key={video.id.videoId} className="p-4">
                    <motion.div
                      className={`p-6 rounded-2xl shadow-lg backdrop-blur-lg ${
                        theme === "light"
                          ? "bg-white/80 border border-emerald-600/20"
                          : "bg-black/80 border border-emerald-400/20"
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
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
                          theme === "light"
                            ? "text-emerald-600 hover:text-emerald-700"
                            : "text-emerald-400 hover:text-emerald-300"
                        }`}
                        aria-label={`Watch ${video.snippet.title}`}
                      >
                        Watch Video <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
                      </a>
                    </motion.div>
                  </div>
                ))}
              </Slider>
            </div>

            {/* Desktop View: Grid with top 3 videos and View More */}
            <div className="hidden md:grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayedVideos.map((video, index) => (
                <motion.div
                  key={video.id.videoId}
                  className={`p-6 rounded-2xl shadow-lg backdrop-blur-lg ${
                    theme === "light"
                      ? "bg-white/80 border border-emerald-600/20"
                      : "bg-black/80 border border-emerald-400/20"
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{
                    borderColor:
                      theme === "light"
                        ? "rgb(5 150 105 / 0.5)"
                        : "rgb(16 185 129 / 0.5)",
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
                      theme === "light"
                        ? "text-emerald-600 hover:text-emerald-700"
                        : "text-emerald-400 hover:text-emerald-300"
                    }`}
                    aria-label={`Watch ${video.snippet.title}`}
                  >
                    Watch Video <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
                  </a>
                </motion.div>
              ))}
            </div>

            {/* View More Button for Desktop */}
            {videos.length > 3 && !showAll && (
              <div className="hidden md:flex justify-center mt-8">
                <motion.button
                  onClick={() => setShowAll(true)}
                  className={`px-6 py-3 rounded-full font-semibold text-lg transition-colors ${
                    theme === "light"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-emerald-400 text-black hover:bg-emerald-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="View more videos"
                >
                  View More
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default YouTubeSection;