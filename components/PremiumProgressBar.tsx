'use client'

import { motion } from 'framer-motion'

interface PremiumProgressBarProps {
  current: number
  total: number
  liveScore?: number
}

export default function PremiumProgressBar({ current, total, liveScore }: PremiumProgressBarProps) {
  const percentage = (current / total) * 100

  const getScoreLevel = (score: number) => {
    if (score >= 76) return { level: 'Visionary', color: 'text-accent-gold' }
    if (score >= 51) return { level: 'Catalyst', color: 'text-forest-700' }
    if (score >= 26) return { level: 'Advocate', color: 'text-earth-clay' }
    return { level: 'Explorer', color: 'text-forest-500' }
  }

  const scoreInfo = liveScore ? getScoreLevel(liveScore) : null

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-serif text-base text-forest-900">Your Journey</h3>
          <p className="text-earth-stone font-mono text-xs">
            Question {current} of {total}
          </p>
        </div>
        <div className="text-right">
          {liveScore && current > 2 ? (
            <div>
              <div className={`text-lg font-serif font-bold ${scoreInfo?.color}`}>
                {scoreInfo?.level}
              </div>
              <p className="text-earth-stone text-xs">Emerging Profile</p>
            </div>
          ) : (
            <div>
              <div className="text-lg font-serif text-forest-900">
                {Math.round(percentage)}%
              </div>
              <p className="text-earth-stone text-xs">Complete</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative">
        {/* Background track */}
        <div className="h-2 bg-earth-sand/50 rounded-full overflow-hidden">
          {/* Progress fill */}
          <motion.div
            className="h-full bg-gradient-to-r from-forest-700 to-earth-clay rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent 
                          translate-x-[-100%] animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
        
        {/* Milestone markers */}
        <div className="absolute -top-1 w-full h-4 flex justify-between">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                i < current
                  ? 'bg-forest-700 border-forest-700'
                  : i === current - 1
                  ? 'bg-accent-gold border-accent-gold animate-pulse'
                  : 'bg-earth-sand border-earth-stone/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

