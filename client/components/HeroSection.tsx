"use client"

import { motion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"
import Link from "next/link"

const Building1 = ({ delay = 0 }) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    className="relative h-32 w-12 md:h-48 md:w-16"
  >
    {/* Solid building */}
    <div className="absolute inset-0 border-l border-r border-t border-zinc-800 bg-zinc-950/80" />
    {/* Minimal window grid */}
    <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1.5">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0.15, 0] }}
          transition={{ duration: 8, delay: i * 0.4, repeat: Number.POSITIVE_INFINITY }}
          className="border border-cyan-500/20 bg-cyan-500/5"
        />
      ))}
    </div>
  </motion.div>
)

const Building2 = ({ delay = 0 }) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    className="relative h-40 w-14 md:h-64 md:w-20"
  >
    <div className="absolute inset-0 border-l border-r border-t border-zinc-800 bg-zinc-950/80" />
    <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1.5">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0.2, 0] }}
          transition={{ duration: 7, delay: i * 0.35, repeat: Number.POSITIVE_INFINITY }}
          className="border border-cyan-500/20 bg-cyan-500/5"
        />
      ))}
    </div>
    {/* Antenna */}
    <div className="absolute -top-4 left-1/2 h-4 w-px -translate-x-1/2 bg-cyan-500/40 md:-top-6 md:h-6" />
  </motion.div>
)

const Building3 = ({ delay = 0 }) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    className="relative h-28 w-10 md:h-40 md:w-14"
  >
    <div className="absolute inset-0 border-l border-r border-t border-zinc-800 bg-zinc-950/80" />
    <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1.5">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0.15, 0] }}
          transition={{ duration: 9, delay: i * 0.5, repeat: Number.POSITIVE_INFINITY }}
          className="border border-cyan-500/20 bg-cyan-500/5"
        />
      ))}
    </div>
  </motion.div>
)

const Building4 = ({ delay = 0 }) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    className="relative h-36 w-12 md:h-56 md:w-18"
  >
    <div className="absolute inset-0 border-l border-r border-t border-zinc-800 bg-zinc-950/80" />
    <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1.5">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0.2, 0] }}
          transition={{ duration: 6.5, delay: i * 0.3, repeat: Number.POSITIVE_INFINITY }}
          className="border border-cyan-500/20 bg-cyan-500/5"
        />
      ))}
    </div>
  </motion.div>
)

const Building5 = ({ delay = 0 }) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    className="relative h-32 w-11 md:h-48 md:w-16"
  >
    <div className="absolute inset-0 border-l border-r border-t border-zinc-800 bg-zinc-950/80" />
    <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1.5">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0.15, 0] }}
          transition={{ duration: 8.5, delay: i * 0.45, repeat: Number.POSITIVE_INFINITY }}
          className="border border-cyan-500/20 bg-cyan-500/5"
        />
      ))}
    </div>
  </motion.div>
)

export default function CustomHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const gridY = useTransform(scrollYProgress, [0, 1], [0, 100])

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-black">
      <motion.div style={{ y: gridY }} className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-size-[64px_64px] opacity-20" />
      </motion.div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[20%] top-40 size-96 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute right-[20%] top-60 size-80 rounded-full bg-cyan-500/3 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <Navbar />

        <div className="relative px-6 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 flex justify-center"
          >
            <div className="inline-flex items-center gap-2 border-l border-cyan-500/30 pl-4">
              <span className="text-sm font-medium uppercase tracking-widest text-zinc-400">Real-time City Editor</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative z-10 mx-auto mb-6 max-w-4xl text-center font-sans text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            Build Cities.
            <br />
            <span className="text-zinc-400">Replace Buildings.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative z-10 mx-auto max-w-2xl text-balance text-center text-lg leading-relaxed text-zinc-400 md:text-xl"
          >
            A professional urban planning platform for engineers and architects. Edit layouts, swap structures, and
            visualize changes in real-time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative z-10 mt-10 flex items-center justify-center"
          >
            <Link href="/map">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-cyan-500 px-8 py-4 text-base font-semibold text-black transition-colors hover:bg-cyan-400"
              >
                Start Building
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="relative z-10 mt-20 md:mt-32"
          >
            <div className="relative flex items-end justify-center gap-1 md:gap-2">
              <Building3 delay={1.2} />
              <Building1 delay={1.3} />
              <Building5 delay={1.4} />
              <Building2 delay={1.5} />
              <Building4 delay={1.6} />
              <Building1 delay={1.7} />
              <Building3 delay={1.8} />
              <Building5 delay={1.9} />
              <Building2 delay={2.0} />
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  )
}

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex w-full items-center justify-between border-b border-zinc-900 px-6 py-5"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center border border-cyan-500/30 bg-cyan-500/10">
          <div className="h-4 w-px bg-cyan-500" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">URBANKIT</h1>
      </div>

      <div className="hidden items-center gap-8 md:flex">
        <a href="#" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
          Features
        </a>
        <a href="#" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
          Documentation
        </a>
        <a href="#" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
          Pricing
        </a>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-cyan-500 px-6 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
      >
        Get Started
      </motion.button>
    </motion.nav>
  )
}
