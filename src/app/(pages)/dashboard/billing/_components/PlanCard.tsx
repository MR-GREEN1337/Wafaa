import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";

// Define the type for the plan
type Plan = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  sessionLimit: number;
  relationshipLimit: number;
  monthlyCredits: number;
};

type PlanCardProps = {
  plan: Plan;
  onSubscribe: (planId: string) => void;
  subscribing?: { [key: string]: boolean };
  currentPlanId?: string;
};

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onSubscribe,
  subscribing = {},
  currentPlanId = ''
}) => {
  const isCurrentPlan = plan.id === currentPlanId;
  const isPro = plan.name === "Counselor";
  const isSubscribing = subscribing[plan.id] || false;

  const handleSubscribe = () => {
    if (!isCurrentPlan && !isSubscribing) {
      onSubscribe(plan.id);
    }
  };

  return (
    <Card
      className={`
        flex flex-col h-full
        transform transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-xl
        ${isPro ? 'border-primary border-2' : ''}
        ${isCurrentPlan ? 'bg-muted/30' : ''}
      `}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle
              className={`
                text-2xl font-bold
                ${isPro ? 'text-primary' : ''}
              `}
            >
              {plan.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {plan.description}
            </CardDescription>
          </div>
          {isPro && (
            <Badge
              variant="default"
              className="animate-pulse ml-2"
            >
              Popular
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="my-4">
          <div className="flex items-baseline">
            <span className="text-4xl font-extrabold text-foreground mr-2">
              ${plan.price}
            </span>
            <span className="text-muted-foreground">
              /month
            </span>
          </div>
        </div>

        <ul className="space-y-3 mt-4">
          {plan.features.map((feature, index) => (
            <li
              key={index}
              className="flex items-center space-x-2 text-sm"
            >
              <Check
                className={`
                  h-5 w-5
                  ${isPro ? 'text-primary' : 'text-green-500'}
                `}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="mt-auto">
        <Button
          className="w-full"
          variant={isPro ? "default" : "outline"}
          onClick={handleSubscribe}
          disabled={isCurrentPlan || isSubscribing}
        >
          {isSubscribing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isCurrentPlan ? "Current Plan" : "Select Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;