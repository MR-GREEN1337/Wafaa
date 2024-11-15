import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function LatestSessions({ sessions }: { sessions: any }) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Latest Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {sessions.map((session: any) => (
              <div
                key={session.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{session.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {session.relationship.name}
                    </p>
                  </div>
                  <Badge
                    variant={
                      session.status === "completed"
                        ? "default"
                        : session.status === "active"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {session.status}
                  </Badge>
                </div>
                <p className="text-sm mb-3">{session.description}</p>
                {session.messages[0] && (
                  <div className="text-sm text-muted-foreground mb-3">
                    <strong>Latest:</strong>{" "}
                    {session.messages[0].content.slice(0, 100)}...
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                  {session.status === "active" && (
                    <Link href={`/dashboard/sessions/chat/${session.id}`}>
                      <Button variant="outline" size="sm">
                        Continue Session
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
