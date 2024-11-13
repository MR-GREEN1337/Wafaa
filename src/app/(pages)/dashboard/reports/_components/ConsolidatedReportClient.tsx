"use client";

import { useState, useCallback } from 'react';
import ConsolidatedReport from './ConsolidatedReport';
import { refreshAnalysis } from '@/actions/reports/getOrGenerateReport';

export default function ConsolidatedReportClient({ analysis, userId }: { analysis: any, userId: string }) {
  const [currentAnalysis, setCurrentAnalysis] = useState(analysis);

  const handleRefreshReport = useCallback(async () => {
    const refreshedAnalysis = await refreshAnalysis(userId);
    setCurrentAnalysis(refreshedAnalysis);
  }, [userId]);

  return (
    <div>
      <ConsolidatedReport 
        analysis={currentAnalysis} 
        onRefresh={handleRefreshReport}
      />
    </div>
  );
}
