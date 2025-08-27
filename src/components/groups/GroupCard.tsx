'use client';

import Link from 'next/link';
import { Group } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Receipt, Calendar } from 'lucide-react';

interface GroupCardProps {
  group: Group;
  currentUserId: string;
}

export function GroupCard({ group, currentUserId }: GroupCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const currentUser = group.members.find(m => m.userId === currentUserId);
  const totalExpenses = group.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{group.name}</CardTitle>
              {group.description && (
                <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
              )}
            </div>
            {currentUser && currentUser.balance !== 0 && (
              <Badge variant={currentUser.balance > 0 ? 'default' : 'destructive'}>
                {currentUser.balance > 0 ? '+' : ''}{formatCurrency(currentUser.balance)}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{group.members.length}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Receipt className="w-4 h-4" />
                <span>{group.expenses.length}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(group.createdAt)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatCurrency(totalExpenses)}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              {group.members.slice(0, 4).map((member, index) => (
                <Avatar key={member.userId || index} className="inline-block h-8 w-8 ring-2 ring-background">
                  <AvatarFallback className="text-xs">
                    {member.displayName?.charAt(0) || member.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {group.members.length > 4 && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium ring-2 ring-background">
                  +{group.members.length - 4}
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {group.members.slice(0, 2).map(m => m.displayName).join(', ')}
              {group.members.length > 2 && ` +${group.members.length - 2} more`}
            </div>
          </div>

          {currentUser && (
            <div className="pt-2 border-t">
              <div className="text-sm">
                Your balance: 
                <span className={`ml-1 font-medium ${
                  currentUser.balance > 0 ? 'text-green-600' : 
                  currentUser.balance < 0 ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {currentUser.balance === 0 
                    ? 'Settled' 
                    : (currentUser.balance > 0 ? 'You are owed ' : 'You owe ') + formatCurrency(Math.abs(currentUser.balance))
                  }
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}