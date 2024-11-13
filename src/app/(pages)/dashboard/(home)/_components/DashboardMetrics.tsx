import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageSquare, TrendingUp, Heart } from "lucide-react";

export default function DashboardMetrics({ 
  stats 
}: { 
  stats: any
}) {
  
  const metrics = [
    {
      label: "Active Relationships",
      value: stats.activeRelationships,
      change: "+12%",
      icon: Users,
    },
    {
      label: "Session Completion",
      value: `${Math.round(stats.completionRate)}%`,
      change: "+5%",
      icon: MessageSquare,
    },
    {
      label: "Average Sentiment",
      value: stats.averageSentiment.toFixed(1),
      change: "+3.2",
      icon: TrendingUp,
    },
    {
      label: "Relationship Score",
      value: `${Math.round((stats.averageSentiment + stats.completionRate) / 2)}`,
      change: "+8%",
      icon: Heart,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <metric.icon className="h-8 w-8 text-primary opacity-75" />
              <span className={`text-sm ${
                metric.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
              }`}>
                {metric.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{metric.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
