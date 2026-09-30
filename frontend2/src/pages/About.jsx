import anime from "animejs";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useRef, useState } from "react";

import DimLabel from "../components/DimLabel.jsx";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import { IMAGES, VIDEOS } from "../constants/images.js";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const prefersReducedMotion = useReducedMotion();
  const contentRef = useRef(null);
  const dividerRef = useRef(null);

  // GSAP: staggered section reveal for the copy block as it scrolls into view.
  useEffect(() => {
    if (prefersReducedMotion || !contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current.querySelectorAll("[data-reveal]"),
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
          },
        }
      );
    }, contentRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Anime.js: a decorative divider line that draws itself in.
  useEffect(() => {
    if (prefersReducedMotion || !dividerRef.current) return;
    anime({
      targets: dividerRef.current,
      width: ["0%", "64px"],
      opacity: [0, 1],
      easing: "easeOutExpo",
      duration: 900,
      delay: 300,
    });
  }, [prefersReducedMotion]);

  return (
    <div className="min-h-screen bg-deep light:bg-surface-light">
      <Navbar showBack />

      <AboutHero />

      <section ref={contentRef} className="mx-auto max-w-5xl px-6 py-24 lg:px-10">
        <div data-reveal>
          <DimLabel>Our approach</DimLabel>
        </div>
        <h2 data-reveal className="mt-4 max-w-2xl font-display text-3xl font-medium text-linen sm:text-4xl light:text-deep">
          Why we build with data instead of pixels
        </h2>
        <div ref={dividerRef} className="mt-6 h-[2px] bg-brass" style={{ width: 0 }} />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div data-reveal className="space-y-6">
            <p className="text-justify text-lg leading-[1.9] tracking-[0.005em] text-muted light:text-muted-light">
              Most AI interior design tools stop at a picture. A picture can't tell you whether
              a desk fits in the corner, or how a room feels once you're standing inside it.
              InDwell was built to close that gap — the AI still designs the room, but it hands
              back structured data instead of pixels, and that data becomes a real, walkable 3D
              space you can move through before a single piece of furniture is bought.
            </p>
            <p className="text-justify text-lg leading-[1.9] tracking-[0.005em] text-muted light:text-muted-light">
              Every design starts as a plain-language brief. Google Gemini turns it into a floor
              plan: wall colors, furniture positions, lighting, dimensions — all checked against
              a strict schema before anything is rendered. A-Frame takes that schema and builds
              it live, so you can walk it, rotate it, and compare versions before you commit to
              anything.
            </p>
          </div>

          <div data-reveal className="glass-card h-fit p-6" style={{ perspective: "800px" }}>
            <motion.div whileHover={!prefersReducedMotion ? { rotateX: 2, rotateY: -2, y: -2 } : {}} transition={{ type: "spring", stiffness: 200, damping: 18 }}>
              <DimLabel className="!justify-start">By the numbers</DimLabel>
              <dl className="mt-5 space-y-4">
                <Stat label="Room schema fields validated" value="9" />
                <Stat label="Free daily AI generations" value="10" />
                <Stat label="Versions kept per design" value="Unlimited" />
              </dl>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-baseline justify-between border-b border-white/5 pb-3 light:border-hairline-light">
      <dt className="text-xs text-muted light:text-muted-light">{label}</dt>
      <dd className="font-display text-lg text-brass">{value}</dd>
    </div>
  );
}

/**
 * Looping background video hero, distinct from the landing page's still photo.
 * Falls back to a static poster image on small screens / reduced-motion to
 * keep things light and avoid unnecessary video decode cost on mobile.
 */
function AboutHero() {
  const prefersReducedMotion = useReducedMotion();
  const [canPlayVideo, setCanPlayVideo] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setCanPlayVideo(mq.matches && !prefersReducedMotion);
    const handler = (e) => setCanPlayVideo(e.matches && !prefersReducedMotion);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [prefersReducedMotion]);

  return (
    <div className="relative h-[56vh] min-h-[420px] overflow-hidden">
      {canPlayVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={VIDEOS.aboutHeroPoster}
          className="h-full w-full object-cover"
        >
          <source src={VIDEOS.aboutHero} type="video/mp4" />
        </video>
      ) : (
        <img src={IMAGES.livingRoomWhite} alt="" className="h-full w-full object-cover" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/60 to-deep/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-deep/40 via-transparent to-deep/10" />

      <div className="absolute inset-0 flex flex-col items-start justify-end px-6 pb-16 lg:px-10">
        <DimLabel>About InDwell</DimLabel>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 max-w-2xl font-display text-4xl font-medium text-linen sm:text-5xl"
        >
          A room should be felt before it's built.
        </motion.h1>
      </div>
    </div>
  );
}
