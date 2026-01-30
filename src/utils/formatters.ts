import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Formatear moneda
export function formatCurrency(
  amount: number,
  currency: 'COP' | 'USD' = 'COP'
): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'COP' ? 0 : 2,
    maximumFractionDigits: currency === 'COP' ? 0 : 2,
  }).format(amount);
}

// Formatear número con separadores de miles
export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Formatear porcentaje
export function formatPercentage(value: number, decimals: number = 2): string {
  const formatted = formatNumber(value, decimals);
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatted}%`;
}

// Formatear fecha
export function formatDate(date: Date, pattern: string = 'dd MMM yyyy'): string {
  return format(date, pattern, { locale: es });
}

// Formatear fecha relativa
export function formatRelativeDate(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
}

// Formatear fecha completa (para mostrar al usuario)
export function formatFullDate(date: Date): string {
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
}

// Formatear mes y año
export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: es });
}

// Calcular edad en años
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

// Calcular edad en años y meses
export function calculateAgeDetailed(birthDate: Date): { years: number; months: number } {
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (today.getDate() < birthDate.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }

  return { years, months };
}

// Formatear edad para mostrar
export function formatAge(birthDate: Date): string {
  const { years, months } = calculateAgeDetailed(birthDate);

  if (years === 0) {
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  }

  if (months === 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  }

  return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`;
}

// Formatear unidades (para ETFs)
export function formatUnits(units: number): string {
  if (units >= 1) {
    return formatNumber(units, 4);
  }
  return formatNumber(units, 6);
}
