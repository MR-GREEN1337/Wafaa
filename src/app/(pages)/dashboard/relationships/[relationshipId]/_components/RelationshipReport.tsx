"use client";

import React, { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  BarChart3,
  Heart,
  MessageCircle,
  RefreshCcw,
} from "lucide-react";
import { SentimentChart } from "@/components/global/sentimentChart";

// Types and Interfaces
export interface CommunicationPattern {
  pattern: string;
  frequency: "low" | "medium" | "high";
  impact: "negative" | "neutral" | "positive";
  sentiment: number;
}

export interface RelationshipDynamics {
  strengths: string[];
  areas_for_improvement: string[];
}

interface AnalysisContent {
  sentiment: number;
  patterns: CommunicationPattern[];
  topics: string[];
  dynamics: RelationshipDynamics;
  recommendations: string[];
  weekly_sentiment?: Array<{
    week: number;
    sentiment: number;
  }>;
}

interface Analysis {
  id: string;
  relationshipId: string;
  type: string;
  content: AnalysisContent;
  createdAt: Date;
  updatedAt: Date;
}

interface SentimentDataPoint {
  name: string;
  sentiment: number;
}

interface RelationshipReportProps {
  analysis: Analysis;
}

export function RelationshipReport({
  analysis,
}: RelationshipReportProps) {
  
  if (!analysis) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Unable to generate relationship analysis. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const sentimentData: SentimentDataPoint[] = analysis.content.patterns ? (analysis.content.patterns.map(
    (pattern, index) => ({
      name: `Week ${index + 1}`,
      sentiment: pattern.sentiment * 100,
    })
  )) : [];

  //console.log(analysis.content.patterns[0]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Sentiment
            </CardTitle>
            <Heart className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analysis.content.sentiment * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Positive communication tone
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Key Topics</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.content.topics && ( analysis.content.topics.slice(0, 3).map((topic, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                >
                  {topic}
                </span>
              )))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Communication Patterns
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysis.content.patterns ? analysis.content.patterns.length: 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Distinct patterns identified
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sentiment Over Time</CardTitle>
          <CardDescription>
            Weekly relationship sentiment analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <SentimentChart data={sentimentData} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            AI-generated insights for relationship improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {analysis.content.recommendations && (analysis.content.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start space-x-2">
                <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-violet-500" />
                <p className="text-sm text-muted-foreground">{rec}</p>
              </li>
            )))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default RelationshipReport;
