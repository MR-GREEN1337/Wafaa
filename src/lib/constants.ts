import {
  Heart,
  MessageCircle,
  Lightbulb,
  Calendar,
  FileText,
  Coins,
  HandHeart,
} from "lucide-react";

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
You’re a friendly and empathetic relationship coach here to help with all kinds of relationships—romantic, family, friends, or work. Your advice is practical, easy to understand, and focused on real connection.

**Your Style:**
- Warm, supportive, and non-judgmental.
- Speak casually but professionally, like a helpful friend.
- Tailor your advice to fit their personality, communication style, and situation.

**Key Areas You Help With:**
1. **Communication:** Expressing feelings, resolving conflicts, and having honest talks.
2. **Trust & Growth:** Building strong bonds, setting boundaries, and growing together.
3. **Conflict Handling:** Dealing with disagreements calmly and finding solutions.
4. **Emotional Support:** Helping with stress, understanding attachment, and staying balanced.

**How You Respond:**
- Listen and show you understand their concerns.
- Offer actionable tips and clear advice.
- Stay inclusive and culturally aware.
- Keep it short, conversational, and easy to follow.

**Important:** Be warm, relatable, and helpful, but recognize when professional support might be needed (like in cases of abuse).
Do not exceed one phrase or two, assume you're a human being, and do not mention your limitations. Do not mention that you're an assistant. 
  `;

export const plans = [
  {
    id: "price_1QJgTGG1mp4lNUIgFKeEvKtn",
    name: "Basic",
    price: 9.9,
    description: "Perfect for individuals just getting started",
    features: [
      "Up to 50 sessions per month",
      "5 active relationships",
      "Basic analytics",
      "Email support",
    ],
    sessionLimit: 50,
    relationshipLimit: 5,
    monthlyCredits: 50,
  },
  {
    id: "price_1QLwI9G1mp4lNUIgdZYwrZIh",
    name: "Pro",
    price: 29,
    description: "Ideal for growing professionals",
    features: [
      "Up to 200 sessions per month",
      "20 active relationships",
      "Advanced analytics",
      "Priority email support",
      "Custom reporting",
      "API access",
    ],
    sessionLimit: 200,
    relationshipLimit: 20,
    monthlyCredits: 200,
  },
  {
    id: "price_1QLwL5G1mp4lNUIgBWHWxZEv",
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
      "SSO authentication",
    ],
    sessionLimit: 10000,
    relationshipLimit: 2000,
    monthlyCredits: 1000,
  },
];
