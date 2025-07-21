"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

const SkillsSection = ({ skills }) => {
  const { theme } = useTheme();
  const controlsTop = useAnimation();
  const controlsBottom = useAnimation();
  const containerRefTop = useRef(null);
  const containerRefBottom = useRef(null);
  const [contributionData, setContributionData] = useState([]);

  const duplicatedSkillsTop = [...skills, ...skills];
  const duplicatedSkillsBottom = [...skills].reverse().concat([...skills].reverse());
  const animationDuration = skills.length * 0.75;
  const carouselWidth = skills.length * 200;

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const response = await fetch("/api/github?username=prashantxy");
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const contributions = data.weeks.flatMap((week) =>
          week.contributionDays.map((day) => ({
            date: day.date,
            count: day.contributionCount,
          }))
        );

        setContributionData(contributions);
      } catch (error) {
        console.error("Error fetching contributions:", error.message);
      }
    };

    fetchContributions();
  }, []);

  useEffect(() => {
    controlsTop.start({
      x: carouselWidth,
      transition: {
        x: { repeat: Infinity, repeatType: "loop", duration: animationDuration, ease: "linear" },
      },
    });

    controlsBottom.start({
      x: -carouselWidth,
      transition: {
        x: { repeat: Infinity, repeatType: "loop", duration: animationDuration, ease: "linear" },
      },
    });
  }, [controlsTop, controlsBottom, carouselWidth, animationDuration]);

  const handleHoverTop = (hovering) => {
    if (hovering) controlsTop.stop();
    else
      controlsTop.start({
        x: carouselWidth,
        transition: { x: { repeat: Infinity, repeatType: "loop", duration: animationDuration, ease: "linear" } },
      });
  };

  const handleHoverBottom = (hovering) => {
    if (hovering) controlsBottom.stop();
    else
      controlsBottom.start({
        x: -carouselWidth,
        transition: { x: { repeat: Infinity, repeatType: "loop", duration: animationDuration, ease: "linear" } },
      });
  };

  const currentYear = new Date().getFullYear();

  return (
    <section
      className={`min-h-[50vh] py-12 relative z-10 ${
        theme === "light" ? "bg-white/95 text-gray-900" : "bg-black/95 text-white"
      } backdrop-blur-md`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-6xl font-light text-center mb-12 tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Skills & Contributions
        </motion.h2>

        {/* Skill Carousel */}
        <div className="space-y-12">
          <div className="space-y-8">
            <div className="overflow-hidden" onMouseEnter={() => handleHoverTop(true)} onMouseLeave={() => handleHoverTop(false)}>
              <motion.div
                ref={containerRefTop}
                className="flex flex-nowrap"
                animate={controlsTop}
                style={{ width: `${carouselWidth * 2}px` }}
              >
                {duplicatedSkillsTop.map((skill, index) => (
                  <motion.div
                    key={`top-${skill.name}-${index}`}
                    className={`flex-shrink-0 p-4 rounded-2xl shadow-lg backdrop-blur-lg text-center mx-2 w-[180px] ${
                      theme === "light"
                        ? "bg-white/80 border border-emerald-600/20"
                        : "bg-gray-900/80 border border-emerald-400/20"
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{
                      borderColor: theme === "light" ? "#059669" : "#10B981",
                      scale: 1.02,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="flex justify-center mb-2">{skill.icon}</div>
                    <p className="font-semibold">{skill.name}</p>
                    <p className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} text-sm`}>{skill.category}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="overflow-hidden" onMouseEnter={() => handleHoverBottom(true)} onMouseLeave={() => handleHoverBottom(false)}>
              <motion.div
                ref={containerRefBottom}
                className="flex flex-nowrap"
                animate={controlsBottom}
                style={{ width: `${carouselWidth * 2}px` }}
              >
                {duplicatedSkillsBottom.map((skill, index) => (
                  <motion.div
                    key={`bottom-${skill.name}-${index}`}
                    className={`flex-shrink-0 p-4 rounded-2xl shadow-lg backdrop-blur-lg text-center mx-2 w-[180px] ${
                      theme === "light"
                        ? "bg-white/80 border border-emerald-600/20"
                        : "bg-gray-900/80 border border-emerald-400/20"
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{
                      borderColor: theme === "light" ? "#059669" : "#10B981",
                      scale: 1.02,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="flex justify-center mb-2">{skill.icon}</div>
                    <p className="font-semibold">{skill.name}</p>
                    <p className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} text-sm`}>{skill.category}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Contribution Heatmap */}
          <div className="mt-12">
            <motion.h3
              className="text-2xl font-semibold text-center mb-6"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              GitHub Contributions
            </motion.h3>
            <motion.div
              className={`p-6 rounded-2xl shadow-lg backdrop-blur-lg ${
                theme === "light" ? "bg-white/95" : "bg-gray-900/95"
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-full overflow-x-auto">
                <CalendarHeatmap
                  startDate={new Date(`${currentYear}-01-01`)}
                  endDate={new Date(`${currentYear}-12-31`)}
                  values={contributionData}
                  classForValue={(value) => {
                    if (!value) return "color-empty";
                    if (value.count <= 0) return "color-empty";
                    if (value.count <= 5) return "color-scale-1";
                    if (value.count <= 10) return "color-scale-2";
                    return "color-scale-3";
                  }}
                  tooltipDataAttrs={(value) => ({
                    "data-tip": `${value?.count || 0} contributions on ${new Date(value?.date).toDateString()}`,
                  })}
                  showWeekdayLabels={true}
                  weekdayLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
                  monthLabels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
                  className="w-full max-w-4xl mx-auto"
                />
                <style jsx>{`
                  .color-empty { background-color: ${theme === "light" ? "#ebedf0" : "#1a1a1a"}; }
                  .color-scale-1 { background-color: ${theme === "light" ? "#c6f6d5" : "#065f46"}; }
                  .color-scale-2 { background-color: ${theme === "light" ? "#48bb78" : "#059669"}; }
                  .color-scale-3 { background-color: ${theme === "light" ? "#2f855a" : "#10b981"}; }
                  .react-calendar-heatmap rect:hover {
                    filter: brightness(1.2);
                  }
                `}</style>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
