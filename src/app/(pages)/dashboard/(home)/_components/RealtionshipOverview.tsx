"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RelationshipOverview({ progress }) {
  // Process and validate the data
  const processedData = progress.map(entry => ({
    date: entry.date,
    sentiment: Number((entry.sentiment * 100).toFixed(2)),
    engagement: Number((entry.engagement * 100).toFixed(2)),
    progress: Number((entry.progress * 100).toFixed(2))
  })).filter(entry => 
    !isNaN(entry.sentiment) && 
    !isNaN(entry.engagement) && 
    !isNaN(entry.progress)
  );

  // Custom tooltip formatter
  const customFormatter = (value) => `${value.toFixed(1)}%`;
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Relationship Progress</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        {processedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={customFormatter}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sentiment" 
                name="Sentiment"
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                name="Engagement"
                stroke="#16a34a" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="progress" 
                name="Progress"
                stroke="#9333ea" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No progress data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}