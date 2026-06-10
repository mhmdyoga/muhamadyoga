/* eslint-disable react-hooks/purity */
// components/Footer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import gsap from "gsap";
import {
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaMapMarkerAlt,
  FaRocket,
  FaHeart,
} from "react-icons/fa";
import { SiGitlab } from "react-icons/si";

const socialLinks = [
  {
    name: "Instagram",
    icon: FaInstagram,
    url: "https://instagram.com/my0_6_",
    color: "#E1306C",
    emoji: "🐙",
  },
  {
    name: "LinkedIn",
    icon: FaLinkedinIn,
    url: "https://www.linkedin.com/in/muhamad-yoga-cahaya-pratama-5a115a2a1/",
    color: "#0A66C2",
    emoji: "🐙",
  },
  {
    name: "GitLab",
    icon: SiGitlab,
    url: "https://gitlab.com/mhmdyoga",
    color: "#FC6D26",
    emoji: "🐙",
  },
  {
    name: "GitHub",
    icon: FaGithub,
    url: "https://github.com/mhmdyoga",
    color: "#333",
    emoji: "🐙",
  },
];

const techStack = [
  { name: "Next.js", emoji: "⚡" },
  { name: "TypeScript", emoji: "" },
  { name: "Tailwind CSS", emoji: "🎨" },
  { name: "GSAP", emoji: "🎬" },
  { name: "Framer Motion", emoji: "️" },
  { name: "Lenis", emoji: "🌊" },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const [hoveredSocial, setHoveredSocial] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const isInView = useInView(footerRef, { once: true, margin: "-100px" });
  const controls = useAnimation();

  // GSAP animations
  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      // Floating stars animation
      gsap.utils.toArray<HTMLElement>(".footer-star").forEach((star, i) => {
        gsap.to(star, {
          y: "random(-20, 20)",
          x: "random(-15, 15)",
          rotation: "random(-180, 180)",
          duration: "random(2, 4)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.3,
        });
      });

      // Orbit rotation
      if (orbitRef.current) {
        gsap.to(orbitRef.current, {
          rotation: 360,
          duration: 60,
          repeat: -1,
          ease: "none",
        });
      }

      // Satellite float
      gsap.to(".footer-satellite", {
        y: -15,
        x: 10,
        rotation: 5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Planet bob
      gsap.to(".footer-planet", {
        y: -10,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Cloud drift
      gsap.to(".footer-cloud", {
        x: 20,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  // Framer Motion entrance
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!footerRef.current) return;
      const rect = footerRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      });
    };

    const footer = footerRef.current;
    footer?.addEventListener("mousemove", handleMouseMove);
    return () => footer?.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden bg-[#f5f0eb] pt-20 pb-8"
    >
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Dashed orbital path */}
        <motion.div
          ref={orbitRef}
          className="absolute top-1/2 left-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-gray-400/30"
          style={{ originX: 0.5, originY: 0.5 }}
        />

        {/* Stars */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="footer-star absolute text-gray-800"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 12 + 8}px`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            ✦
          </motion.div>
        ))}

        {/* Floating planet */}
        <motion.div
          className="footer-planet absolute top-16 right-20"
          style={{
            x: mousePos.x * 20,
            y: mousePos.y * 20,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 30 }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="25" fill="#e8e0d8" stroke="#1a1a1a" strokeWidth="2.5" />
            <ellipse cx="40" cy="40" rx="38" ry="10" stroke="#1a1a1a" strokeWidth="2" fill="none" transform="rotate(-20 40 40)" />
            <circle cx="32" cy="35" r="4" fill="#d4c9be" />
            <circle cx="48" cy="42" r="3" fill="#d4c9be" />
          </svg>
        </motion.div>

        {/* Satellite */}
        <motion.div
          className="footer-satellite absolute bottom-32 left-16"
          style={{
            x: mousePos.x * -15,
            y: mousePos.y * -15,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 30 }}
        >
          <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
            <rect x="40" y="20" width="20" height="20" rx="4" fill="#e8e0d8" stroke="#1a1a1a" strokeWidth="2" />
            <circle cx="50" cy="30" r="6" fill="#4A90D9" stroke="#1a1a1a" strokeWidth="1.5" />
            <rect x="10" y="22" width="25" height="16" rx="2" fill="#B8D4E8" stroke="#1a1a1a" strokeWidth="2" />
            <rect x="65" y="22" width="25" height="16" rx="2" fill="#B8D4E8" stroke="#1a1a1a" strokeWidth="2" />
            <line x1="22" y1="30" x2="40" y2="30" stroke="#1a1a1a" strokeWidth="2" />
            <line x1="60" y1="30" x2="78" y2="30" stroke="#1a1a1a" strokeWidth="2" />
            <line x1="50" y1="20" x2="50" y2="10" stroke="#1a1a1a" strokeWidth="2" />
            <circle cx="50" cy="8" r="3" fill="#1a1a1a" />
          </svg>
        </motion.div>

        {/* Cloud */}
        <motion.div
          className="footer-cloud absolute bottom-20 right-32"
          style={{
            x: mousePos.x * 10,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 30 }}
        >
          <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
            <path
              d="M20 45 C10 45 5 38 10 30 C5 22 15 15 25 18 C30 8 50 8 55 18 C65 15 75 22 70 30 C80 30 85 38 75 45 Z"
              fill="#f5f0eb"
              stroke="#1a1a1a"
              strokeWidth="2"
            />
            <circle cx="35" cy="32" r="2" fill="#1a1a1a" />
            <circle cx="55" cy="28" r="1.5" fill="#1a1a1a" />
          </svg>
        </motion.div>

        {/* Rocket */}
        <motion.div
          className="absolute top-32 left-1/3"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            x: mousePos.x * -25,
            y: mousePos.y * -25,
          }}
        >
          <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
            <path d="M30 5 C30 5 15 25 15 45 L15 55 L25 55 L25 65 L35 65 L35 55 L45 55 L45 45 C45 25 30 5 30 5Z" fill="#e8e0d8" stroke="#1a1a1a" strokeWidth="2" />
            <circle cx="30" cy="35" r="8" fill="#4A90D9" stroke="#1a1a1a" strokeWidth="1.5" />
            <path d="M15 55 L5 65 L15 60 Z" fill="#FF6B35" stroke="#1a1a1a" strokeWidth="1.5" />
            <path d="M45 55 L55 65 L45 60 Z" fill="#FF6B35" stroke="#1a1a1a" strokeWidth="1.5" />
            <path d="M25 65 Q30 80 35 65" fill="#FFD700" stroke="#1a1a1a" strokeWidth="1" />
            <path d="M27 65 Q30 75 33 65" fill="#FF6B35" stroke="none" />
          </svg>
        </motion.div>
      </div>

      {/* Main footer content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="relative z-10 mx-auto max-w-6xl px-6"
      >
        {/* Top section - Connect */}
        <motion.div variants={itemVariants} className="mb-16 text-center">
          <motion.h2
            className="mb-2 text-5xl font-black tracking-tight text-gray-900 md:text-7xl"
            whileHover={{ scale: 1.02 }}
          >
            LET&apos;S CONNECT<span className="text-amber-400">.</span>
          </motion.h2>
          <p className="mb-10 text-sm tracking-widest text-gray-500 uppercase">
            Find me across the universe
          </p>

          {/* Social icons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  onMouseEnter={() => setHoveredSocial(index)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full blur-xl"
                    animate={{
                      opacity: hoveredSocial === index ? 0.4 : 0,
                      backgroundColor: social.color,
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-900 bg-[#1a1a1a] text-white shadow-lg transition-colors duration-300 group-hover:bg-white group-hover:text-gray-900 md:h-20 md:w-20">
                    <Icon className="h-6 w-6 md:h-7 md:w-7" />

                    {/* Emoji popup */}
                    <motion.div
                      className="absolute -top-8 text-2xl"
                      animate={{
                        y: hoveredSocial === index ? -10 : 0,
                        opacity: hoveredSocial === index ? 1 : 0,
                        scale: hoveredSocial === index ? 1 : 0.5,
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {social.emoji}
                    </motion.div>
                  </div>

                  {/* Label */}
                  <motion.span
                    className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600 whitespace-nowrap"
                    animate={{
                      opacity: hoveredSocial === index ? 1 : 0,
                      y: hoveredSocial === index ? 0 : 5,
                    }}
                  >
                    {social.name}
                  </motion.span>
                </motion.a>
              );
            })}
          </div>
        </motion.div>

        {/* Middle section - Address & Tech */}
        <motion.div
          variants={itemVariants}
          className="mb-16 grid gap-8 md:grid-cols-2"
        >
          {/* Address Card */}
          <motion.div
            className="group relative rounded-2xl border-2 border-gray-900 bg-white p-6 shadow-[4px_4px_0px_#1a1a1a] transition-shadow hover:shadow-[6px_6px_0px_#1a1a1a]"
            whileHover={{ y: -3 }}
            whileTap={{ y: 0, boxShadow: "2px 2px 0px #1a1a1a" }}
          >
            <div className="mb-3 flex items-center gap-2">
              <FaMapMarkerAlt className="text-amber-500" />
              <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                My Location
              </span>
            </div>
            <p className="text-lg font-semibold leading-relaxed text-gray-900">
              Jl. KH Atim 01
              <br />
              Muara Ciujung Timur,
              <br />
              Rangkasbitung, Banten,
              <br />
              Indonesia 🇩
            </p>

            {/* Mini map decoration */}
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-green-500"
              />
              <span>Currently available for work</span>
            </div>
          </motion.div>

          {/* Tech Stack Card */}
          <motion.div
            className="group relative rounded-2xl border-2 border-gray-900 bg-[#1a1a1a] p-6 text-white shadow-[4px_4px_0px_#f5f0eb] transition-shadow hover:shadow-[6px_6px_0px_#f5f0eb]"
            whileHover={{ y: -3 }}
            whileTap={{ y: 0 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <FaRocket className="text-amber-400" />
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                Built With Love &
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, i) => (
                <motion.span
                  key={tech.name}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm font-medium transition-colors hover:border-amber-400 hover:bg-gray-700"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <span>{tech.emoji}</span>
                  {tech.name}
                </motion.span>
              ))}
            </div>

            <p className="mt-4 text-sm text-gray-400">
              Crafted with{" "}
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block text-red-400"
              >
                <FaHeart className="inline" />
              </motion.span>{" "}
              by Yoga.dev
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-between gap-4 border-t-2 border-dashed border-gray-300 pt-8 md:flex-row"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-gray-900">
              YOGA<span className="text-amber-400">.</span>DEV
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>© 2026</span>
            <span>·</span>
            <span>All rights reserved</span>
            <span>·</span>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block"
            >
              🚀
            </motion.span>
            <span>Made in Rangkasbitung</span>
          </div>

          {/* Scroll to top */}
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 rounded-full border-2 border-gray-900 bg-amber-400 px-5 py-2 text-sm font-bold text-gray-900 shadow-[3px_3px_0px_#1a1a1a] transition-all hover:shadow-[1px_1px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Space
            <FaRocket className="rotate-[-45deg]" />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Interactive cursor follower */}
      <motion.div
        className="pointer-events-none fixed z-50 h-4 w-4 rounded-full border-2 border-amber-400"
        animate={{
          x: typeof window !== "undefined" ? 0 : 0,
          y: 0,
        }}
        style={{
          mixBlendMode: "difference",
        }}
      />
    </footer>
  );
}