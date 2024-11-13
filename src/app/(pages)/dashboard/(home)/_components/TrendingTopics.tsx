"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, MessageSquare } from 'lucide-react';

const TopicCard = ({ topic, frequency, sentiment }: { 
  topic: string; 
  frequency: number;
  sentiment: number;
}) => {
  // Helper function to determine sentiment color
  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'text-green-500';
    if (score >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Helper function to get sentiment label
  const getSentimentLabel = (score: number) => {
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
      <div className="flex items-center space-x-2">
        <Badge variant={sentiment >= 0.7 ? "outline" : sentiment >= 0.4 ? "outline" : "outline"}>
          {(sentiment * 100).toFixed(0)}%
        </Badge>
      </div>
    </div>
  );
};

export default function TrendingTopics({
  topics
}: {
  topics: any
}) {
  // Transform data for the chart
  const chartData = topics.map((topic: any) => ({
    name: topic.topic,
    frequency: topic.frequency,
    sentiment: parseFloat((topic.sentiment * 100).toFixed(0))
  }));

  // Calculate overall sentiment
  let averageSentiment = topics.reduce((acc: number, topic: any) => 
    acc + topic.sentiment, 0) / topics.length;
  averageSentiment = averageSentiment || 0; // Fallback to 0 if NaN

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
        {/* Topic Distribution Chart */}
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
                formatter={(value: number, name: string) => [
                  name === 'frequency' ? `${value} mentions` : `${value}% sentiment`,
                  name === 'frequency' ? 'Frequency' : 'Sentiment'
                ]}
              />
              <Bar dataKey="frequency" fill="#2563eb" opacity={0.8} />
              <Bar dataKey="sentiment" fill="#16a34a" opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Topics List */}
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {topics.map((topic: any, index: number) => (
              <TopicCard
                key={topic.topic}
                topic={topic.topic}
                frequency={topic.frequency}
                sentiment={topic.sentiment}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Warning for Low Sentiment Topics */}
        {topics.some((topic: any) => topic.sentiment < 0.4) && (
          <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mt-4">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-500">
              Some topics show low sentiment scores. Consider scheduling focused sessions on these areas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}