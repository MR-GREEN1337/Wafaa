import { CommunicationPattern, RelationshipDynamics } from "@/app/(pages)/dashboard/relationships/[relationshipId]/_components/RelationshipReport";

// Types can be moved to a separate types.ts file
export interface Analysis {
    id: string;
    relationshipId: string;
    type: string;
    content: AnalysisContent;
    createdAt: Date;
    updatedAt: Date;
  }
  
export interface AnalysisContent {
sentiment: number;
patterns: CommunicationPattern[];
topics: string[];
dynamics: RelationshipDynamics;
recommendations: string[];
weekly_sentiment?: Array<{ week: number; sentiment: number; }>;
}
  