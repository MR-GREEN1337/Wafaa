"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, AlertCircle, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { plans } from "@/lib/constants";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  sessionLimit: number;
  relationshipLimit: number;
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: string;
  plan: Plan;
  usageRecords: Array<{
    type: "SESSION" | "RELATIONSHIP";
    quantity: number;
  }>;
}

const BillingPage = () => {
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/stripe");
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch subscription data",
          variant: "destructive",
        });
      }
    };

    Promise.all([fetchSubscription()]).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribing(true);
      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate subscription",
        variant: "destructive",
      });
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      const response = await fetch("/api/stripe/cancel", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to cancel subscription");

      toast({
        title: "Success",
        description: "Your subscription will be cancelled at the end of the billing period",
      });
      
      // Refresh subscription data
      const updatedData = await fetch("/api/stripe").then(res => res.json());
      setSubscription(updatedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  // If no subscription, show only the plans
  if (!subscription || !subscription.subscription) {
    return (
      <div className="flex-1 flex flex-col h-full p-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold">Choose Your Plan</h1>
            <p className="text-muted-foreground">
              Select a plan to get started with our services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSubscribe={handleSubscribe}
                subscribing={subscribing}
                currentPlanId={null}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sessionUsage = subscription.usageRecords?.find((r) => r.type === "SESSION")?.quantity ?? 0;
  const relationshipUsage = subscription.usageRecords?.find((r) => r.type === "RELATIONSHIP")?.quantity ?? 0;

  // Show current subscription and upgrade options
  return (
    <div className="flex-1 flex flex-col h-full p-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Your Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and usage
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Current Plan: {subscription.plan.name}</CardTitle>
                <CardDescription>
                  Active until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={cancelling || subscription.status === "CANCELED"}
              >
                {cancelling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                {subscription.status === "CANCELED" ? "Cancelled" : "Cancel Plan"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span>Sessions Used</span>
                <span>
                  {sessionUsage}/{subscription.plan.sessionLimit} this month
                </span>
              </div>
              <Progress
                value={(sessionUsage / subscription.plan.sessionLimit) * 100}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Relationships</span>
                <span>
                  {relationshipUsage}/{subscription.plan.relationshipLimit} total
                </span>
              </div>
              <Progress
                value={(relationshipUsage / subscription.plan.relationshipLimit) * 100}
              />
            </div>
          </CardContent>
        </Card>

        {subscription.status !== "CANCELED" && (
          <>
            <div>
              <h2 className="text-2xl font-bold mb-2">Upgrade Your Plan</h2>
              <p className="text-muted-foreground">
                Compare plans and choose the best option for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                  subscribing={subscribing}
                  currentPlanId={subscription.plan.id}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface PlanCardProps {
  plan: Plan;
  onSubscribe: (planId: string) => void;
  subscribing: boolean;
  currentPlanId: string | null;
}

const PlanCard = ({ plan, onSubscribe, subscribing, currentPlanId }: PlanCardProps) => (
  <Card className={`${plan.name === "Pro" ? "border-primary" : ""}`}>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle>{plan.name}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </div>
        {plan.name === "Pro" && <Badge variant="default">Popular</Badge>}
      </div>
    </CardHeader>
    <CardContent>
      <div className="mb-6">
        <span className="text-3xl font-bold">${plan.price}</span>
        <span className="text-muted-foreground">/month</span>
      </div>
      <ul className="space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button
        className="w-full"
        variant={plan.name === "Pro" ? "default" : "outline"}
        onClick={() => onSubscribe(plan.id)}
        disabled={subscribing || plan.id === currentPlanId}
      >
        {subscribing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {plan.id === currentPlanId ? "Current Plan" : "Select Plan"}
      </Button>
    </CardFooter>
  </Card>
);

const LoadingSkeleton = () => (
  <div className="flex-1 flex flex-col h-full p-8 space-y-8">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <Skeleton className="h-[200px] w-full" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-[400px]" />
      ))}
    </div>
  </div>
);

export default BillingPage;