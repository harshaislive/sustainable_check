'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CommitmentScore, CommitmentLevel } from '@/lib/commitment/scoring-engine'

interface MomentOfTruthRevealProps {
  score: CommitmentScore
  onComplete: () => void
}

const levelMessages = {
  Explorer: {
    title: "The Explorer",
    subtitle: "Your sustainability journey is just beginning",
    description: "You're curious and open to change, with potential waiting to be unlocked.",
    color: "from-emerald-400 to-teal-500",
    glow: "shadow-emerald-500/25"
  },
  Advocate: {
    title: "The Advocate", 
    subtitle: "You're committed to making a difference",
    description: "Your actions speak louder than words. You're ready to lead by example.",
    color: "from-blue-400 to-indigo-500",
    glow: "shadow-blue-500/25"
  },
  Catalyst: {
    title: "The Catalyst",
    subtitle: "You have the power to transform systems",
    description: "You don't just adapt to change - you create it. Others follow your lead.",
    color: "from-purple-400 to-violet-500", 
    glow: "shadow-purple-500/25"
  },
  Visionary: {
    title: "The Visionary",
    subtitle: "You're destined to reshape the future",
    description: "Rare. Powerful. Transformational. You see possibilities others can't imagine.",
    color: "from-amber-400 to-orange-500",
    glow: "shadow-amber-500/25"
  }
}

export default function MomentOfTruthReveal({ score, onComplete }: MomentOfTruthRevealProps) {
  const [phase, setPhase] = useState<'calculating' | 'building' | 'reveal' | 'complete'>('calculating')
  const [displayScore, setDisplayScore] = useState(0)
  const [pulseCount, setPulseCount] = useState(0)

  const levelData = levelMessages[score.level]

  useEffect(() => {
    const timeline = async () => {
      // Phase 1: Calculating suspense (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000))
      setPhase('building')
      
      // Phase 2: Score building animation (2.5 seconds)
      const increment = score.finalScore / 50
      for (let i = 0; i <= 50; i++) {
        await new Promise(resolve => setTimeout(resolve, 50))
        setDisplayScore(Math.min(score.finalScore, Math.floor(i * increment)))
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      setPhase('reveal')
      
      // Phase 3: Level reveal (dramatic pause)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setPhase('complete')
      
      // Auto-complete after 5 seconds
      setTimeout(onComplete, 5000)
    }
    
    timeline()
  }, [score.finalScore, onComplete])

  useEffect(() => {
    if (phase === 'calculating') {
      const pulseInterval = setInterval(() => {
        setPulseCount(prev => prev + 1)
      }, 800)
      return () => clearInterval(pulseInterval)
    }
  }, [phase])

  const getScoreColor = (score: number) => {
    if (score >= 76) return 'text-amber-400'
    if (score >= 51) return 'text-purple-400'
    if (score >= 26) return 'text-blue-400'
    return 'text-emerald-400'
  }

  return (
    <div className="fixed inset-0 bg-gradient-dawn z-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-6 py-8">
        
        <AnimatePresence mode="wait">
          {phase === 'calculating' && (
            <motion.div
              key="calculating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-forest-900 text-3xl font-serif mb-8"
              >
                Analyzing your responses...
              </motion.div>
              
              <div className="flex justify-center space-x-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                    className="w-3 h-3 bg-forest-700/50 rounded-full"
                  />
                ))}
              </div>
              
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-earth-stone text-lg"
              >
                Processing behavioral patterns...
              </motion.div>
            </motion.div>
          )}

          {phase === 'building' && (
            <motion.div
              key="building"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              <motion.div
                initial={{ y: 30 }}
                animate={{ y: 0 }}
                className="text-forest-900 text-4xl font-serif"
              >
                Your Commitment Score
              </motion.div>
              
              <div className="relative">
                <motion.div
                  className={`text-8xl font-bold ${getScoreColor(displayScore)}`}
                  animate={{ 
                    textShadow: [
                      "0 0 20px rgba(212,175,55,0.3)",
                      "0 0 40px rgba(212,175,55,0.5)", 
                      "0 0 20px rgba(212,175,55,0.3)"
                    ]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {displayScore}
                </motion.div>
                
                <motion.div
                  className="absolute inset-0 -z-10"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className={`w-full h-full bg-gradient-to-r ${levelData.color} rounded-full blur-3xl`} />
                </motion.div>
              </div>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${displayScore}%` }}
                transition={{ duration: 2.5, ease: "easeOut" }}
                className={`h-2 bg-gradient-to-r ${levelData.color} rounded-full mx-auto max-w-md`}
              />
            </motion.div>
          )}

          {(phase === 'reveal' || phase === 'complete') && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="space-y-4"
              >
                <div className={`text-6xl font-bold bg-gradient-to-r ${levelData.color} bg-clip-text text-transparent`}>
                  {levelData.title}
                </div>
                <div className="text-forest-900 text-2xl font-serif">
                  {levelData.subtitle}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-r ${levelData.color} ${levelData.glow} shadow-2xl`}
              >
                <div className="text-3xl font-bold text-white">
                  {score.finalScore}
                </div>
                <div className="text-white/90 text-sm">
                  Commitment Score
                </div>
              </motion.div>
              
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="text-forest-900 text-xl max-w-lg mx-auto leading-relaxed font-serif"
              >
                {levelData.description}
              </motion.div>
              
              {phase === 'complete' && (
                <motion.button
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                  onClick={onComplete}
                  className={`px-8 py-3 rounded-xl bg-gradient-to-r ${levelData.color} text-white font-semibold hover:scale-105 transform transition-transform duration-200 ${levelData.glow} shadow-lg`}
                >
                  View Full Report
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Ambient particles for extra drama */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 3 === 0 ? 'w-2 h-2 bg-white/30' : 
                i % 3 === 1 ? 'w-1 h-1 bg-white/20' : 
                'w-0.5 h-0.5 bg-white/10'
              }`}
              animate={{
                x: [
                  Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200), 
                  Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200)
                ],
                y: [
                  Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800), 
                  Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
                ],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.5, 0.5]
              }}
              transition={{
                duration: Math.random() * 8 + 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%'
              }}
            />
          ))}
        </div>

        {/* Dramatic spotlight effect during reveal */}
        {(phase === 'reveal' || phase === 'complete') && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 3, opacity: 0.1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className={`absolute inset-0 bg-gradient-radial ${levelData.color} blur-3xl -z-10`}
          />
        )}
      </div>
    </div>
  )
}