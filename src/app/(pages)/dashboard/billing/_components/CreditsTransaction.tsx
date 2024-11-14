"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MinusCircle, RefreshCcw, Gift, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreditTransaction {
  id: string;
  amount: number;
  type: 'MONTHLY_REFILL' | 'USAGE' | 'BONUS' | 'ADJUSTMENT' | 'EXPIRATION';
  description: string;
  metadata: any;
  createdAt: string;
  subscription: {
    plan: {
      name: string;
    };
  };
}

interface Analytics {
  totalEarned: number;
  totalSpent: number;
  breakdown: {
    type: string;
    _sum: {
      amount: number;
    };
    _count: number;
  }[];
}

const CreditTransactions = () => {
  const [filter, setFilter] = useState<string>('ALL');
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, analyticsRes] = await Promise.all([
          fetch('/api/credits'),
          fetch('/api/credits/analytics')
        ]);

        if (!transactionsRes.ok || !analyticsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const transactionsData = await transactionsRes.json();
        const analyticsData = await analyticsRes.json();

        setTransactions(transactionsData);
        setAnalytics(analyticsData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load credit transactions',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'MONTHLY_REFILL':
        return <RefreshCcw className="h-4 w-4" />;
      case 'USAGE':
        return <MinusCircle className="h-4 w-4" />;
      case 'BONUS':
        return <Gift className="h-4 w-4" />;
      case 'ADJUSTMENT':
        return <AlertCircle className="h-4 w-4" />;
      case 'EXPIRATION':
        return <MinusCircle className="h-4 w-4" />;
      default:
        return <PlusCircle className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'MONTHLY_REFILL':
        return 'bg-blue-100 text-blue-800';
      case 'USAGE':
        return 'bg-red-100 text-red-800';
      case 'BONUS':
        return 'bg-green-100 text-green-800';
      case 'ADJUSTMENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRATION':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(
    t => filter === 'ALL' || t.type === filter
  );

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                +{analytics.totalEarned}
              </div>
              <div className="text-sm text-gray-500">Total Credits Earned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">
                -{analytics.totalSpent}
              </div>
              <div className="text-sm text-gray-500">Total Credits Spent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {analytics.totalEarned - analytics.totalSpent}
              </div>
              <div className="text-sm text-gray-500">Current Balance</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions List */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Credit Transactions</CardTitle>
          <Select 
            value={filter} 
            onValueChange={setFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Transactions</SelectItem>
              <SelectItem value="MONTHLY_REFILL">Monthly Refills</SelectItem>
              <SelectItem value="USAGE">Usage</SelectItem>
              <SelectItem value="BONUS">Bonuses</SelectItem>
              <SelectItem value="ADJUSTMENT">Adjustments</SelectItem>
              <SelectItem value="EXPIRATION">Expirations</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <h4 className="font-medium">{transaction.description}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline"
                    className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}
                  >
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                  </Badge>
                  <Badge variant="secondary">
                    {transaction.type}
                  </Badge>
                </div>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No transactions found for the selected filter.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditTransactions;