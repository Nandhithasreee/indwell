import {
  faCamera,
  faCube,
  faLayerGroup,
  faPalette,
  faShieldHalved,
  faStar,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import anime from "animejs";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import DimLabel from "../components/DimLabel.jsx";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import { IMAGES } from "../constants/images.js";

gsap.registerPlugin(ScrollTrigger);
const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const FEATURES = [
  {
    icon: faWandMagicSparkles,
    title: "Describe, don't sketch",
    body: "Type your room in plain language — size, budget, style, mood. InDwell's prompt engine turns it into a precise design brief for Gemini.",
  },
  {
    icon: faCube,
    title: "Real 3D, not an image",
    body: "Gemini returns structured room data, not pixels. Every wall, light, and chair is a real object you can walk around, not a flat render.",
  },
  {
    icon: faPalette,
    title: "Two budgets, one prompt",
    body: "Every generation includes a luxury upgrade and a budget-trimmed version, so you can see the range before committing to anything.",
  },
  {
    icon: faLayerGroup,
    title: "Version your rooms",
    body: "Regenerate as many times as you like. Every version is saved, so you can compare layouts side by side before picking one.",
  },
  {
    icon: faCamera,
    title: "Walk it before you build it",
    body: "Rotate, zoom, and step inside the room from the camera's eye view. Screenshot any angle to share with a contractor or partner.",
  },
  {
    icon: faShieldHalved,
    title: "Validated by design",
    body: "Every AI response is checked against a strict schema before it ever reaches the renderer, so the 3D scene never breaks on bad data.",
  },
];

const ROOM_CATEGORIES = [
  {
    eyebrow: "Curated spaces",
    title: "Luxe Living",
    body: "Full-height glass, warm brass fixtures, and layered lighting — generated for entertaining and everyday comfort alike.",
    photo: IMAGES.livingRoomFireplace,
  },
  {
    eyebrow: "Curated spaces",
    title: "Serene Sanctuary",
    body: "Bedroom layouts tuned for deep rest: soft textiles, blackout zoning, and a reading corner that earns its square footage.",
    photo: IMAGES.bedroomCozy,
  },
  {
    eyebrow: "Curated spaces",
    title: "Considered Kitchens",
    body: "Wood-toned islands, warm pendant lighting, and a layout built around how you actually cook and gather.",
    photo: IMAGES.kitchenWood,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-deep light:bg-surface-light">
      <Navbar />
      <CinematicHero />
      <RoomCategories />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}

/**
 * Hero slideshow content. Slide 0 is the original hero image + copy,
 * unchanged. Each slide after that pairs a different room photo with a
 * short line about a different InDwell feature (no tech-stack talk).
 */
const HERO_SLIDES = [
  {
    image: IMAGES.heroExterior,
    line1: "Reside inside",
    line2: "your vision.",
    paragraph:
      "Describe your dream room in a sentence. InDwell turns it into structured AI data and builds a real, walkable 3D space from it — not a picture of one.",
  },
  {
    image: IMAGES.livingRoomFireplace,
    line1: "Not an image.",
    line2: "A real place.",
    paragraph:
      "Every wall, light, and chair in your room is a positioned 3D object — something you can walk through and look around, not a flat picture to stare at.",
  },
  {
    image: IMAGES.bedroomCozy,
    line1: "Two budgets.",
    line2: "One prompt.",
    paragraph:
      "Every design comes with a luxury upgrade and a trimmed-down version, so you can see the full range before committing to anything.",
  },
  {
    image: IMAGES.kitchenWood,
    line1: "Regenerate",
    line2: "until it's right.",
    paragraph:
      "Keep every version you generate and compare layouts side by side before choosing the one that actually fits your room.",
  },
  {
    image: IMAGES.officeDesk,
    line1: "Walk it",
    line2: "before you build it.",
    paragraph:
      "Rotate, zoom, and step inside from eye level. Screenshot any angle to share with a contractor or partner.",
  },
];

/* ------------------------------------------------------------------ */
/* Cinematic hero — mouse-parallax background, curtain-reveal headline. */
/* Custom "explore" cursor and hero CTA buttons removed per spec;       */
/* Sign In / Sign Up now live only in the Navbar.                       */
/* ------------------------------------------------------------------ */
function CinematicHero() {
  const heroRef = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const layerBackX = useTransform(springX, [0, 1], [-14, 14]);
  const layerBackY = useTransform(springY, [0, 1], [-10, 10]);
  const layerMidX = useTransform(springX, [0, 1], [-26, 26]);
  const layerMidY = useTransform(springY, [0, 1], [-18, 18]);
  const glowX = useTransform(springX, [0, 1], [-40, 40]);
  const glowY = useTransform(springY, [0, 1], [-30, 30]);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const exploreLineHeight = useTransform(scrollYProgress, [0, 1], ["100%", "20%"]);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setSlideIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  const handleMouseMove = (e) => {
    const rect = heroRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={!reduceMotion ? handleMouseMove : undefined}
      className="relative min-h-[92vh] overflow-hidden bg-deep px-6 pb-16 pt-16 lg:px-10 lg:pt-24"
    >
      {/* Parallax photography background — cycles through the slideshow */}
      <motion.div style={{ x: layerBackX, y: layerBackY }} className="pointer-events-none absolute inset-0 scale-110 overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.img
            key={HERO_SLIDES[slideIndex].image}
            src={HERO_SLIDES[slideIndex].image}
            alt=""
            initial={{ opacity: 0, scale: 1.15, x: slideIndex % 2 === 0 ? -24 : 24 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.06, x: slideIndex % 2 === 0 ? 24 : -24 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/75 to-deep/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep/50 via-transparent to-deep/20" />
      </motion.div>
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none absolute -top-32 right-[-10%] h-[520px] w-[520px] rounded-full bg-brass/15 blur-[120px]"
      />
      <motion.div
        style={{ x: layerMidX, y: layerMidY }}
        className="pointer-events-none absolute bottom-[-15%] left-[-8%] h-[420px] w-[420px] rounded-full bg-sage/10 blur-[110px]"
      />

      {/* Vertical EXPLORE scroll indicator, right edge */}
      <div className="pointer-events-none absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 lg:right-10 lg:flex">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brass/70" style={{ writingMode: "vertical-rl" }}>
          Explore
        </span>
        <div className="relative h-24 w-px overflow-hidden bg-white/10">
          <motion.div style={{ height: exploreLineHeight }} className="absolute top-0 w-px bg-brass" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-start justify-center pt-16 lg:pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-5xl font-medium leading-[1.05] text-linen sm:text-6xl lg:text-7xl light:text-deep">
              <CurtainLine delay={0.05}>{HERO_SLIDES[slideIndex].line1}</CurtainLine>
              <CurtainLine delay={0.2} className="italic text-brass">
                {HERO_SLIDES[slideIndex].line2}
              </CurtainLine>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-muted light:text-muted-light"
            >
              {HERO_SLIDES[slideIndex].paragraph}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Room-type thumbnail rail */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="relative z-10 mx-auto mt-16 flex max-w-4xl gap-4 overflow-x-auto pb-2 lg:mt-24"
      >
        {[
          { room: "Bedroom", photo: IMAGES.bedroomCozy },
          { room: "Living room", photo: IMAGES.livingRoomFireplace },
          { room: "Kitchen", photo: IMAGES.kitchenWood },
          { room: "Home office", photo: IMAGES.officeDesk },
        ].map(({ room, photo }) => (
          <a
            key={room}
            href="#features"
            className="group/thumb relative flex h-24 w-40 shrink-0 items-end overflow-hidden rounded-xl border border-white/10 p-3 transition-colors hover:border-brass/50"
          >
            <img
              src={photo}
              alt={room}
              className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover/thumb:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <span className="relative font-display text-sm text-linen">{room}</span>
          </a>
        ))}
      </motion.div>
    </section>
  );
}

/** One line of the headline, masked and revealed like a curtain lifting. */
function CurtainLine({ children, delay = 0, className = "" }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        className={`block ${className}`}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Cinematic room-category panels — rounded full-bleed sections with   */
/* eyebrow label, italic title, and a corner badge.                    */
/* ------------------------------------------------------------------ */
function RoomCategories() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const panels = sectionRef.current.querySelectorAll("[data-parallax-img]");
      panels.forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: img.closest("[data-panel]"),
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl space-y-6 px-6 py-24 lg:px-10">
      {ROOM_CATEGORIES.map((cat) => (
        <motion.div
          key={cat.title}
          data-panel
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="group relative h-[420px] overflow-hidden rounded-[2rem] border border-white/10"
        >
          <img
            data-parallax-img
            src={cat.photo}
            alt={cat.title}
            className="absolute inset-0 h-[130%] w-full scale-105 object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-115"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

          <div className="relative flex h-full flex-col justify-end p-8 lg:p-12">
            <DimLabel className="!justify-start">{cat.eyebrow}</DimLabel>
            <h3 className="mt-3 max-w-md font-display text-4xl italic text-linen lg:text-5xl">{cat.title}</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-linen/80">{cat.body}</p>
          </div>

          <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 backdrop-blur">
            <FontAwesomeIcon icon={faStar} className="text-[10px] text-brass" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-linen/80">InDwell · Live scene</span>
          </div>
        </motion.div>
      ))}
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <DimLabel>What makes it different</DimLabel>
      <h2 className="mt-4 max-w-xl font-display text-4xl font-medium text-linen light:text-deep">
        Not another moodboard generator.
      </h2>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            className="glass-card feature-card p-6"
          >
            <FeatureIcon icon={f.icon} />
            <h3 className="feature-title mt-5 font-display text-lg text-linen light:text-deep">{f.title}</h3>
            <p className="feature-body mt-2 text-sm leading-relaxed text-muted light:text-muted-light">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/** Icon bubble with an Anime.js hover micro-interaction (a quick, playful pop + spin). */
function FeatureIcon({ icon }) {
  const ref = useRef(null);

  const handleEnter = () => {
    if (prefersReducedMotion() || !ref.current) return;
    anime({
      targets: ref.current,
      scale: [1, 1.15, 1],
      rotate: [0, -8, 0],
      duration: 480,
      easing: "easeOutElastic(1, 0.6)",
    });
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleEnter}
      className="feature-icon flex h-11 w-11 items-center justify-center rounded-xl bg-brass/10 text-brass"
    >
      <FontAwesomeIcon icon={icon} />
    </div>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 text-center lg:px-10">
      <h2 className="font-display text-4xl font-medium text-linen sm:text-5xl light:text-deep">
        Your next room is one prompt away.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-muted light:text-muted-light">
        No credit card. Ten free generations a day to start.
      </p>
      <Link to="/signup" className="btn-primary mt-8 inline-flex text-base">
        Sign up free
      </Link>
    </section>
  );
}
