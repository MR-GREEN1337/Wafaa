import { ConsolidatedAnalysis } from '@prisma/client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LightbulbIcon } from 'lucide-react';

function Advice({ analysis }: { analysis: ConsolidatedAnalysis }) {
  const recommendations: string[] = analysis?.recommendations ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec, index) => (
          <AdviceCard 
            key={index} 
            title={`Recommendation ${index + 1}`} 
            description={rec} 
          />
        ))}
      </div>
    </div>
  );
}

interface AdviceCardProps {
  title: string;
  description: string;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ title, description }) => (
  <Card className="overflow-hidden bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300">
    <CardHeader className="bg-gradient-to-br from-primary/90 to-primary pb-8">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-white/20 rounded-lg">
          <LightbulbIcon className="w-5 h-5 text-white hover:animate-pulse" />
        </div>
        <CardTitle className="text-lg font-semibold text-white">
          {title}
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent className="pt-6">
      <p className="text-slate-600 leading-relaxed text-xl">
        {description}
      </p>
    </CardContent>
  </Card>
);

export default Advice;