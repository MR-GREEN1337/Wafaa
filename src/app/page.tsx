"use client"

import React, { useState, useEffect } from 'react';
import Logo from '@/components/global/logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { 
  Lightbulb, 
  Shield, 
  Sparkles, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Lock,
  Users,
  CheckCircle2
} from 'lucide-react';
import ProductShowcase from '@/components/global/ProductShowcase';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      quote: "This platform helped us understand each other on a deeper level. The AI insights were eye-opening.",
      author: "Sarah & Michael",
      role: "Together 3 years",
      metric: "Communication improved by 80%"
    },
    {
      quote: "The private space to discuss issues with AI guidance helped us overcome challenges we'd been facing for months.",
      author: "David & Emma",
      role: "Married 2 years",
      metric: "Resolved 90% of recurring conflicts"
    },
    {
      quote: "Having an unbiased AI mediator changed everything. It helped us see perspectives we were missing.",
      author: "Alex & Jordan",
      role: "Dating 1 year",
      metric: "Relationship satisfaction up 75%"
    }
  ];

  const features = [
    {
      title: "AI-Powered Analysis",
      description: "Our advanced AI analyzes communication patterns and provides personalized insights for both partners.",
      icon: <TrendingUp className="w-10 h-10 text-rose-600" />
    },
    {
      title: "Private Space",
      description: "Each partner has a secure, private space to share thoughts and receive personalized guidance.",
      icon: <Lock className="w-10 h-10 text-rose-600" />
    },
    {
      title: "Real-time Mediation",
      description: "Get immediate, unbiased AI assistance during discussions or conflicts.",
      icon: <MessageCircle className="w-10 h-10 text-rose-600" />
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-rose-50 via-purple-50 to-rose-100 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="absolute inset-0">
          <div className="absolute -right-10 top-1/4 w-96 h-96 bg-gradient-to-br from-rose-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -left-10 top-3/4 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-rose-300/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <header className="relative w-full p-8 flex justify-between items-center max-w-7xl mx-auto">
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <Logo />
          </div>
        </header>

        <section className="relative flex flex-col items-center justify-center p-8 md:p-20 text-center space-y-10 min-h-[85vh]">
          <div className="absolute top-0 right-0 bg-rose-100/20 p-4 rounded-lg animate-fade-in">
            <div className="flex items-center space-x-2">
              <Users className="text-rose-600 w-5 h-5" />
              <span className="text-sm text-gray-600">2,500+ Couples Helped</span>
            </div>
          </div>

          <h1 className={`text-4xl md:text-7xl font-extrabold leading-tight bg-gradient-to-r from-gray-900 via-rose-800 to-purple-900 bg-clip-text text-transparent transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            Transform Your Relationship
            <span className="block mt-2 text-3xl md:text-6xl">
              With AI-Guided Communication
              <Heart className="inline-block ml-3 w-8 h-8 md:w-10 md:h-10 text-rose-600 animate-pulse" />
            </span>
          </h1>
          
          <p className={`text-xl md:text-2xl text-gray-700 max-w-3xl transition-all duration-700 delay-200 leading-relaxed ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            Our AI platform creates a safe space for both partners to share, understand, and grow together. Get personalized insights and guidance for a stronger relationship.
          </p>
          
          <div className={`flex flex-col md:flex-row gap-4 md:gap-6 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <a href="/dashboard">
              <Button className="w-full md:w-auto bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white px-8 md:px-12 py-6 md:py-7 rounded-full text-lg font-medium tracking-wide shadow-xl hover:shadow-2xl transform transition hover:-translate-y-1">
                Start Your Journey Together
              </Button>
            </a>
          </div>
        </section>
      </div>

      <ProductShowcase />

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 to-rose-900 bg-clip-text text-transparent mb-20">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-rose-50">
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center transform transition-transform group-hover:scale-110 duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-br from-rose-50 to-purple-50 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Success Stories</h2>
          
          <div className="relative overflow-hidden">
            <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
                    <p className="text-gray-700 mb-6 text-lg md:text-xl leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.author}</p>
                        <p className="text-rose-600 text-sm mt-1">{testimonial.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{testimonial.metric}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-gray-900 via-rose-900 to-purple-900 text-white py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Strengthen Your Relationship?</h2>
          <p className="text-xl md:text-2xl mb-12 text-rose-100 leading-relaxed">
            Join thousands of couples who've transformed their relationships with AI-guided communication.
          </p>
          <a href="/dashboard">
            <Button className="bg-white text-rose-600 hover:bg-rose-50 px-8 md:px-12 py-6 md:py-7 rounded-full text-lg font-medium tracking-wide shadow-xl hover:shadow-2xl transform transition hover:-translate-y-1">
              Begin Your Free Trial
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">About Us</h3>
              <p className="text-gray-400 leading-relaxed">
                Pioneering AI-guided relationship communication for stronger, healthier partnerships.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Features</h3>
              <ul className="space-y-3">
                <li><a href="/how-it-works" className="text-gray-400 hover:text-white transition">How It Works</a></li>
                <li><a href="/pricing" className="text-gray-400 hover:text-white transition">Pricing</a></li>
                <li><a href="/testimonials" className="text-gray-400 hover:text-white transition">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Legal</h3>
              <ul className="space-y-3">
                <li><a href="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
                <li><a href="/security" className="text-gray-400 hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Support</h3>
              <ul className="space-y-3">
                <li><a href="/contact" className="text-gray-400 hover:text-white transition">Contact Us</a></li>
                <li><a href="/faq" className="text-gray-400 hover:text-white transition">FAQ</a></li>
                <li><a href="/help" className="text-gray-400 hover:text-white transition">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;