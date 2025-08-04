'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface LandingPageProps {
  onStart: () => void
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-dawn relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-96 h-96 bg-forest-700/5 rounded-full blur-3xl"
          style={{
            left: `${mousePosition.x * 0.05}px`,
            top: `${mousePosition.y * 0.05}px`,
          }}
        />
        <div className="absolute right-0 top-0 w-72 h-72 bg-accent-gold/10 rounded-full blur-3xl" />
        <div className="absolute left-1/4 bottom-0 w-96 h-96 bg-earth-clay/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="max-w-4xl w-full"
        >
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-6"
            >
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-forest-900 leading-tight">
                <span className="block">Discover Your</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-forest-700 to-earth-clay">
                  Sustainability DNA
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-earth-stone max-w-2xl mx-auto leading-relaxed px-4">
                An intelligent assessment that reveals your unique environmental impact profile 
                and guides you toward meaningful, personalized sustainable choices.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                className="relative z-20 px-6 sm:px-8 py-3 sm:py-4 bg-forest-900 text-accent-pearl rounded-full text-base sm:text-lg font-medium 
                         hover:bg-forest-800 transition-all duration-300 shadow-2xl 
                         border border-forest-700 hover:border-forest-600 cursor-pointer min-h-[48px] min-w-[48px]"
              >
                <span className="flex items-center gap-2">
                  Begin Your Assessment
                  <Sparkles className="w-4 h-4" />
                </span>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="pt-12"
            >
              <p className="text-xs sm:text-sm text-earth-stone/60 tracking-wider uppercase px-4 text-center">
                10-minute assessment • Science-backed insights • Actionable recommendations
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}