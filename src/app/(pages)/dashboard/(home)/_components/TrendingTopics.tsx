"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';

function TopicCard({ topic, frequency, sentiment }) {
  const getSentimentColor = (score) => {
    if (score >= 0.7) return 'text-green-500';
    if (score >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSentimentLabel = (score) => {
    if (score >= 0.7) return 'Positive';
    if (score >= 0.4) return 'Neutral';
    return 'Needs Attention';
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <Badge variant="outline" className="h-10 w-10 rounded-full flex items-center justify-center">
            {frequency}
          </Badge>
        </div>
        <div>
          <h4 className="font-medium">{topic}</h4>
          <div className="flex items-center mt-1">
            <span className={`text-sm ${getSentimentColor(sentiment)}`}>
              {getSentimentLabel(sentiment)}
            </span>
          </div>
        </div>
      </div>
      <Badge variant="outline">
        {(sentiment * 100).toFixed(0)}%
      </Badge>
    </div>
  );
}

export default function TrendingTopics({ topics = [] }) {
  // Ensure topics is an array and has valid data
  const validTopics = Array.isArray(topics) ? topics.filter(topic => 
    topic && 
    typeof topic.topic === 'string' &&
    typeof topic.frequency === 'number' &&
    typeof topic.sentiment === 'number'
  ) : [];

  // Calculate overall sentiment
  const averageSentiment = validTopics.length === 0 ? 0 : 
    validTopics.reduce((acc, topic) => acc + topic.sentiment, 0) / validTopics.length;

  // Transform data for the chart
  const chartData = validTopics.map(topic => ({
    name: topic.topic,
    frequency: topic.frequency,
    sentiment: Math.round(topic.sentiment * 100)
  }));

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Trending Topics
            </CardTitle>
            <CardDescription>
              Most discussed themes and their emotional impact
            </CardDescription>
          </div>
          <Badge variant={averageSentiment >= 0.7 ? "outline" : "destructive"}>
            {(averageSentiment * 100).toFixed(0)}% Overall Sentiment
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {validTopics.length > 0 ? (
          <>
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    scale="point"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'frequency' ? `${value} mentions` : `${value}%`,
                      name === 'frequency' ? 'Frequency' : 'Sentiment'
                    ]}
                  />
                  <Bar dataKey="frequency" fill="#2563eb" opacity={0.8} />
                  <Bar dataKey="sentiment" fill="#16a34a" opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {validTopics.map((topic) => (
                  <TopicCard
                    key={topic.topic}
                    topic={topic.topic}
                    frequency={topic.frequency}
                    sentiment={topic.sentiment}
                  />
                ))}
              </div>
            </ScrollArea>

            {validTopics.some(topic => topic.sentiment < 0.4) && (
              <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mt-4">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-500">
                  Some topics show low sentiment scores. Consider scheduling focused sessions on these areas.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No trending topics available
          </div>
        )}
      </CardContent>
    </Card>
  );
}