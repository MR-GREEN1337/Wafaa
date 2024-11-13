import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Sparkles, Users, Quote } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SidebarDecoration = () => {
  return (
    <div className="mt-auto p-4 space-y-4">
      {/* Inspirational Quote Card */}
      <Card className="bg-rose-50/30 dark:bg-rose-900/10 border-rose-200/50">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Quote size={16} className="text-rose-500" />
            <span className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              Daily Insight
            </span>
          </div>
          <p className="text-sm italic text-muted-foreground">
            "Every relationship is a journey of growth and understanding."
          </p>
        </CardContent>
      </Card>

      {/* Stats Preview */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col items-center p-3 rounded-lg bg-rose-50/20 dark:bg-rose-900/5">
          <Users size={18} className="text-rose-600 mb-1" />
          <span className="text-xs text-muted-foreground">2+ Couples</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-lg bg-rose-50/20 dark:bg-rose-900/5">
          <Heart size={18} className="text-rose-600 mb-1" />
          <span className="text-xs text-muted-foreground">95% Success</span>
        </div>
      </div>

      {/* Premium Badge */}
      <Alert className="bg-gradient-to-r from-rose-50/30 to-pink-50/30 dark:from-rose-900/10 dark:to-pink-900/10 border-rose-200/50">
        <Sparkles className="h-4 w-4 text-rose-500" />
        <AlertDescription className="text-xs ml-2">
          Access premium relationship insights
        </AlertDescription>
      </Alert>

      {/* Bottom Branding */}
      <div className="flex items-center justify-center gap-2 pt-2 border-t border-rose-100/20">
        <Heart size={12} className="text-rose-400" />
        <span className="text-xs text-muted-foreground font-semibold">
          Wafaa™
        </span>
      </div>
    </div>
  );
};

export default SidebarDecoration;