"use client"

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Session } from "@prisma/client";
import {
  FileTextIcon,
  MessageCircleHeart,
  MoreVerticalIcon,
  ClockIcon,
  ActivityIcon,
  BarChart3Icon,
  TrashIcon,
} from "lucide-react";
import { SessionStatus } from "@/types/session";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TooltipWrapper from "@/components/global/TooltipWrapper";
import DeleteSessionDialog from "./DeleteSessionDialog";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  [SessionStatus.ACTIVE]: "bg-emerald-500 text-white",
  [SessionStatus.COMPLETED]: "bg-blue-500 text-white",
  [SessionStatus.ARCHIVED]: "bg-gray-500 text-white",
};

const statusMessages = {
  [SessionStatus.ACTIVE]: "Active Session",
  [SessionStatus.COMPLETED]: "Completed",
  [SessionStatus.ARCHIVED]: "Archived",
};

function SessionCard({ session }: { session: Session }) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const isActive = session.status === SessionStatus.ACTIVE;
  const timeAgo = formatDistanceToNow(new Date(session.createdAt), { addSuffix: true });

  return (
    <Card className="border border-separate shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 dark:shadow-primary/30 w-full max-w-3xl">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  statusColors[session.status as SessionStatus]
                )}
              >
                {isActive ? (
                  <ActivityIcon className="h-6 w-6" />
                ) : (
                  <FileTextIcon className="h-6 w-6" />
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold dark:text-white">
                  <Link
                    href={`/dashboard/sessions/chat/${session.id}`}
                    className="hover:underline"
                  >
                    {session.name}
                  </Link>
                </h3>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full",
                    statusColors[session.status as SessionStatus]
                  )}>
                    {statusMessages[session.status as SessionStatus]}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <ClockIcon size={14} />
                    {timeAgo}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/*Probably won't need this for now*/}
              {/*<TooltipWrapper content="View Analytics" side="bottom">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <BarChart3Icon size={16} />
                  Analytics
                </Button>
              </TooltipWrapper>*/}
              {session.status === SessionStatus.ACTIVE ? (
              <TooltipWrapper content="Start Chatting" side="bottom">
                <Link
                  href={`/dashboard/sessions/chat/${session.id}`}
                  className={cn(
                    buttonVariants({
                      variant: "default",
                      size: "sm",
                    }),
                    "flex items-center gap-2"
                  )}
                >
                  <MessageCircleHeart size={16} />
                  Continue Session
                </Link>
              </TooltipWrapper>
              ) : (
              <TooltipWrapper content="Session Completed" side="bottom">
                <Badge
                  className={cn(
                    buttonVariants({
                      variant: "default",
                      size: "sm",
                    }),
                    "flex items-center gap-2 !bg-gray-400"
                  )}
                >
                  <MessageCircleHeart size={16} />
                  Continue Session
                </Badge>
              </TooltipWrapper>
              )}

              <DropdownMenu>
                <TooltipWrapper content="More Actions" side="bottom">
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVerticalIcon size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipWrapper>
                <DropdownMenuContent>
                  <p className="font-bold text-center text-muted-foreground px-2 py-1">Actions</p>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive flex items-center gap-2"
                    onSelect={() => setShowDeleteDialog(true)}
                  >
                    <TrashIcon size={16} />
                    Delete Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="flex flex-col p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Session Type</span>
              <span className="font-medium">{session.sessionType}</span>
            </div>
            <div className="flex flex-col p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Last Activity</span>
              <span className="font-medium">{formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}</span>
            </div>
            <div className="flex flex-col p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Description</span>
              <span className="font-medium truncate">{session.description}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <DeleteSessionDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        sessionName={session.name}
        sessionId={session.id}
      />
    </Card>
  );
}

export default SessionCard;