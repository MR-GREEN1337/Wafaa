import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plan } from "@prisma/client";
import { Check, Loader2 } from "lucide-react";

type PlanCardProps = {
    plan: Plan;
    onSubscribe: (planId: string) => void;
    subscribing: boolean;
    currentPlanId: string;
  };
  
const PlanCard = ({ plan, onSubscribe, subscribing, currentPlanId }: PlanCardProps) => (
    <Card className={`
      transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg
      ${plan.name === "Pro" ? "border-primary" : ""} 
      relative overflow-hidden
      ${plan.id === currentPlanId ? "bg-muted" : "hover:bg-accent/5"}
    `}>
      <div className={`
        absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300
        ${plan.name === "Pro" ? "bg-primary/5" : "bg-accent/5"}
      `} />
      
      <CardHeader className="relative">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="transition-colors duration-200 hover:text-primary">
              {plan.name}
            </CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </div>
          {plan.name === "Pro" && (
            <Badge 
              variant="default"
              className="animate-pulse"
            >
              Popular
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="mb-6 transition-transform duration-200 hover:scale-110 origin-left">
          <span className="text-3xl font-bold">${plan.price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <ul className="space-y-3">
          {plan.features.map((feature: any) => (
            <li 
              key={feature} 
              className="flex items-center gap-2 transition-transform duration-200 hover:translate-x-2"
            >
              <Check className="h-4 w-4 text-primary transition-colors duration-200 group-hover:text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="relative">
        <Button
          className={`
            w-full transition-all duration-300
            ${plan.name === "Pro" 
              ? "bg-primary hover:bg-primary/90 hover:shadow-md" 
              : "hover:bg-primary hover:text-white"}
          `}
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
  
export default PlanCard;