'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
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
        { scale: 0, rotation: -360, opacity: 0, filter: 'blur(10px)' },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 2,
          stagger: 0.1,
          ease: 'elastic.out(1, 0.5)',
          delay: 0.5
        }
      );

      // Floating planets with glow
      gsap.to('.floating-planet', {
        y: 30,
        rotation: 360,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 2
      });

      tl.fromTo(
        heroRef.current.querySelector('.hero-title'),
        { opacity: 0, y: 100, scale: 0.7, filter: 'blur(20px)' },
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.8, ease: 'expo.out' }
      )
        .fromTo(
          heroRef.current.querySelector('.hero-subtitle'),
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration: 1.5, ease: 'power4.out' },
          '-=1'
        )
        .fromTo(
          heroRef.current.querySelectorAll('.hero-button'),
          { opacity: 0, y: 40, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            stagger: 0.4,
            ease: 'back.out(1.7)',
            onComplete: () => {
              // Button pulse animation - only if target exists
              const targets = document.querySelectorAll('.cta-button');
              if (targets.length > 0) {
                gsap.to(targets, {
                  boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)',
                  duration: 2,
                  repeat: -1,
                  yoyo: true,
                  ease: 'sine.inOut'
                });
              }
            }
          },
          '-=0.8'
        )
        .fromTo(
          heroRef.current.querySelectorAll('.hero-stats'),
          { opacity: 0, scale: 0.5, rotationX: 90 },
          {
            opacity: 1,
            scale: 1,
            rotationX: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'expo.out'
          },
          '-=0.5'
        );
    }

    // Features animations
    if (featuresRef.current) {
      const featureCards = featuresRef.current.querySelectorAll('.feature-card');
      if (featureCards.length > 0) {
        gsap.fromTo(
          featureCards,
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
          <div className="w-32 h-32 bg-gradient-to-r from-[#FFD700] to-orange-400 rounded-full shadow-[0_0_60px_rgba(255,215,0,0.3)] floating-planet relative group">
            <div className="absolute inset-2 bg-gradient-to-r from-white to-amber-200 rounded-full animate-pulse group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-[#FFD700]/20 rounded-full blur-2xl animate-pulse"></div>
          </div>
        </div>

        {/* Zodiac Signs in Circular Pattern */}
        {[
          { icon: '♈', name: 'Aries', angle: 0 },
          { icon: '♉', name: 'Taurus', angle: 30 },
          { icon: '♊', name: 'Gemini', angle: 60 },
          { icon: '♋', name: 'Cancer', angle: 90 },
          { icon: '♌', name: 'Leo', angle: 120 },
          { icon: '♍', name: 'Virgo', angle: 150 },
          { icon: '♎', name: 'Libra', angle: 180 },
          { icon: '♏', name: 'Scorpio', angle: 210 },
          { icon: '♐', name: 'Sagittarius', angle: 240 },
          { icon: '♑', name: 'Capricorn', angle: 270 },
          { icon: '♒', name: 'Aquarius', angle: 300 },
          { icon: '♓', name: 'Pisces', angle: 330 },
        ].map((sign, index) => (
          <div
            key={sign.name}
            className={`zodiac-sign absolute transform -translate-x-1/2 -translate-y-1/2 text-foreground font-black text-2xl md:text-3xl bg-card/60 backdrop-blur-xl rounded-full w-14 h-14 md:w-20 md:h-20 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.2)] border border-border hover:border-primary hover:text-primary hover:shadow-[0_0_40px_rgba(255,215,0,0.3)] transition-all duration-500 cursor-pointer floating-element font-sans`}
            style={{
              left: `50%`,
              top: `50%`,
              transform: `rotate(${sign.angle}deg) translate(${typeof window !== 'undefined' && window.innerWidth < 768 ? '140px' : '220px'}) rotate(-${sign.angle}deg)`,
            }}
          >
            {sign.icon}
          </div >
        ))}

        {/* Orbiting Planets */}
        <div className="floating-planet absolute w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-600 rounded-full shadow-lg border border-white/20"
          style={{ top: '20%', left: '30%' }}></div>
        <div className="floating-planet absolute w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full shadow-lg border border-white/20"
          style={{ top: '70%', left: '20%' }}></div>
        <div className="floating-planet absolute w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full shadow-lg border border-white/20"
          style={{ top: '30%', left: '70%' }}></div>

        {/* Animated Stars - Only render after client-side hydration */}
        {stars.map((star: { left: string; top: string; delay: string; duration: string }, i: number) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-40"
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
    <div className="min-h-screen bg-transparent overflow-hidden">
      <Navbar />
      <ChatBot />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent"
      >
        {/* Animated Cosmic Background Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `
              linear-gradient(to right, #FFD700 1px, transparent 1px),
              linear-gradient(to bottom, #FFD700 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="text-left py-12 lg:py-24">
              <div className="mb-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent/10 rounded-full border border-border mb-8 backdrop-blur-md animate-pulse">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Trusted by 10,000+ Seekers</span>
                </div>

                <h1 className="hero-title text-6xl md:text-7xl lg:text-8xl font-black mb-8 text-foreground font-sans leading-[0.9] tracking-tighter">
                  <span className="block drop-shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                    {t('hero.title1')}
                  </span>
                  <span className="block golden-text">
                    {t('hero.title2')}
                  </span>
                </h1>

                <p className="hero-subtitle text-lg md:text-xl text-muted-foreground mb-10 font-bold leading-relaxed max-w-xl font-sans uppercase tracking-[0.05em]">
                  {t('hero.subtitle')}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 mb-16">
                <Link href="/kundali">
                  <Button
                    size="lg"
                    className="cta-button hero-button bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-8 rounded-2xl shadow-[0_0_40px_rgba(255,215,0,0.2)] hover:shadow-[0_0_60px_rgba(255,215,0,0.4)] transition-all duration-500 font-black relative overflow-hidden group uppercase tracking-widest"
                    onMouseEnter={handleButtonHover}
                    onMouseLeave={handleButtonLeave}
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Sparkles className="w-6 h-6 mr-3" />
                    {t('hero.cta1')}
                    <Zap className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/subscription">
                  <Button
                    size="lg"
                    variant="outline"
                    className="cta-button hero-button text-lg px-10 py-8 rounded-2xl border-2 border-border text-foreground bg-background/50 backdrop-blur-sm hover:bg-accent/10 hover:border-primary/50 transition-all duration-500 shadow-xl font-bold group uppercase tracking-widest"
                    onMouseEnter={handleButtonHover}
                    onMouseLeave={handleButtonLeave}
                  >
                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {t('hero.cta2')}
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl">
                {[
                  { icon: Sparkles, label: 'Happy Users', value: '10K+', color: 'text-[#FFD700]' },
                  { icon: Star, label: 'Expert Astrologers', value: '50+', color: 'text-[#00F2FF]' },
                  { icon: Award, label: 'Years Experience', value: '15+', color: 'text-amber-500' },
                  { icon: TrendingUp, label: 'Accuracy', value: '98%', color: 'text-green-500' },
                ].map((stat, index) => (
                  <div key={stat.label} className="hero-stats text-left group cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <stat.icon className={`w-5 h-5 ${stat.color} group-hover:scale-110 transition-transform`} />
                      <div className="text-xl font-black text-foreground font-sans">{stat.value}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{stat.label}</div>
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
      <section ref={featuresRef} className="relative py-24 bg-transparent">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-6 mb-8">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary"></div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground uppercase tracking-tighter font-sans">
                {t('features.title').split(' ').slice(0, -2).join(' ')} <span className="golden-text">{t('features.title').split(' ').slice(-2, -1).join(' ')}</span> {t('features.title').split(' ').slice(-1).join(' ')}
              </h2>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary"></div>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-bold uppercase tracking-widest leading-relaxed">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Link href={feature.href}>
                  <Card className="celestial-card group relative overflow-hidden bg-card/40 border-border rounded-[2rem] p-4 cursor-pointer">
                    {/* Badge */}
                    {(feature.popular || feature.new) && (
                      <div className="absolute top-8 left-8 z-30">
                        <span className="bg-primary text-primary-foreground text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                          {feature.popular ? t('features.mostPopular') : t('features.newFeature')}
                        </span>
                      </div>
                    )}

                    {/* Image Container */}
                    <div className="relative h-56 rounded-[1.5rem] overflow-hidden mb-6">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                      {/* Icon overlay */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <div className={`w-20 h-20 rounded-full bg-background/40 backdrop-blur-xl border border-border flex items-center justify-center transition-all duration-500 group-hover:border-primary/30 group-hover:bg-primary/10`}>
                          <feature.icon className={`w-8 h-8 ${feature.popular ? 'text-primary' : 'text-foreground'} group-hover:scale-110 transition-transform`} />
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <h3 className="text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-colors duration-300 font-sans tracking-tight">
                        {t(`feature${features.indexOf(feature) + 1}.title`)}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-bold line-clamp-2">
                        {t(`feature${features.indexOf(feature) + 1}.desc`)}
                      </p>

                      <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary group-hover:gap-5 transition-all">
                        {t('features.exploreNow')}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="relative py-24 bg-transparent">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 uppercase tracking-tighter font-sans">
              {t('stats.title').split(' ').slice(0, -1).join(' ')} <span className="golden-text">{t('stats.title').split(' ').slice(-1).join(' ')}</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-bold uppercase tracking-widest leading-relaxed">
              {t('stats.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24 px-4">
            {[
              { icon: Users, labelKey: 'stats.users', value: '10000', color: 'text-primary' },
              { icon: Award, labelKey: 'stats.astrologers', value: '50', color: 'text-secondary' },
              { icon: Star, labelKey: 'stats.predictions', value: '95%', color: 'text-amber-500' },
              { icon: TrendingUp, labelKey: 'stats.rate', value: '98%', color: 'text-emerald-500' },
            ].map((stat, index) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="stat-item text-center group"
              >
                <div className={`w-20 h-20 rounded-[2rem] bg-card/40 border border-border flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:border-primary/30 transition-all duration-500`}>
                  <stat.icon className={`w-10 h-10 ${stat.color} group-hover:scale-110 transition-transform`} />
                </div>
                <h3
                  className="text-5xl font-black text-foreground mb-3 group-hover:text-primary transition-colors duration-300 count-up font-sans tracking-tighter"
                  data-value={stat.value}
                >
                  {stat.value}{stat.value.includes('%') ? '' : '+'}
                </h3>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{t(stat.labelKey)}</p>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-3xl font-black text-center text-white mb-16 uppercase tracking-widest font-sans">
              {t('stats.testimonials').split(' ').slice(0, -3).join(' ')} <span className="golden-text">{t('stats.testimonials').split(' ').slice(-3).join(' ')}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Card className="celestial-card p-8 border-border h-full group bg-card/40 rounded-[2.5rem] relative overflow-hidden transition-all duration-500 hover:bg-card/60">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 border border-border"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 shadow-lg">
                          <Sparkles className="w-3 h-3 text-primary-foreground" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-black text-foreground text-sm uppercase tracking-widest font-sans">{t(`testimonial${index + 1}.name`)}</h4>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">{t(`testimonial${index + 1}.role`)}</p>
                      </div>
                    </div>
                    <StarRating rating={testimonial.rating} />
                    <p className="text-muted-foreground mt-6 text-sm leading-relaxed font-bold italic group-hover:text-foreground transition-colors">"{t(`testimonial${index + 1}.content`)}"</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="relative py-32 bg-transparent overflow-hidden px-4">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto text-center">
            {/* Main CTA Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="cta-card bg-card/60 backdrop-blur-xl rounded-[3rem] p-12 lg:p-20 shadow-[0_0_80px_rgba(255,215,0,0.05)] border border-border relative overflow-hidden"
            >
              {/* Background Glows */}
              <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
              <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-secondary/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '3s' }}></div>

              <div className="relative z-10">
                <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-12 rounded-full opacity-50"></div>

                <h2 className="text-4xl md:text-6xl font-black text-foreground mb-8 uppercase tracking-tighter leading-[0.9] font-sans">
                  {t('cta.title').split(' ').slice(0, -3).join(' ')} <span className="golden-text">{t('cta.title').split(' ').slice(-3, -2).join(' ')}</span><br />{t('cta.title').split(' ').slice(-2).join(' ')}
                </h2>

                <p className="text-lg md:text-xl text-muted-foreground mb-16 leading-relaxed max-w-2xl mx-auto font-bold uppercase tracking-widest">
                  {t('cta.subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-14 py-10 rounded-2xl shadow-[0_0_50px_rgba(255,215,0,0.2)] hover:shadow-[0_0_70px_rgba(255,215,0,0.3)] transition-all duration-500 font-black relative overflow-hidden group uppercase tracking-[0.2em]"
                    >
                      <Sparkles className="w-6 h-6 mr-3" />
                      {t('cta.startJourney')}
                      <Zap className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>

                  <Link href="/talk-to-astrologer">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-xl px-14 py-10 rounded-2xl border-2 border-border text-foreground bg-background/40 hover:bg-accent/10 hover:border-primary/50 backdrop-blur-md transition-all duration-500 shadow-2xl font-black group uppercase tracking-[0.2em]"
                    >
                      {t('cta.consultNow')}
                      <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: '100% Secure', desc: '& Confidential' },
                { icon: Clock, title: '24/7 Available', desc: 'Divine Services' },
                { icon: Heart, title: 'Top Rated', desc: 'Trusted Service' }
              ].map((badge, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex items-center justify-center gap-6 celestial-card p-8 border-border hover:border-primary/10 transition-all duration-500 rounded-[2rem] bg-card/60 backdrop-blur-sm"
                >
                  <badge.icon className="w-10 h-10 text-primary" />
                  <div className="text-left">
                    <div className="font-black text-foreground uppercase tracking-[0.1em] text-sm font-sans">{t(`cta.${badge.title.toLowerCase().replace(/[^a-z]/g, '')}`)}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{t(`cta.${badge.title.toLowerCase().replace(/[^a-z]/g, '')}Desc`)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}