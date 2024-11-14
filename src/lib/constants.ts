import {
    Heart,
    MessageCircle,
    Lightbulb,
    Calendar,
    FileText,
    Coins,
    HandHeart
  } from 'lucide-react';
  
  export const routes = [
    {
      href: "/dashboard/",
      label: "Home",
      icon: Heart,
    },
    {
      href: "/dashboard/sessions",
      label: "Counseling Sessions",
      icon: MessageCircle,
    },
    {
      href: "/dashboard/relationships",
      label: "Relationships",
      icon: HandHeart,
    },
    {
      href: "/dashboard/resources",
      label: "Advice & Resources",
      icon: Lightbulb,
    },
    {
      href: "/dashboard/billing",
      label: "Billing & Payments",
      icon: Coins,
    },
    {
      href: "/dashboard/reports",
      label: "Progress Reports",
      icon: FileText,
    },
  ];
  
  export const prompt = `
  You are a compassionate and insightful assistant, trained to help individuals navigate and resolve marital issues. 
  Below is a conversation between a user and the assistant. Your goal is to provide empathetic, clear, and actionable advice based on the user's input.
  
  Your responses should be tailored to the emotional and relational challenges presented, with a focus on understanding, offering practical suggestions, and fostering communication. Always maintain a neutral, non-judgmental tone.
  
  If something is unclear, ask for further details to offer the most relevant and personalized advice. Avoid making assumptions about the user's situation.
  
  -- Conversation Start --
`;
  
export const plans = [
  {
    id: "price_1QJgTGG1mp4lNUIgFKeEvKtn",
    name: "Basic",
    price: 9.90,
    description: "Perfect for individuals just getting started",
    features: [
      "Up to 50 sessions per month",
      "5 active relationships",
      "Basic analytics",
      "Email support"
    ],
    sessionLimit: 50,
    relationshipLimit: 5,
    monthlyCredits: 50,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    description: "Ideal for growing professionals",
    features: [
      "Up to 200 sessions per month",
      "20 active relationships",
      "Advanced analytics",
      "Priority email support",
      "Custom reporting",
      "API access"
    ],
    sessionLimit: 200,
    relationshipLimit: 20,
    monthlyCredits: 50,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    description: "For large teams and organizations",
    features: [
      "Unlimited sessions",
      "Unlimited relationships",
      "Enterprise analytics",
      "24/7 priority support",
      "Custom integrations",
      "Dedicated account manager",
      "SSO authentication"
    ],
    sessionLimit: 999999,
    relationshipLimit: 999999,
    monthlyCredits: 50,
  }
]
