"use client"

import React from "react";
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

function RelationshipCard({ relationship, currentUserId }: { relationship: Relationship; currentUserId: string }) {
  const StatusIcon =
    statusConfig[relationship.status as keyof typeof statusConfig]?.icon ||
    AlertCircle;
  const statusColor =
    statusConfig[relationship.status as keyof typeof statusConfig]?.color ||
    "bg-gray-500/10 text-gray-500";
  const statusLabel =
    statusConfig[relationship.status as keyof typeof statusConfig]?.label ||
    "Unknown";

  // Show accept button only if:
  // 1. Status is pending AND
  // 2. Current user is partner2 (recipient) AND
  // 3. Current user is not partner1 (sender)
  const showAcceptButton = 
    relationship.status === "pending" && 
    relationship.partner2Id === currentUserId &&
    relationship.partner1Id !== currentUserId;

  return (
    <Card className="border border-separate shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 dark:shadow-primary/30 w-full max-w-[500px]">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center bg-primary/10 justify-center">
                <HandHeart size={20} className="text-primary sm:size-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold dark:text-white">
                  {relationship.name || "Unnamed Relationship"}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
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

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {showAcceptButton ? (
                <Link
                  href={`/accept-invite/${relationship.id}`}
                  className={cn(
                    buttonVariants({
                      variant: "default",
                      size: "sm",
                    }),
                    "flex items-center gap-2 w-full sm:w-auto justify-center"
                  )}
                >
                  <CheckCircle2 size={16} />
                  Accept Invitation
                </Link>
              ) : (
                <TooltipWrapper content="Access reports" side="bottom">
                  <Link
                    href={`/dashboard/relationships/${relationship.id}`}
                    className={cn(
                      buttonVariants({
                        variant: "default",
                        size: "sm",
                      }),
                      "flex items-center gap-2 w-full sm:w-auto justify-center"
                    )}
                  >
                    <Button
                      disabled={relationship.status !== "active"}
                      className="max-w-md bg-transparent hover:bg-transparent"
                    >
                      <ChartNoAxesCombined size={16} />
                      Reports
                    </Button>
                  </Link>
                </TooltipWrapper>
              )}
              <RelationshipsActions
                relationshipName={relationship.name}
                relationshipId={relationship.id}
              />
            </div>
          </div>

          {/* Partners Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Partner 1</p>
              <p className="font-medium">{relationship.partner1?.name || "N/A"}</p>
              <p className="text-muted-foreground text-xs break-all">
                {relationship.partner1?.email}
              </p>
            </div>
            <div className="border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-4">
              <p className="text-muted-foreground mb-1">Partner 2</p>
              <p className="font-medium">{relationship.partner2?.name || "N/A"}</p>
              <p className="text-muted-foreground text-xs break-all">
                {relationship.partner2?.email}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-muted-foreground gap-2">
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