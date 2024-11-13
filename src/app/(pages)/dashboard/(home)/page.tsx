import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardMetrics from './_components/DashboardMetrics';
import RelationshipOverview from './_components/RealtionshipOverview';
import LatestSessions from './_components/LatestSessions';
import TrendingTopics from './_components/TrendingTopics';
import { DashboardSkeleton } from './_components/DashboardSkeleton';
import { getLatestSessions, getRelationshipProgress, getRelationshipStats, getTrendingTopics } from '@/actions/relationships/getRelationshipsStats';


export default async function Home() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const stats = await getRelationshipStats(userId);
  const progress = await getRelationshipProgress(userId);
  const sessions = await getLatestSessions(userId);
  const topics = await getTrendingTopics(userId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Relationship Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights and progress tracking for your relationships
          </p>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        {/* Key Metrics */}
        <DashboardMetrics 
          stats={stats}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Relationship Progress Chart */}
          <RelationshipOverview 
            progress={progress}
          />

          {/* Latest Sessions with AI Summaries */}
          <LatestSessions 
            sessions={sessions}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Trending Topics & Sentiment Analysis */}
          <TrendingTopics 
            topics={topics}
          />

          {/* AI-Powered Relationship Insights */}
          {/*<AIInsights 
            stats={stats}
            topics={topics}
          />*/}
        </div>
      </Suspense>
    </div>
  );
}