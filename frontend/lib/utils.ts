export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getDaysUntilDeadline(deadlineStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);
  const diff = deadline.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getDeadlineLabel(deadlineStr: string): {
  label: string;
  color: string;
} {
  const days = getDaysUntilDeadline(deadlineStr);
  if (days < 0) return { label: 'Expired', color: 'text-red-600 bg-red-50' };
  if (days <= 7)
    return { label: `${days}d left`, color: 'text-red-600 bg-red-50' };
  if (days <= 21)
    return { label: `${days}d left`, color: 'text-amber-600 bg-amber-50' };
  return { label: `${days}d left`, color: 'text-green-700 bg-green-50' };
}

export function getMatchScoreMeta(score: number): {
  label: string;
  color: string;
  bg: string;
  border: string;
  ring: string;
} {
  if (score >= 80) {
    return {
      label: 'Strong Match',
      color: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-200',
      ring: 'ring-green-500',
    };
  }
  if (score >= 60) {
    return {
      label: 'Good Match',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      ring: 'ring-amber-500',
    };
  }
  return {
    label: 'Partial Match',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    ring: 'ring-red-500',
  };
}

export function cn(
  ...classes: (string | undefined | false | null)[]
): string {
  return classes.filter(Boolean).join(' ');
}
