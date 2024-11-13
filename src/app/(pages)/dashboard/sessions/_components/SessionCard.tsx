"use client"


import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Session } from "@prisma/client";
import {
  FileTextIcon,
  MessageCircleHeart,
  MoreVerticalIcon,
  PlayIcon,
  MessageCircle,
  TrashIcon,
} from "lucide-react";
import React from "react";
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

const statusColors = {
  [SessionStatus.ACTIVE]: "bg-rose-700 text-rose-9 00",
  [SessionStatus.COMPLETED]: "bg-primary",
  [SessionStatus.ARCHIVED]: "bg-primary",
};

function SessionCard({ session }: { session: Session }) {
  const isActive = session.status === "ACTIVE";
  return (
    <Card className="border border-separate shadow-sm rounded-lg overflow-hidden hover:shadow-md dark:shadow-primary/30 w-[500px]">
      <CardContent className="p-4 flex items-center justify-between h-[100px]">
        <div className="flex items-center justify-end space-x-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center bg-red-500 justify-center",
              statusColors[session.status as SessionStatus]
            )}
          >
            {isActive ? (
              <FileTextIcon className="h-5 w-5" />
            ) : (
              <MessageCircle className="h-5 w-5 text-white" />
            )}
          </div>
          <h3 className="text-base font-bold text-muted-foreground flex items-center">
            <Link
              href={`/dashboard/sessions/chat/${session.id}`}
              className="flex items-center hover:underline dark:text-white"
            >
              {session.name}
            </Link>
            {isActive && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Active
              </span>
            )}
          </h3>
        </div>
      <TooltipWrapper content={"start chatting"} side="bottom">
        <div className="flex flex-row">
          <Link
            href={`/dashboard/sessions/chat/${session.id}`}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "sm",
              }),
              "flex items-center gap-2"
            )}
          >
            <MessageCircleHeart size={16} />
            Access
          </Link>
          <SessionActions sessionName={session.name} sessionId={session.id}/>
        </div>
        </TooltipWrapper>
      </CardContent>
    </Card>
  );
}
function SessionActions({sessionName, sessionId}: {sessionName: string, sessionId: string}) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  return (
    <>
    <DeleteSessionDialog
    open={showDeleteDialog}
    setOpen={setShowDeleteDialog}
    sessionName={sessionName}
    sessionId={sessionId}
    />
    <DropdownMenu>
      <TooltipWrapper content={"More actions"} side="bottom">
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVerticalIcon size={18} />
          </Button>
        </DropdownMenuTrigger>
      </TooltipWrapper>
      <DropdownMenuContent>
        <p className="font-bold text-center text-muted-foreground">Actions</p>
        <DropdownMenuSeparator />
        <DropdownMenuItem
        className="text-destructive flex items-center gap-2"
        onSelect={() => setShowDeleteDialog((prev) => !prev)}
        >
          <TrashIcon size={16} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}
export default SessionCard;
