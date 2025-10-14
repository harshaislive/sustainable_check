'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, ArrowRight } from 'lucide-react'

interface UserInfoFormProps {
  onSubmit: (userInfo: { name: string; email: string; phone: string }) => void
  onBack: () => void
}

export default function UserInfoForm({ onSubmit, onBack }: UserInfoFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+91'
  })
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: ''
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return !newErrors.name && !newErrors.email && !newErrors.phone
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting form:', error)
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dawn relative overflow-hidden flex items-center justify-center px-6">
      {/* Ambient background elements */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-forest-700/5 rounded-full blur-3xl left-1/4 top-1/4" />
        <div className="absolute right-0 top-0 w-72 h-72 bg-accent-gold/10 rounded-full blur-3xl" />
        <div className="absolute left-1/4 bottom-0 w-96 h-96 bg-earth-clay/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-forest-700/10"
        >
          <div className="text-center mb-8">
            <h2 className="font-arizona text-3xl text-forest-900 mb-2">
              Let's Get Started
            </h2>
            <p className="font-arizona-light text-earth-stone text-sm">
              We'll save your results and send you personalized recommendations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-arizona text-forest-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-stone" />
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all font-arizona-light ${
                    errors.name
                      ? 'border-red-400 focus:ring-red-400/50'
                      : 'border-forest-700/20 focus:ring-forest-700/50'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-arizona text-forest-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-stone" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all font-arizona-light ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-400/50'
                      : 'border-forest-700/20 focus:ring-forest-700/50'
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-arizona text-forest-900 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-stone" />
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all font-arizona-light ${
                    errors.phone
                      ? 'border-red-400 focus:ring-red-400/50'
                      : 'border-forest-700/20 focus:ring-forest-700/50'
                  }`}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="space-y-4">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={`w-full py-4 rounded-xl font-arizona text-white transition-all ${
                  isSubmitting
                    ? 'bg-forest-700/60 cursor-not-allowed'
                    : 'bg-forest-900 hover:bg-forest-800 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Continue to Assessment
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </motion.button>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-3 text-earth-stone hover:text-forest-900 transition-colors text-sm font-arizona-light"
              >
                Back to Home
              </button>
            </div>
          </form>

          <p className="mt-6 text-xs text-center text-earth-stone/60 font-arizona-light">
            Your information is stored securely and will only be used to provide your assessment results.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
