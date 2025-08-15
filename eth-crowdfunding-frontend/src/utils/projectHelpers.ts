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

export function formatDeadline(timestamp: number, locale: string = 'en'): string {
  const date = new Date(timestamp * 1000); // Converter segundos para milissegundos

  // Verifique se a data é válida
  if (isNaN(date.getTime())) {
    return 'Data inválida'; // Ou uma string vazia, ou uma chave de tradução
  }

  // Opções para a formatação da data
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long', // 'numeric', '2-digit', 'short', 'long'
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit', // Se quiser incluir segundos
    hour12: false, // Formato 24h
  };

  // Cria um formatador de data internacionalizado
  const formatter = new Intl.DateTimeFormat(locale, options);

  // Retorna a data formatada
  return formatter.format(date);
}

export function isProjectCompleted(project: Project): boolean {
  return project.completed;
}

export function hasDeadlinePassed(project: Project): boolean {
  // Para fins de UI, usando Date.now(). Em ambientes de produção DApp,
  // considerar buscar block.timestamp da blockchain para precisão.
  return Date.now() / 1000 > project.deadline;
}

export function shouldShowDonateInput(project: Project): boolean {
  // Só deve mostrar o input de doação se:
  // 1. O prazo não passou
  // 2. O projeto não está completo
  // 3. O proprietário ainda não sacou os fundos (porque se sacou, não há mais como doar para ele)
  return !hasDeadlinePassed(project) && !project.completed && !project.withdrawn;
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