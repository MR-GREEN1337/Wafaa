import React from 'react';
import { 
  LightbulbIcon, 
  CheckCircle2, 
  TrendingUp, 
  HeartHandshake, 
  Target, 
  Compass 
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const ICON_STYLES = {
  default: {
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  positive: {
    bgColor: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200'
  },
  growth: {
    bgColor: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200'
  },
  relationship: {
    bgColor: 'bg-pink-50',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    borderColor: 'border-pink-200'
  }
};

const ICONS = {
  default: LightbulbIcon,
  positive: CheckCircle2,
  growth: TrendingUp,
  relationship: HeartHandshake,
  goal: Target,
  direction: Compass
};

interface AdviceCardProps {
  title?: string;
  description: string;
  type?: keyof typeof ICONS;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ 
  title = 'Recommendation', 
  description, 
  type = 'default' 
}) => {
  const Icon = ICONS[type];
  let styles = ICON_STYLES[type as keyof typeof ICON_STYLES];
  if (!styles) {
    styles = ICON_STYLES['default'];
  }

  return (
    <Card 
      className={`
        group overflow-hidden transition-all duration-300 
        hover:shadow-xl border-2 ${styles.borderColor}
        ${styles.bgColor} relative
      `}
    >
      <div 
        className={`
          absolute top-0 left-0 w-full h-1 
          transition-all duration-300 
          group-hover:h-2 
          ${styles.bgColor}
        `}
      />
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className={`
            p-2 rounded-lg ${styles.iconBg}
            transition-transform group-hover:scale-110
          `}>
            <Icon className={`w-6 h-6 ${styles.iconColor}`} />
          </div>
          <h3 className={`
            text-lg font-semibold ${styles.iconColor}
          `}>
            {title}
          </h3>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-6 px-4">
        <p className={`
          text-base text-slate-700 
          leading-relaxed
          transition-all duration-300 
          group-hover:text-slate-900
        `}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

function Advice({ analysis }: { analysis: any }) {
  const recommendations: string[] = analysis?.recommendations ?? [];
  const types: (keyof typeof ICONS)[] = [
    'default', 'positive', 'growth', 'relationship', 'goal', 'direction'
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec, index) => (
          <AdviceCard 
            key={index} 
            title={`Advice ${index + 1}`} 
            description={rec} 
            type={types[index % (types.length || 1)]} 
          />
        ))}
      </div>
    </div>
  );
}

export default Advice;