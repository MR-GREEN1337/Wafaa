import { auth } from '@clerk/nextjs/server';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getOrGenerateAnalysis } from '@/actions/reports/getOrGenerateReport';
import ConsolidatedReportClient from './_components/ConsolidatedReportClient'; // Import new client component

export default async function ReportsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Unable to authenticate user. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const analysis = await getOrGenerateAnalysis(userId);

  return (
    <ConsolidatedReportClient analysis={analysis} userId={userId} />
  );
}
