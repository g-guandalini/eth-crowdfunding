// src/utils/projectHelpers.ts
import type { Project } from '@/types/project'; // Ajuste o caminho se necessário

export function projectProgress(project: Project): number {
  const goal = parseFloat(project.goal);
  const amountRaised = parseFloat(project.amountRaised);
  if (isNaN(goal) || isNaN(amountRaised) || goal <= 0) return 0;
  return Math.min((amountRaised / goal) * 100, 100);
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatDeadline(timestamp: number): string {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

export function isProjectCompleted(project: Project): boolean {
  return project.completed || parseFloat(project.amountRaised) >= parseFloat(project.goal);
}

export function hasDeadlinePassed(project: Project): boolean {
  return Date.now() / 1000 >= project.deadline;
}

export function shouldShowDonateInput(project: Project): boolean {
  return !isProjectCompleted(project) && !hasDeadlinePassed(project) && !project.refunded;
}

export function getProjectBorderClass(project: Project): string {
  if (isProjectCompleted(project)) {
    return 'border-green-500';
  }
  if (hasDeadlinePassed(project) && !isProjectCompleted(project)) {
    return 'border-orange-500';
  }
  return 'border-gray-100';
}