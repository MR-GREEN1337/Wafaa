import {
  Heart,
  MessageCircle,
  Lightbulb,
  Calendar,
  FileText,
  Coins,
  HandHeart,
  UserPen,
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
    href: "/dashboard/reports",
    label: "Progress Reports",
    icon: FileText,
  },
  {
    href: "/dashboard/billing",
    label: "Billing & Payments",
    icon: Coins,
  },
  {
    href: "/dashboard/profile",
    label: "Profile settings",
    icon: UserPen,
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
      id:
        process.env.NODE_ENV === "production"
          ? "price_1QOA3YGL4zbMHWPioI55sINH" // Production ID
          : "price_1QPI4RGL4zbMHWPiP67zbyKW", // Development ID
      name: "Basic",
      price: 9.9,
      description: "For individuals seeking to enhance one key relationship",
      features: [
        "50 monthly conversation credits",
        "Up to 50 counseling sessions per month",
        "Manage up to 5 relationships",
        "Basic relationship insights",
        "Email support within 24 hours",
        "Core relationship analytics",
      ],
      sessionLimit: 50,
      relationshipLimit: 5,
      monthlyCredits: 50,
      usage: {
        credits: "50 credits/month",
        sessions: "Up to 50 sessions/month",
        relationships: "Maximum 5 active relationships",
      },
    },
    {
      id:
        process.env.NODE_ENV === "production"
          ? "price_1QOA46GL4zbMHWPiM1ZqHYEG" // Production ID
          : "price_dev_counselor", // Development ID
      name: "Counselor",
      price: 29,
      description: "Perfect for relationship coaches and counselors",
      features: [
        "200 monthly conversation credits",
        "Up to 200 counseling sessions per month",
        "Manage up to 20 client relationships",
        "Advanced relationship insights",
        "Priority support within 4 hours",
        "Detailed relationship analytics",
        "Client progress tracking",
        "API access for integration",
      ],
      sessionLimit: 200,
      relationshipLimit: 20,
      monthlyCredits: 200,
      usage: {
        credits: "200 credits/month",
        sessions: "Up to 200 sessions/month",
        relationships: "Maximum 20 active relationships",
      },
    },
    {
      id:
        process.env.NODE_ENV === "production"
          ? "price_1QOA4NGL4zbMHWPiRXqH5m8R" // Production ID
          : "price_dev_practice", // Development ID
      name: "Practice",
      price: 99,
      description: "For professional practices and counseling centers",
      features: [
        "1,000 monthly conversation credits",
        "Unlimited counseling sessions",
        "Support up to 2,000 client relationships",
        "Premium relationship insights",
        "24/7 dedicated support",
        "Custom practice analytics",
        "Multi-counselor management",
        "SSO authentication",
        "Custom branding options",
      ],
      sessionLimit: 10000,
      relationshipLimit: 2000,
      monthlyCredits: 1000,
      usage: {
        credits: "1,000 credits/month",
        sessions: "Unlimited sessions (up to 10,000/month)",
        relationships: "Maximum 2,000 active relationships",
      },
    },
  ];
  