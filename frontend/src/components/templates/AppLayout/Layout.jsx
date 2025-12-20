import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  AlertCircle,
  MapPin,
  Users,
  Shield,
  Clock,
  CheckCircle,
  Smartphone,
  Upload,
  Eye,
  BarChart3,
  Award,
  MessageSquare,
  UserPlus,
  LogIn,
  ArrowRight,
  ChevronRight,
  Mail,
  Phone,
  Map,
  Globe,
  Heart,
  Sparkles,
  Download,
  Building,
  TrendingUp,
  Star,
  ThumbsUp,
  Award as AwardIcon
} from 'lucide-react'
import Button from '../../atoms/Button/Button'
import { getRoleDashboard, ROUTES } from '../../../utils/constants/routes'
import { useSelector } from 'react-redux'
import { selectUserRole } from '../../../store/slices/authSlice'

const Layout = () => {
  const navigate =useNavigate();
  
  const [stats, setStats] = useState({
    reports: 0,
    resolved: 0,
    users: 0,
    wards: 0,
    cities: 0
  })

  // Enhanced stats animation
  useEffect(() => {
    const targets = {
      reports: 12500,
      resolved: 8900,
      users: 4500,
      wards: 35,
      cities: 12
    }

    const duration = 2000
    const interval = 16
    const steps = duration / interval

    const timers = []

    Object.keys(targets).forEach(key => {
      let current = 0
      const targetValue = targets[key]
      const increment = targetValue / steps
      const timer = setInterval(() => {
        current += increment
        if (current >= targetValue) {
          current = targetValue
          clearInterval(timer)
        }
        setStats(prev => ({ ...prev, [key]: Math.floor(current) }))
      }, interval)
      timers.push(timer)
    })

    // Cleanup function
    return () => {
      timers.forEach(timer => clearInterval(timer))
    }
  }, [])

  // Scroll animations
  const controls = useAnimation()
  const [heroRef, heroInView] = useInView({ threshold: 0.3, triggerOnce: true })
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [howItWorksRef, howItWorksInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [testimonialsRef, testimonialsInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [municipalitiesRef, municipalitiesInView] = useInView({ threshold: 0.1, triggerOnce: true })

  useEffect(() => {
    if (heroInView) {
      controls.start('visible')
    }
  }, [controls, heroInView])

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const features = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Real-time Reporting",
      description: "Report civic issues instantly with photos and location tagging. No more waiting in lines.",
      color: "from-blue-500 to-cyan-500",
      stats: "2-min average report time"
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Live Tracking",
      description: "Track your reported issues in real-time. Get status updates and estimated resolution time.",
      color: "from-purple-500 to-pink-500",
      stats: "95% resolution tracking accuracy"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Driven",
      description: "Join forces with neighbors to address common issues faster and more effectively.",
      color: "from-green-500 to-emerald-500",
      stats: "40% faster community resolutions"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Smart Analytics",
      description: "View issue trends, resolution rates, and municipal performance with detailed insights.",
      color: "from-orange-500 to-red-500",
      stats: "Real-time municipality ratings"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Reward System",
      description: "Earn points for active participation. Redeem rewards for your civic contributions.",
      color: "from-yellow-500 to-amber-500",
      stats: "500+ monthly rewards distributed"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Verified Authority",
      description: "Direct connection to municipal authorities. Get official responses and action plans.",
      color: "from-indigo-500 to-blue-500",
      stats: "24-hour official response guarantee"
    }
  ]

  const steps = [
    {
      number: "01",
      title: "Register & Verify",
      description: "Create your citizen account with simple email verification in under 2 minutes",
      icon: <UserPlus className="w-6 h-6" />
    },
    {
      number: "02",
      title: "Report Issue",
      description: "Take photo, add details, and pinpoint location on our interactive map",
      icon: <AlertCircle className="w-6 h-6" />
    },
    {
      number: "03",
      title: "Track Progress",
      description: "Monitor status updates and authority responses in real-time dashboard",
      icon: <Clock className="w-6 h-6" />
    },
    {
      number: "04",
      title: "Get Rewarded",
      description: "Earn points for resolved issues and redeem for exclusive rewards",
      icon: <Award className="w-6 h-6" />
    }
  ]

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Active Citizen, Dhangadhi",
      content: "NagarAlert transformed how we address civic issues in our locality. 15+ issues resolved in just 2 months!",
      rating: 5,
      avatarColor: "bg-blue-100"
    },
    {
      name: "Priya Sharma",
      role: "Community Leader, Godawari",
      content: "The transparency and tracking features are amazing. Finally, we can hold authorities accountable!",
      rating: 5,
      avatarColor: "bg-pink-100"
    },
    {
      name: "Municipal Commissioner",
      role: "Bhimdatta City Corporation",
      content: "This platform has improved our response time by 60%. A game-changer for urban governance.",
      rating: 4,
      avatarColor: "bg-green-100"
    }
  ]

  const municipalities = [
    "Dhangadhi Municipal Corporation",
    "Godawari Municipal Council",
    "Bhimdatta City Corporation",
    "Bhajani Urban Authority",
    "Krishnapur Service",
    "Lamki Chuha Civic Body",
    "Ghodaghodi Council",
    "Gauriganga Municipality"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  NagarAlert
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Citizen Empowerment Platform</p>
              </div>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">How It Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">Testimonials</a>
              <a href="#municipalities" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">Partners</a>
            </div>

            <div className="flex items-center space-x-3">
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="primary" size="sm" className="shadow-md">
                  Register
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden pt-16 pb-24 md:pt-20 md:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-cyan-50/50" />
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-primary-500/10 to-cyan-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-500/10 to-cyan-500/10 border border-primary-500/20 mb-6 md:mb-8">
              <Sparkles className="w-4 h-4 text-primary-600 mr-2" />
              <span className="text-sm font-medium text-primary-700">Join 4,500+ Active Citizens</span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-cyan-500 bg-clip-text text-transparent">
                Your City,
              </span>
              <br />
              <span className="text-gray-900">Your Voice Matters</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 md:mb-10 px-4"
            >
              NagarAlert empowers citizens to report civic issues, track resolutions in real-time, 
              and build cleaner, safer communities together with municipal authorities.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12 md:mb-16 px-4"
            >
              <Link to={ROUTES.LOGIN} className="inline-flex w-full sm:w-auto">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="group shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/35 w-full sm:w-auto justify-center"
                >
                  Start Reporting Issues
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto justify-center"
                onClick={() => {
                  const featuresElement = document.getElementById('features')
                  if (featuresElement) {
                    featuresElement.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              >
                <Eye className="w-5 h-5 mr-2" />
                Explore Features
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto px-4"
            >
              {[
                { label: "Issues Reported", value: stats.reports.toLocaleString(), icon: <AlertCircle className="w-5 h-5" />, suffix: "+" },
                { label: "Issues Resolved", value: stats.resolved.toLocaleString(), icon: <CheckCircle className="w-5 h-5" />, suffix: "+" },
                { label: "Active Citizens", value: stats.users.toLocaleString(), icon: <Users className="w-5 h-5" />, suffix: "+" },
                { label: "Wards Covered", value: stats.wards, icon: <MapPin className="w-5 h-5" />, suffix: "+" },
                { label: "Partner Cities", value: stats.cities, icon: <Building className="w-5 h-5" />, suffix: "+" }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary-100 to-cyan-100 mb-3 mx-auto">
                    <div className="text-primary-600">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}{stat.suffix}</div>
                  <div className="text-xs md:text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to{" "}
                <span className="bg-gradient-to-r from-primary-600 to-cyan-500 bg-clip-text text-transparent">
                  Transform Your City
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Powerful features designed to make civic engagement simple, effective, and rewarding
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden hover:border-primary-200 transition-all shadow-sm hover:shadow-lg"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color}`} />
                  <div className="p-6 md:p-8">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 md:mb-6`}>
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-primary-600">
                        {feature.stats}
                      </div>
                      <div className="flex items-center text-primary-600 font-medium">
                        <span className="hidden sm:inline">Learn more</span>
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" ref={howItWorksRef} className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={howItWorksInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                How NagarAlert{" "}
                <span className="bg-gradient-to-r from-primary-600 to-cyan-500 bg-clip-text text-transparent">
                  Works in 4 Simple Steps
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                From reporting to resolution - a seamless civic engagement experience
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  className="relative bg-white rounded-xl md:rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white text-xl md:text-2xl font-bold mb-4 md:mb-6">
                      {step.number}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-cyan-100 flex items-center justify-center mb-4 mx-auto">
                      <div className="text-primary-600">{step.icon}</div>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-sm md:text-base text-gray-600">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 right-0 w-full h-0.5 bg-gradient-to-r from-primary-500/20 to-transparent translate-x-1/2 -translate-y-1/2" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" ref={testimonialsRef} className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Trusted by{" "}
                <span className="bg-gradient-to-r from-primary-600 to-cyan-500 bg-clip-text text-transparent">
                  Citizens & Authorities
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                See what our community has to say about transforming civic engagement
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 rounded-full ${testimonial.avatarColor} flex items-center justify-center mr-4`}>
                      <span className="text-lg font-semibold text-primary-700">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 italic">&quot;{testimonial.content}&quot;</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{testimonial.rating}.0</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Municipalities Section */}
      <section id="municipalities" ref={municipalitiesRef} className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={municipalitiesInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Partnered with{" "}
                <span className="bg-gradient-to-r from-primary-600 to-cyan-500 bg-clip-text text-transparent">
                  Leading Municipalities
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Working together with city authorities for better urban governance
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {municipalities.map((municipality, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg md:rounded-xl border border-gray-200 p-4 md:p-6 flex items-center justify-center hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Building className="w-5 h-5 md:w-6 md:h-6 text-primary-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm md:text-base font-medium text-gray-800 text-center">
                      {municipality.split(' ')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-12 text-center">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-primary-500/10 to-green-500/10 border border-primary-500/20">
                <TrendingUp className="w-5 h-5 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-primary-700">
                  68% faster resolution rate with NagarAlert
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary-600 via-primary-500 to-cyan-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AwardIcon className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Make a Difference in Your Community?
            </h2>
            <p className="text-lg sm:text-xl text-primary-100 mb-8 md:mb-10 max-w-2xl mx-auto">
              Join thousands of proactive citizens who are already transforming their neighborhoods
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={ROUTES.REGISTER}>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-primary-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto justify-center"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            
            </div>
            <p className="mt-6 text-sm text-primary-200">
              No credit card required • Free forever for citizens • 100% secure
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">NagarAlert</h3>
                  <p className="text-sm">Citizen Empowerment Platform</p>
                </div>
              </div>
              <p className="mb-6 max-w-md text-sm md:text-base">
                Empowering citizens to build better communities through technology and collaboration.
              </p>
              <div className="flex space-x-3">
                {[Globe, Map, Phone, Mail].map((Icon, index) => (
                  <button
                    key={index}
                    className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                    aria-label={`Contact option ${index + 1}`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm md:text-base">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#municipalities" className="hover:text-white transition-colors">For Municipalities</a></li>
                <li><a href="#mobile" className="hover:text-white transition-colors">Mobile App</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm md:text-base">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm md:text-base">
                <li><a href="#help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#community" className="hover:text-white transition-colors">Community Guidelines</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm">© {new Date().getFullYear()} NagarAlert. All rights reserved.</p>
              <div className="flex items-center space-x-2">
                <ThumbsUp className="w-4 h-4 text-green-500" />
                <p className="text-sm">Built with <Heart className="inline w-4 h-4 text-red-500 mx-1" /> for better communities</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


export default Layout;