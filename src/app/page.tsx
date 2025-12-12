'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Star, BookOpen, Users, MessageCircle, Calendar, Award, TrendingUp, ChevronRight, Orbit, Zap, Shield, Clock, Heart, Globe, Eye, Target } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Hero animations
    if (heroRef.current) {
      const tl = gsap.timeline();

      // Animated zodiac signs
      gsap.fromTo('.zodiac-sign',
        { scale: 0, rotation: -180, opacity: 0 },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 1.5,
          stagger: 0.1,
          ease: 'elastic.out(1, 0.8)',
          delay: 0.5
        }
      );

      // Floating planets
      gsap.to('.floating-planet', {
        y: 20,
        rotation: 360,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 2
      });

      tl.fromTo(
        heroRef.current.querySelector('.hero-title'),
        { opacity: 0, y: 80, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'power4.out' }
      )
        .fromTo(
          heroRef.current.querySelector('.hero-subtitle'),
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' },
          '-=0.8'
        )
        .fromTo(
          heroRef.current.querySelectorAll('.hero-button'),
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            stagger: 0.3,
            ease: 'back.out(2)',
            onComplete: () => {
              // Button pulse animation
              gsap.to('.cta-button', {
                scale: 1.02,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
              });
            }
          },
          '-=0.5'
        )
        .fromTo(
          heroRef.current.querySelectorAll('.hero-stats'),
          { opacity: 0, scale: 0.8, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'elastic.out(1, 0.5)'
          },
          '-=0.3'
        );
    }

    // Features animations
    if (featuresRef.current) {
      gsap.fromTo(
        featuresRef.current.querySelectorAll('.feature-card'),
        { opacity: 0, y: 60, scale: 0.9, rotationY: 10 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationY: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 75%',
            end: 'bottom 25%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }

    // Stats animations
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.querySelectorAll('.stat-item'),
        { opacity: 0, scale: 0.5, rotationY: 90 },
        {
          opacity: 1,
          scale: 1,
          rotationY: 0,
          duration: 1.2,
          stagger: 0.3,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 70%',
            end: 'bottom 30%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      // Count up animation for stats
      gsap.to('.count-up', {
        innerText: function (_index: any, target: { getAttribute: (arg0: string) => any; }) {
          const value = target.getAttribute('data-value');
          return value.includes('+') || value.includes('%') ? value : value + '+';
        },
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 60%',
          end: 'bottom 40%',
          toggleActions: 'play none none reverse',
        },
        onUpdate: function () {
          this.targets().forEach((target: { getAttribute: (arg0: string) => any; innerText: string; }) => {
            const value = target.getAttribute('data-value');
            if (!value.includes('%')) {
              target.innerText = Math.floor(this.progress() * parseInt(value)) + '+';
            }
          });
        }
      });
    }

    // CTA section animations
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current.querySelector('.cta-card'),
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }

    // Continuous floating animation
    gsap.to('.floating-element', {
      y: 25,
      rotation: 5,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 1
    });

  }, []);

  const features = [
    {
      icon: Star,
      title: 'Kundali Generator',
      description: 'Get your personalized birth chart with detailed planetary positions and accurate predictions based on Vedic astrology principles',
      href: '/kundali',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
      image: '/image.png',
      popular: true
    },
    {
      icon: BookOpen,
      title: 'Numerology',
      description: 'Discover your life path, destiny, and soul urge numbers with comprehensive insights into your personality and future',
      href: '/numerology',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
      image: '/second.png'
    },
    {
      icon: Globe,
      title: 'Palmistry Analysis',
      description: 'Upload your palm image for detailed analysis and accurate readings of your life lines and future predictions',
      href: '/palmistry',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      image: '/third.png'
    },
    {
      icon: MessageCircle,
      title: 'AI Astro Chat',
      description: 'Chat with our advanced AI astrologer anytime for instant cosmic guidance, daily horoscope, and personalized advice',
      href: '/chat',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      new: true
    },
    {
      icon: Users,
      title: 'Talk to Astrologer',
      description: 'Connect with certified expert astrologers for personalized consultations via call, video, or chat sessions',
      href: '/talk-to-astrologer',
      color: 'from-rose-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50',
      image: '/fourth.png'
    },
    {
      icon: Calendar,
      title: 'Book Pandit',
      description: 'Book experienced pandits for pujas, ceremonies, and rituals at your home with complete arrangements',
      href: '/pandit',
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-gradient-to-br from-violet-50 to-purple-50',
      image: '/fifth.png'
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      content: "The kundali analysis was incredibly accurate! It helped me understand my career path better.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    },
    {
      name: "Rajesh Kumar",
      role: "Business Owner",
      content: "The numerology reading transformed my business decisions. Highly recommended!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    },
    {
      name: "Anita Patel",
      role: "Teacher",
      content: "AI chat feature is amazing! Got instant answers to all my astrology questions.",
      rating: 4,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    }
  ];

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.08,
      y: -5,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const ZodiacWheel = () => {
    const [stars, setStars] = useState<Array<{ left: string; top: string; delay: string; duration: string }>>([]);

    useEffect(() => {
      // Generate stars only on client side to avoid hydration mismatch
      const generatedStars = Array.from({ length: 20 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${1 + Math.random() * 2}s`
      }));
      setStars(generatedStars);
    }, []);

    return (
      <div className="relative w-full h-96 md:h-[500px] lg:h-[600px]">
        {/* Central Sun */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-2xl shadow-amber-400/50 floating-planet">
            <div className="absolute inset-4 bg-gradient-to-r from-amber-300 to-amber-200 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Zodiac Signs in Circular Pattern */}
        {[
          { icon: '♈', name: 'Aries', color: 'text-red-500', angle: 0 },
          { icon: '♉', name: 'Taurus', color: 'text-green-500', angle: 30 },
          { icon: '♊', name: 'Gemini', color: 'text-yellow-500', angle: 60 },
          { icon: '♋', name: 'Cancer', color: 'text-blue-500', angle: 90 },
          { icon: '♌', name: 'Leo', color: 'text-orange-500', angle: 120 },
          { icon: '♍', name: 'Virgo', color: 'text-purple-500', angle: 150 },
          { icon: '♎', name: 'Libra', color: 'text-pink-500', angle: 180 },
          { icon: '♏', name: 'Scorpio', color: 'text-red-600', angle: 210 },
          { icon: '♐', name: 'Sagittarius', color: 'text-indigo-500', angle: 240 },
          { icon: '♑', name: 'Capricorn', color: 'text-gray-600', angle: 270 },
          { icon: '♒', name: 'Aquarius', color: 'text-cyan-500', angle: 300 },
          { icon: '♓', name: 'Pisces', color: 'text-teal-500', angle: 330 },
        ].map((sign, index) => (
          <div
            key={sign.name}
            className={`zodiac-sign absolute transform -translate-x-1/2 -translate-y-1/2 ${sign.color} font-bold text-2xl md:text-3xl bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shadow-lg border-2 border-current floating-element`}
            style={{
              left: `50%`,
              top: `50%`,
              transform: `rotate(${sign.angle}deg) translate(180px) rotate(-${sign.angle}deg)`,
            }}
          >
            {sign.icon}
          </div>
        ))}

        {/* Orbiting Planets */}
        <div className="floating-planet absolute w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full shadow-lg"
          style={{ top: '20%', left: '30%' }}></div>
        <div className="floating-planet absolute w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-lg"
          style={{ top: '70%', left: '20%' }}></div>
        <div className="floating-planet absolute w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-lg"
          style={{ top: '30%', left: '70%' }}></div>
        <div className="floating-planet absolute w-7 h-7 bg-gradient-to-r from-red-400 to-red-600 rounded-full shadow-lg"
          style={{ top: '80%', left: '80%' }}></div>

        {/* Animated Stars - Only render after client-side hydration */}
        {stars.map((star: { left: string; top: string; delay: string; duration: string }, i: number) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              animationDuration: star.duration
            }}
          />
        ))}
      </div>
    );
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
            }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 overflow-hidden">
      <Navbar />
      <ChatBot />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-amber-300 rounded-full opacity-20 floating-element"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-orange-200 rounded-full opacity-15 floating-element"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-amber-200 rounded-full opacity-20 floating-element"></div>
      </div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white"
      >
        {/* Animated Cosmic Background */}
        <div className="absolute inset-0 z-0">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 -left-10 w-72 h-72 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full blur-3xl opacity-20 floating-element"></div>
          <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-15 floating-element"></div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `
              linear-gradient(to right, #d97706 1px, transparent 1px),
              linear-gradient(to bottom, #d97706 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="text-left">
              <div className="mb-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-100 rounded-full border border-amber-200 mb-6">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">Trusted by 10,000+ Seekers</span>
                </div>

                <h1 className="hero-title text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-slate-900 font-serif leading-tight">
                  <span className="block bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
                    {t('hero.title1')}
                  </span>
                  <span className="block bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent">
                    {t('hero.title2')}
                  </span>
                </h1>

                <p className="hero-subtitle text-xl md:text-2xl text-slate-700 mb-8 font-light leading-relaxed max-w-2xl font-serif">
                  {t('hero.subtitle')}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/kundali">
                  <Button
                    size="lg"
                    className="cta-button hero-button bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg px-8 py-7 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-amber-400/50 font-bold relative overflow-hidden group"
                    onMouseEnter={handleButtonHover}
                    onMouseLeave={handleButtonLeave}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Sparkles className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    {t('hero.cta1')}
                    <Zap className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link href="/subscription">
                  <Button
                    size="lg"
                    variant="outline"
                    className="cta-button hero-button text-lg px-8 py-7 rounded-2xl border-3 border-amber-500/80 text-amber-700 bg-white/80 backdrop-blur-sm hover:bg-amber-50 hover:border-amber-600 hover:text-amber-800 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold group"
                    onMouseEnter={handleButtonHover}
                    onMouseLeave={handleButtonLeave}
                  >
                    <Star className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    {t('hero.cta2')}
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
                {[
                  { icon: Sparkles, label: 'Happy Users', value: '10K+', color: 'text-amber-600' },
                  { icon: Star, label: 'Expert Astrologers', value: '50+', color: 'text-orange-600' },
                  { icon: Award, label: 'Years Experience', value: '15+', color: 'text-amber-700' },
                  { icon: TrendingUp, label: 'Accuracy', value: '98%', color: 'text-green-600' },
                ].map((stat, index) => (
                  <div key={stat.label} className="hero-stats text-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-lg font-bold text-slate-800 mb-1">{stat.value}</div>
                    <div className="text-xs text-slate-600 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Animated Zodiac Wheel */}
            <div className="relative">
              <div className="relative z-10">
                <ZodiacWheel />
              </div>

              {/* Floating Elements */}
              <div className="absolute top-10 left-10 w-20 h-20 bg-amber-200/30 rounded-full blur-xl floating-element"></div>
              <div className="absolute bottom-20 right-10 w-16 h-16 bg-orange-200/20 rounded-full blur-xl floating-element"></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center">
            <span className="text-sm text-amber-600 mb-2 font-semibold">Explore More</span>
            <div className="w-6 h-10 border-2 border-amber-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-amber-400 rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative py-24 bg-gradient-to-b from-white to-amber-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 font-serif">
                {t('features.title')}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
            </div>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-serif">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link key={feature.title} href={feature.href}>
                <Card className={`feature-card group relative overflow-hidden ${feature.bgColor} rounded-3xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-amber-200/50`}>
                  {/* Badges */}
                  {feature.popular && (
                    <div className="absolute top-4 left-4 z-20">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        Most Popular
                      </div>
                    </div>
                  )}
                  {feature.new && (
                    <div className="absolute top-4 left-4 z-20">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        New Feature
                      </div>
                    </div>
                  )}

                  {/* Background Image with Overlay */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className={`absolute top-4 right-4 w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-700 transition-colors duration-300 font-serif">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-4 text-sm">
                      {feature.description}
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center text-amber-600 group-hover:text-amber-700 transition-colors duration-300 font-semibold">
                      <span className="text-sm">Explore Service</span>
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-300/50 rounded-3xl transition-all duration-500" />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="relative py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-serif">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join our growing community of believers who have found guidance, clarity, and transformation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {[
              { icon: Users, label: 'Satisfied Clients', value: '10000', color: 'from-amber-500 to-orange-500' },
              { icon: Award, label: 'Expert Astrologers', value: '50', color: 'from-purple-500 to-indigo-500' },
              { icon: Star, label: 'Accurate Predictions', value: '95%', color: 'from-blue-500 to-cyan-500' },
              { icon: TrendingUp, label: 'Success Rate', value: '98%', color: 'from-green-500 to-emerald-500' },
            ].map((stat) => (
              <div key={stat.label} className="stat-item text-center group">
                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="w-12 h-12 text-white" />
                </div>
                <h3
                  className="text-4xl font-bold text-slate-900 mb-3 group-hover:text-amber-700 transition-colors duration-300 count-up"
                  data-value={stat.value}
                >
                  0{stat.value.includes('%') ? '%' : '+'}
                </h3>
                <p className="text-slate-600 font-semibold text-lg">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-slate-900 mb-12 font-serif">What Our Clients Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm border border-amber-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                      <p className="text-sm text-slate-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <StarRating rating={testimonial.rating} />
                  <p className="text-slate-700 mt-4 text-sm leading-relaxed">"{testimonial.content}"</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="relative py-24 bg-gradient-to-br from-white to-amber-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            {/* Main CTA Card */}
            <div className="cta-card bg-gradient-to-br from-amber-500 to-orange-600 rounded-4xl p-12 shadow-2xl border border-amber-400/30 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
              </div>

              <div className="relative z-10">
                <div className="w-24 h-1 bg-white/60 mx-auto mb-6 rounded-full"></div>

                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif leading-tight">
                  Begin Your Cosmic<br />Journey Today
                </h2>

                <p className="text-xl text-amber-100 mb-12 leading-relaxed max-w-2xl mx-auto font-serif">
                  Join thousands of enlightened souls who have discovered their true path through our divine guidance and celestial insights
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-white text-amber-700 hover:bg-amber-50 text-lg px-12 py-7 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-white font-bold relative overflow-hidden group"
                      onMouseEnter={handleButtonHover}
                      onMouseLeave={handleButtonLeave}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Sparkles className="w-6 h-6 mr-3 text-amber-600" />
                      Start Free Trial
                      <Zap className="w-5 h-5 ml-2 text-amber-600" />
                    </Button>
                  </Link>

                  <Link href="/talk-to-astrologer">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-12 py-7 rounded-2xl border-3 border-white/80 text-white bg-transparent hover:bg-white/10 hover:border-white backdrop-blur-sm transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold group"
                      onMouseEnter={handleButtonHover}
                      onMouseLeave={handleButtonLeave}
                    >
                      <MessageCircle className="w-6 h-6 mr-3" />
                      Consult Expert
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-700">
              <div className="flex items-center justify-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300">
                <Shield className="w-8 h-8 text-amber-600" />
                <div className="text-left">
                  <div className="font-bold text-lg">100% Secure</div>
                  <div className="text-sm text-slate-600">& Confidential</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300">
                <Clock className="w-8 h-8 text-amber-600" />
                <div className="text-left">
                  <div className="font-bold text-lg">24/7 Available</div>
                  <div className="text-sm text-slate-600">Services</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300">
                <Heart className="w-8 h-8 text-amber-600" />
                <div className="text-left">
                  <div className="font-bold text-lg">Trusted Since</div>
                  <div className="text-sm text-slate-600">2008</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}