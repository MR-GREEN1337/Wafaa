"use client"

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Legend, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SentimentDataPoint {
  name: string;
  sentiment: number;
}


export const SentimentChart = ({ data }: { data: SentimentDataPoint[] }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} width={500} height={300} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name"
            tick={{ fill: '#888888' }}
          />
          <YAxis
            tick={{ fill: '#888888' }}
            domain={[0, 100]}
            label={{ 
              value: 'Sentiment Score (%)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#888888' }
            }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Sentiment']}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="sentiment"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ fill: '#8884d8' }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
