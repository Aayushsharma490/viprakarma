'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import { Card } from '@/components/ui/card';
import { Star, Users, Award, Heart, Sparkles, Target, Shield } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Star,
      title: 'Authenticity',
      description: 'We provide genuine Vedic astrology insights based on ancient wisdom and modern calculations.',
    },
    {
      icon: Users,
      title: 'Expert Astrologers',
      description: 'Our team consists of certified and experienced astrologers with years of practice.',
    },
    {
      icon: Award,
      title: 'Accuracy',
      description: 'We use precise astronomical calculations and authentic astrological methods.',
    },
    {
      icon: Heart,
      title: 'Personalized Care',
      description: 'Every consultation is tailored to your unique birth chart and life circumstances.',
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Your personal data and birth details are kept completely confidential.',
    },
    {
      icon: Target,
      title: 'Life Guidance',
      description: 'We help you make informed decisions about career, relationships, health, and more.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Users' },
    { number: '50+', label: 'Expert Astrologers' },
    { number: '25,000+', label: 'Kundalis Generated' },
    { number: '98%', label: 'Satisfaction Rate' },
  ];

  return (
    <div className="min-h-screen cosmic-gradient">
      <Navbar />
      <ChatBot />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="fixed inset-0 stars-bg opacity-30 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-cosmic">
              About Viprakarma
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Your trusted companion for cosmic guidance and spiritual services
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="glass-effect p-8 md:p-12">
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-cosmic">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground text-center leading-relaxed mb-4">
                At Viprakarma, we believe that understanding the cosmic forces that shape our lives 
                can lead to better decisions, deeper self-awareness, and a more fulfilling existence. 
                Our mission is to make authentic Vedic astrology and spiritual services accessible to everyone through 
                modern technology while preserving the ancient wisdom of our traditions.
              </p>
              <p className="text-lg text-muted-foreground text-center leading-relaxed">
                We combine the precision of astronomical calculations with the insights of experienced 
                astrologers to provide you with accurate, personalized guidance for every aspect of your life.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect p-6 text-center hover:glow-purple transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-bold text-cosmic mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-cosmic">
              Our Values
            </h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect p-6 h-full hover:glow-purple transition-all duration-300">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #6d28d9, #a855f7)',
                    }}
                  >
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="glass-effect p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-cosmic">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Viprakarma was born from a deep passion for Vedic astrology and a vision to 
                  make this ancient science accessible to the modern world. Our founders, experienced 
                  astrologers themselves, recognized the gap between traditional astrological consultations 
                  and the fast-paced digital age.
                </p>
                <p>
                  We assembled a team of certified astrologers, skilled developers, and design experts 
                  to create a platform that combines the best of both worlds - the profound wisdom of 
                  Vedic astrology and the convenience of modern technology.
                </p>
                <p>
                  Today, we serve thousands of users worldwide, helping them navigate life's challenges 
                  with cosmic guidance. Whether it's career decisions, relationship questions, health 
                  concerns, or spiritual growth, we're here to illuminate your path with the light of 
                  astrological wisdom.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}