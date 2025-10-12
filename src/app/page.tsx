'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import { Sparkles, Star, BookOpen, Users, MessageCircle, Calendar, Award, TrendingUp } from 'lucide-react';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    
    gsap.fromTo(
      heroRef.current.querySelector('.hero-title'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 }
    );

    gsap.fromTo(
      heroRef.current.querySelector('.hero-subtitle'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.3 }
    );
  }, []);

  const features = [
    {
      icon: Star,
      title: 'Kundali Generator',
      description: 'Get your personalized birth chart with detailed planetary positions and accurate predictions',
      href: '/kundali',
      color: '#d97706',
    },
    {
      icon: BookOpen,
      title: 'Numerology',
      description: 'Discover your life path, destiny, and soul urge numbers with comprehensive insights',
      href: '/numerology',
      color: '#f59e0b',
    },
    {
      icon: Users,
      title: 'Palmistry Analysis',
      description: 'Upload your palm image for detailed analysis and accurate readings',
      href: '/palmistry',
      color: '#fbbf24',
    },
    {
      icon: MessageCircle,
      title: 'AI Astro Chat',
      description: 'Chat with our AI astrologer anytime for instant cosmic guidance and daily horoscope',
      href: '/chat',
      color: '#d97706',
    },
    {
      icon: Users,
      title: 'Talk to Astrologer',
      description: 'Connect with expert astrologers for personalized consultations via call, video or chat',
      href: '/talk-to-astrologer',
      color: '#f59e0b',
    },
    {
      icon: Calendar,
      title: 'Book Pandit',
      description: 'Book experienced pandits for pujas and ceremonies at your home',
      href: '/pandit',
      color: '#fbbf24',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ChatBot />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
      >
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-25"
          >
            <source src="https://cdn.pixabay.com/video/2022/11/11/138641-770952026_large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
              <span className="text-amber-300">Discover Your</span>
              <br />
              <span className="text-white">Cosmic Blueprint</span>
            </h1>
            
            <p className="hero-subtitle text-xl md:text-2xl text-amber-100 mb-8 font-medium drop-shadow-lg">
              Unlock the secrets of the universe with personalized astrology, numerology, and expert guidance
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/kundali">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-8">
                  Generate Kundali
                </Button>
              </Link>
              <Link href="/subscription">
                <Button size="lg" variant="outline" className="text-lg px-8 border-2 border-white text-black hover:bg-white/20 backdrop-blur-sm">
                  View Plans
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-amber-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span className="font-medium text-black">10,000+ Happy Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-300" />
                <span className="font-medium text-black">Expert Astrologers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 golden-text">
              Explore Your Cosmic Journey
            </h2>
            <p className="text-xl text-gray-600">
              Choose from our range of services to unlock your destiny
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.href}>
                <Card className="classical-card p-6 classical-hover h-full group cursor-pointer">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{
                      background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)`,
                    }}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-amber-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, label: 'Happy Clients', value: '10,000+' },
              { icon: Award, label: 'Expert Astrologers', value: '50+' },
              { icon: Star, label: 'Accurate Predictions', value: '95%' },
              { icon: TrendingUp, label: 'Success Rate', value: '98%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 classical-shadow">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-amber-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="ornate-border rounded-3xl p-12 text-center max-w-4xl mx-auto bg-gradient-to-r from-amber-50 to-amber-100 classical-shadow">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 golden-text">
              Ready to Unlock Your Destiny?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Join thousands of users who trust Astro Genesis for their cosmic insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-8 classical-shadow">
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/talk-to-astrologer">
                <Button size="lg" variant="outline" className="text-lg px-8 border-2 border-amber-600 text-amber-900 hover:bg-amber-50">
                  Consult an Expert
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}