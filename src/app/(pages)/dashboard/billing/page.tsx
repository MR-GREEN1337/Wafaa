"use client"

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, AlertCircle, Loader2, X, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { plans } from "@/lib/constants";
import { useSubscription } from "@/hooks/use-subscription";
import CreditTransactions from "./_components/CreditsTransaction";
import PlanCard from "./_components/PlanCard";

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
  const [subscribing, setSubscribing] = useState<{ [key: string]: boolean }>({});
  const [subscription, setSubscription] = useState<Subscription | null>();
  const { toast } = useToast();
  const { cancelSubscription, reactivateSubscription, cancelling, reactivating } = useSubscription();

  const fetchSubscriptionData = async () => {
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

  useEffect(() => {
    console.log("User subscription", subscription);
    Promise.all([fetchSubscriptionData()]).finally(() => setLoading(false));
  }, []);
  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribing((prev) => ({ ...prev, [planId]: true }));
      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setSubscribing((prev) => ({ ...prev, [planId]: false }));
    }
  };

  const handleCancelSubscription = async () => {
    const result = await cancelSubscription();
    if (result) {
      await fetchSubscriptionData();
    }
  };

  const handleReactivateSubscription = async () => {
    const result = await reactivateSubscription();
    if (result) {
      await fetchSubscriptionData();
    }
  };

  if (loading) return <LoadingSkeleton />;
  
  if (!subscription || !subscription.plan) {
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
                plan={{
                  ...plan,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  features: JSON.stringify(plan.features),
                }}
                onSubscribe={() => handleSubscribe(plan.id)}
                subscribing={subscribing[plan.id] || false}
                currentPlanId={subscription?.plan?.id || ""}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sessionUsage = subscription.usageRecords?.find((r) => r.type === "SESSION")?.quantity ?? 0;
  const relationshipUsage = subscription.usageRecords?.find((r) => r.type === "RELATIONSHIP")?.quantity ?? 0;

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
              {subscription.status === "CANCELED" ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={reactivating}
                    >
                      {reactivating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Reactivate Plan
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reactivate Subscription</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reactivate your subscription? You will be billed at the start of the next billing period.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReactivateSubscription}>
                        Reactivate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={cancelling}
                    >
                      {cancelling ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      Cancel Plan
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your subscription? Your plan will remain active until the end of the current billing period.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        className="variants-destructive"
                        onClick={handleCancelSubscription}
                      >
                        Cancel Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
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

        <div className="mt-8">
          <CreditTransactions />
        </div>

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
                  plan={{
                    ...plan,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  }}
                  onSubscribe={handleSubscribe}
                  subscribing={subscribing[plan.id] || false}
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
// PlanCard and LoadingSkeleton components remain the same

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