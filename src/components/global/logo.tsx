import { cn } from "@/lib/utils";
import { MessageCircleHeart, SquareDashedMousePointer } from "lucide-react";
import Link from "next/link";
import React from "react";

function Logo({
  fontSize = "2xl",
  iconSize = 20,
}: {
  fontSize?: string;
  iconSize?: number;
}) {
  return (
    <Link
    href="/"
    className={cn(
        "text-2xl font-extrabold flex items-center gap-2",
        fontSize
    )}
    >
        <div className="rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 p-2">
            <MessageCircleHeart className="stroke-white"/>
        </div>
        <div>
            <span className="bg-gradient-to-r from-rose-500
            to-rose-600 bg-clip-text text-transparent">Wa</span>
            <span className="text-stone-700 dark:text-stone-399">faa</span>
        </div>
    </Link>
);
}

export default Logo;
