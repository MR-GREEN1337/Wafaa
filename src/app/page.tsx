"use client"

import React, { useState, useEffect } from 'react';
import Logo from '@/components/global/logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Lightbulb, Shield, Sparkles, Diamond, Heart, Star, ArrowLeft, ArrowRight } from 'lucide-react';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  
  const dashboardScreenshots = [
    {
      title: "AI-Powered Relationship Analytics",
      description: "Get deep insights into your relationship patterns with our advanced analytics dashboard",
      image: "/snapshots/1.png"
    },
    {
      title: "Interactive Connection Timeline",
      description: "Visualize your journey together with our beautiful timeline interface",
      image: "/snapshots/2.png"
    },
    {
      title: "Real-time Mood Tracking",
      description: "Stay connected with intelligent emotion tracking and suggestions",
      image: "/snapshots/3.png"
    }
  ];


const ProductShowcase = () => (
    <section className="py-32 bg-gradient-to-br from-gray-50 to-rose-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -left-40 -top-40 w-80 h-80 bg-rose-300/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -right-40 -bottom-40 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-700" />

          {/* Main showcase container */}
          <div className="relative">
            <div className="flex items-center justify-between mb-12">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {dashboardScreenshots[activeSlide].title}
                </h3>
                <p className="text-xl text-gray-600">
                  {dashboardScreenshots[activeSlide].description}
                </p>
              </div>
              <div className="flex gap-4 ml-8">
                <Button
                  variant="outline"
                  className="rounded-full p-3"
                  onClick={() => setActiveSlide((prev) => (prev === 0 ? dashboardScreenshots.length - 1 : prev - 1))}
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full p-3"
                  onClick={() => setActiveSlide((prev) => (prev === dashboardScreenshots.length - 1 ? 0 : prev + 1))}
                >
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Screenshot showcase */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/10 to-purple-600/10 mix-blend-overlay" />
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-gray-200 bg-white/10 backdrop-blur-sm">
                <div className="absolute top-0 w-full h-8 bg-gray-900/5 backdrop-blur-sm border-b border-gray-200/20" />
                <img
                  src={dashboardScreenshots[activeSlide].image}
                  alt={dashboardScreenshots[activeSlide].title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center mt-8 gap-3">
              {dashboardScreenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeSlide === index
                      ? 'bg-rose-600 w-12'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );


  return (
    <div className="min-h-screen">
      {/* Hero Section with Premium Gradient Animation */}
      <div className="relative bg-gradient-to-br from-rose-50 via-purple-50 to-rose-100 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        {/* Enhanced floating shapes animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 top-1/4 w-96 h-96 bg-gradient-to-br from-rose-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -left-10 top-3/4 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-rose-300/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        {/* Premium Header */}
        <header className="relative w-full p-8 flex justify-between items-center max-w-7xl mx-auto">
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <Logo />
          </div>
          
          <nav className="space-x-12">
            {['Experience', 'Pricing', 'Resources', 'Begin'].map((item, index) => (
              <a
                key={item}
                href={item === 'Experience' ? '/' : `/${item.toLowerCase()}`}
                className={`text-gray-800 hover:text-rose-600 text-sm tracking-wider uppercase transition-all duration-300 relative group ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-600 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>
        </header>

        {/* Enhanced Hero Content */}
        <section className="relative flex flex-col items-center justify-center p-20 text-center space-y-10 min-h-[85vh]">
          <h1 
            className={`text-7xl font-extrabold leading-tight bg-gradient-to-r from-gray-900 via-rose-800 to-purple-900 bg-clip-text text-transparent transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Elevate Your Relationship
            <span className="block mt-2 text-6xl">
              Through Intelligent Design
              <Sparkles className="inline-block ml-3 w-10 h-10 text-rose-600 animate-pulse" />
            </span>
          </h1>
          
          <p 
            className={`text-2xl text-gray-700 max-w-3xl transition-all duration-700 delay-200 leading-relaxed ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Experience the evolution of relationship excellence through our pioneering
            AI-powered platform. Where emotional intelligence meets artificial intelligence.
          </p>
          
          <div 
            className={`flex gap-6 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <a href="/dashboard">
              <Button 
                className="bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white px-12 py-7 rounded-full text-lg font-medium tracking-wide shadow-xl hover:shadow-2xl transform transition hover:-translate-y-1"
              >
                Begin Your Journey
              </Button>
            </a>
            <Button 
              variant="outline"
              className="border-2 border-rose-600 text-rose-600 hover:bg-rose-900 ease-in-out duration-300 hover:text-white px-12 py-7 rounded-full text-lg font-medium tracking-wide"
            >
              Explore Platform
            </Button>
          </div>
        </section>
      </div>

      <ProductShowcase />
      {/* Enhanced Features Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl font-bold text-center bg-gradient-to-r from-gray-900 to-rose-900 bg-clip-text text-transparent mb-20">The Wafaa Experience</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Intelligent Insights",
                description: "Advanced AI analysis provides deep understanding of relationship dynamics and personalized guidance.",
                icon: <Diamond className="w-10 h-10 text-rose-600" />
              },
              {
                title: "Continuous Evolution",
                description: "24/7 adaptive support that grows with your relationship, providing real-time guidance when you need it most.",
                icon: <Star className="w-10 h-10 text-rose-600" />
              },  
              {
                title: "Ultimate Privacy",
                description: "Military-grade encryption and privacy protocols ensure your journey remains completely confidential.",
                icon: <Shield className="w-10 h-10 text-rose-600" />
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-rose-50"
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center transform transition-transform group-hover:scale-110 duration-500">{feature.icon}</div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Enhanced Social Proof */}
      <section className="bg-gradient-to-br from-rose-50 to-purple-50 py-32">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-16">Transforming Relationships Worldwide</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                quote: "Wafaa's intelligent approach has transformed how we understand and nurture our relationship.",
                author: "Alexandra & James",
                role: "Partners in Life & Business"
              },
              {
                quote: "The depth of insights and continuous support has been revolutionary for our relationship.",
                author: "Sofia & Marcus",
                role: "Together for 5 years"
              },
              {
                quote: "A masterpiece of relationship technology. It's changed everything about how we connect.",
                author: "Elena & Thomas",
                role: "Recently Engaged"
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">"{testimonial.quote}"</p>
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-rose-600 text-sm mt-1">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="bg-gradient-to-br from-gray-900 via-rose-900 to-purple-900 text-white py-32">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl font-bold mb-8">Begin Your Journey to Excellence</h2>
          <p className="text-2xl mb-12 text-rose-100 leading-relaxed">
            Join the elite community of couples experiencing the future of relationship evolution.
          </p>
          <a href="/dashboard">
          <Button 
            className="bg-white text-rose-600 hover:bg-rose-50 px-12 py-7 rounded-full text-lg font-medium tracking-wide shadow-xl hover:shadow-2xl transform transition hover:-translate-y-1"
          >
            Transform Your Relationship
          </Button>
          </a>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">About Wafaa</h3>
              <p className="text-gray-400 leading-relaxed">
                Pioneering the future of relationship excellence through intelligent technology and human understanding.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Platform</h3>
              <ul className="space-y-3">
                <li><a href="/about" className="text-gray-400 hover:text-white transition">Our Approach</a></li>
                <li><a href="/blog" className="text-gray-400 hover:text-white transition">Insights</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition">Connect</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Legal</h3>
              <ul className="space-y-3">
                <li><a href="/privacy" className="text-gray-400 hover:text-white transition">Privacy</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white transition">Terms</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Connect</h3>
              <div className="flex space-x-4">
                {/* Social icons would go here */}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Wafaa. Elevating relationships through intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;