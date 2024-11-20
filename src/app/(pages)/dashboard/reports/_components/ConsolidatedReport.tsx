"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Heart, MessageCircle, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';

interface ConsolidatedAnalysis {
  overallSentiment: number;
  totalInteractions: number;
  uniquePartners: number;
  commonPatterns: Array<{
    pattern: string;
    frequency: number;
    impact: 'negative' | 'neutral' | 'positive';
  }>;
  topTopics: Array<{
    topic: string;
    frequency: number;
  }>;
  sentimentTrend: Array<{
    period: string;
    sentiment: number;
  }>;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

interface ConsolidatedReportProps {
  analysis: ConsolidatedAnalysis;
  onRefresh: () => Promise<void>;
}

export default function ConsolidatedReport({ analysis, onRefresh }: ConsolidatedReportProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!analysis) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Unable to generate consolidated analysis. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  console.log("Analysis data:", analysis);
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Relationship Analysis Dashboard</h1>
          <p className="text-muted-foreground">
            A comprehensive analysis of all your relationship interactions
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Analysis'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Sentiment</CardTitle>
            <Heart className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analysis.overallSentiment)}%
            </div>
            <p className="text-xs text-muted-foreground">Average positivity score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.totalInteractions}</div>
            <p className="text-xs text-muted-foreground">Across all relationships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.uniquePartners}</div>
            <p className="text-xs text-muted-foreground">Unique relationships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communication Patterns</CardTitle>
            <TrendingUp className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.commonPatterns?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Identified patterns</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Trends</CardTitle>
            <CardDescription>How your relationship dynamics have evolved over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analysis.sentimentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Patterns</CardTitle>
            <CardDescription>Frequently observed communication patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.commonPatterns && analysis.commonPatterns.map((pattern, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      pattern.impact === 'positive' ? 'bg-green-500' :
                      pattern.impact === 'negative' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                    <span className="text-sm">{pattern.pattern}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {pattern.frequency}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cross-Analysis Insights</CardTitle>
          <CardDescription>Understanding perspectives and finding common ground</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Your Perspective</h3>
              <ul className="space-y-2">
                {analysis.improvements && analysis.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Partner's Perspective</h3>
              <ul className="space-y-2">
                {analysis.strengths && analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Actionable Solutions</h3>
              <ul className="space-y-2">
                {analysis.recommendations && analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}