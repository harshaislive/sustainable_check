'use client'

import { motion } from 'framer-motion'
import { Download, RefreshCw, TrendingUp } from 'lucide-react'
import { ReportCard as ReportCardType } from '@/types'

interface ReportCardProps {
  report: ReportCardType
  onRestart: () => void
}

export default function ReportCard({ report, onRestart }: ReportCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Your Sustainability Report Card</h1>
            <p className="text-green-100">Your personalized sustainability profile and recommendations</p>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className={`w-32 h-32 ${getScoreBg(report.overallScore)} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <span className={`text-4xl font-bold ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore}
                </span>
              </motion.div>
              <h2 className="text-2xl font-semibold text-gray-900">Overall Sustainability Score</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {report.categories?.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <span className={`font-bold ${getScoreColor(category.score)}`}>
                      {category.score}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.score}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-green-500 to-green-600"
                    />
                  </div>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Your Sustainability Personality</h3>
              <p className="text-gray-700 leading-relaxed">{report.personalityProfile}</p>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Key Insights
              </h3>
              <ul className="space-y-3">
                {report.insights.map((insight, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-gray-700">{insight}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Recommended Actions</h3>
              <ul className="space-y-3">
                {report.recommendations.map((recommendation, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-green-600 font-bold">{index + 1}.</span>
                    <span className="text-gray-700">{recommendation}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={onRestart}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Take Again
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}