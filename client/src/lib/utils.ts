import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: Date | string | null): string {
  if (!date) return 'N/A';
  
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-tactical-green';
    case 'maintenance':
      return 'text-tactical-orange';
    case 'offline':
      return 'text-tactical-red';
    default:
      return 'text-tactical-slate';
  }
}

export function getStatusDotColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-tactical-green';
    case 'maintenance':
      return 'bg-tactical-orange';
    case 'offline':
      return 'bg-tactical-red';
    default:
      return 'bg-tactical-slate';
  }
}
