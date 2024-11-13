"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  HandHeart,
  MessageCircleHeart,
  MoreVerticalIcon,
  TrashIcon,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  ChartNoAxesCombined,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TooltipWrapper from "@/components/global/TooltipWrapper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteRelationshipDialog from "./DeleteRelationshipDialog";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type Relationship = {
  id: string;
  name: string;
  partner1Id: string;
  partner2Id: string;
  status: string;
  partner1?: {
    name: string;
    email: string;
  };
  partner2?: {
    name: string;
    email: string;
  };
  createdAt: Date;
  _count?: {
    sessions: number;
  };
};

const statusConfig = {
  active: {
    color: "bg-emerald-500/10 text-emerald-500",
    icon: CheckCircle2,
    label: "Active",
  },
  pending: {
    color: "bg-yellow-500/10 text-yellow-500",
    icon: Clock,
    label: "Pending",
  },
  paused: {
    color: "bg-orange-500/10 text-orange-500",
    icon: PauseCircle,
    label: "Paused",
  },
  declined: {
    color: "bg-red-500/10 text-red-500",
    icon: AlertCircle,
    label: "Declined",
  },
};

function RelationshipCard({ relationship }: { relationship: Relationship }) {
  const StatusIcon =
    statusConfig[relationship.status as keyof typeof statusConfig]?.icon ||
    AlertCircle;
  const statusColor =
    statusConfig[relationship.status as keyof typeof statusConfig]?.color ||
    "bg-gray-500/10 text-gray-500";
  const statusLabel =
    statusConfig[relationship.status as keyof typeof statusConfig]?.label ||
    "Unknown";

  return (
    <Card className="border border-separate shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 dark:shadow-primary/30 w-[500px]">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full flex items-center bg-primary/10 justify-center">
                <HandHeart size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold dark:text-white">
                    {relationship.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={cn("gap-1 px-2 py-0.5", statusColor)}
                  >
                    <StatusIcon size={14} />
                    <span>{statusLabel}</span>
                  </Badge>
                  {relationship._count?.sessions && (
                    <Badge variant="secondary" className="gap-1">
                      <Users size={14} />
                      {relationship._count.sessions} Sessions
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TooltipWrapper content="Access reports" side="bottom">
                <Link
                  href={`/dashboard/relationships/${relationship.id}`}
                  className={cn(
                    buttonVariants({
                      variant: "default",
                      size: "sm",
                    }),
                    "flex items-center gap-2"
                  )}
                >
                  <ChartNoAxesCombined size={16} />
                  Reports
                </Link>
              </TooltipWrapper>
              <RelationshipsActions
                relationshipName={relationship.name}
                relationshipId={relationship.id}
              />
            </div>
          </div>

          {/* Partners Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Partner 1</p>
              <p className="font-medium">{relationship.partner1?.name}</p>
              <p className="text-muted-foreground text-xs">
                {relationship.partner1?.email}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Partner 2</p>
              <p className="font-medium">{relationship.partner2?.name}</p>
              <p className="text-muted-foreground text-xs">
                {relationship.partner2?.email}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <p>
              Created{" "}
              {isNaN(new Date(relationship.createdAt).getTime())
                ? "Invalid Date"
                : format(new Date(relationship.createdAt), "MMM d, yyyy")}
            </p>
            <p className="flex items-center gap-1">
              <Users size={14} />
              ID: {relationship.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RelationshipsActions({
  relationshipName,
  relationshipId,
}: {
  relationshipName: string;
  relationshipId: string;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  return (
    <>
      <DeleteRelationshipDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        relationshipName={relationshipName}
        relationshipId={relationshipId}
      />
      <DropdownMenu>
        <TooltipWrapper content="More actions" side="bottom">
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVerticalIcon size={18} />
            </Button>
          </DropdownMenuTrigger>
        </TooltipWrapper>
        <DropdownMenuContent align="end" className="w-48">
          <p className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
            Relationship Actions
          </p>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive flex items-center gap-2"
            onSelect={() => setShowDeleteDialog(true)}
          >
            <TrashIcon size={16} />
            Delete Relationship
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export default RelationshipCard;
