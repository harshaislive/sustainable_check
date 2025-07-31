'use client'

import { motion } from 'framer-motion'
import { Download, RefreshCw, Crown, Target, Users, Zap } from 'lucide-react'
import { ReportCard as ReportCardType } from '@/types'
import { CommitmentScore } from '@/lib/commitment/scoring-engine'

interface PremiumReportCardProps {
  report: ReportCardType
  commitmentScore: CommitmentScore
  onRestart: () => void
}

export default function PremiumReportCard({ 
  report, 
  commitmentScore, 
  onRestart 
}: PremiumReportCardProps) {
  
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Visionary': return Crown
      case 'Catalyst': return Zap
      case 'Advocate': return Target
      case 'Explorer': return Users
      default: return Target
    }
  }
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Visionary': return 'from-accent-gold to-earth-clay'
      case 'Catalyst': return 'from-forest-700 to-forest-600'
      case 'Advocate': return 'from-earth-clay to-earth-terracotta'
      case 'Explorer': return 'from-forest-600 to-forest-500'
      default: return 'from-forest-700 to-forest-600'
    }
  }
  
  const getLevelDescription = (level: string) => {
    switch (level) {
      case 'Visionary': return 'Systemic change maker ready to transform industries'
      case 'Catalyst': return 'Natural leader prepared to influence meaningful change'
      case 'Advocate': return 'Personally committed to sustainable transformation'
      case 'Explorer': return 'Curious mind beginning the sustainability journey'
      default: return 'Sustainability-conscious individual'
    }
  }

  const LevelIcon = getLevelIcon(commitmentScore.level)

  return (
    <div className="fixed inset-0 bg-gradient-dawn overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center px-3 py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl premium-shadow border border-white/20 overflow-hidden">
            
            {/* Header Section */}
            <div className={`bg-gradient-to-r ${getLevelColor(commitmentScore.level)} p-8 text-accent-pearl relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <LevelIcon className="w-8 h-8" />
                    <span className="font-mono text-sm uppercase tracking-widest opacity-90">
                      Commitment Level
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-serif font-bold">
                      {commitmentScore.finalScore}
                    </div>
                    <div className="text-sm opacity-90">Overall Score</div>
                  </div>
                </div>
                
                <h1 className="font-serif text-4xl font-bold mb-2">
                  {commitmentScore.level}
                </h1>
                <p className="text-xl opacity-90 leading-relaxed">
                  {getLevelDescription(commitmentScore.level)}
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-8 space-y-8">
              
              {/* Commitment Dimensions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Action Velocity', value: commitmentScore.actionVelocity, icon: Zap },
                  { label: 'Resource Allocation', value: commitmentScore.resourceAllocation, icon: Target },
                  { label: 'Influence Radius', value: commitmentScore.influenceRadius, icon: Users },
                  { label: 'Commitment Intensity', value: commitmentScore.commitmentIntensity, icon: Crown }
                ].map((dimension, index) => (
                  <motion.div
                    key={dimension.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="bg-accent-mist rounded-2xl p-4 text-center"
                  >
                    <dimension.icon className="w-6 h-6 text-forest-700 mx-auto mb-2" />
                    <div className="text-2xl font-serif font-bold text-forest-900 mb-1">
                      {Math.round(dimension.value * 100)}
                    </div>
                    <div className="text-xs text-earth-stone font-medium">
                      {dimension.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl text-forest-900 mb-4">Sustainability Profile</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {report.categories.map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="bg-accent-mist rounded-xl p-5"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-forest-900">{category.name}</h4>
                        <span className="font-bold text-forest-700 text-lg">
                          {category.score}%
                        </span>
                      </div>
                      <div className="h-2 bg-earth-sand/50 rounded-full overflow-hidden mb-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${category.score}%` }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-forest-700 to-earth-clay"
                        />
                      </div>
                      <p className="text-xs text-earth-stone leading-relaxed">
                        {category.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Personality Profile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-forest-50 rounded-2xl p-6"
              >
                <h3 className="font-serif text-xl text-forest-900 mb-4">Your Sustainability Personality</h3>
                <p className="text-earth-ash leading-relaxed">{report.personalityProfile}</p>
              </motion.div>

              {/* Insights & Recommendations */}
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <h3 className="font-serif text-lg text-forest-900 mb-4">Key Insights</h3>
                  <ul className="space-y-3">
                    {report.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-forest-700 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-earth-ash leading-relaxed">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <h3 className="font-serif text-lg text-forest-900 mb-4">Next Actions</h3>
                  <ul className="space-y-3">
                    {report.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-forest-700 text-accent-pearl rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-sm text-earth-ash leading-relaxed">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Level-Specific Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className={`bg-gradient-to-r ${getLevelColor(commitmentScore.level)} rounded-2xl p-6 text-accent-pearl relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <h3 className="font-serif text-xl mb-2">Your Next Chapter</h3>
                  <p className="mb-4 opacity-90">
                    {commitmentScore.level === 'Visionary' && 
                      "You're ready for transformational partnerships. Let's discuss exclusive opportunities for systemic change."}
                    {commitmentScore.level === 'Catalyst' && 
                      "Your leadership potential is clear. Explore programs designed for change-makers like you."}
                    {commitmentScore.level === 'Advocate' && 
                      "Your personal commitment shines through. Join a community of like-minded advocates."}
                    {commitmentScore.level === 'Explorer' && 
                      "Your curiosity is the first step. Continue your journey with curated learning experiences."}
                  </p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                      Learn More
                    </button>
                    <button className="px-4 py-2 bg-accent-pearl text-forest-900 rounded-lg text-sm font-medium hover:bg-accent-mist transition-colors">
                      Get Started
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <div className="flex gap-4 justify-center pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRestart}
                  className="flex items-center gap-2 px-6 py-3 bg-earth-sand text-earth-ash rounded-full font-medium text-sm hover:bg-earth-stone/20 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retake Assessment
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 bg-forest-900 text-accent-pearl rounded-full font-medium text-sm hover:bg-forest-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}