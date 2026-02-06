/**
 * Utilidades de Testing
 *
 * Helpers y wrappers para facilitar el testing de componentes.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// ============================================
// PROVIDERS WRAPPER
// ============================================

interface WrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper con todos los providers necesarios para tests
 */
function AllTheProviders({ children }: WrapperProps) {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
}

/**
 * Render personalizado que incluye providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// ============================================
// MOCK DATA FACTORIES
// ============================================

/**
 * Crea un usuario mock para tests
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    childName: 'Tomás',
    childBirthDate: new Date('2020-01-15'),
    createdAt: new Date(),
    settings: {
      currency: 'COP' as const,
      theme: 'light' as const,
      preferredVisualization: 'tree' as const,
      monthlyGoal: 500000,
      notifications: true,
    },
    ...overrides,
  };
}

/**
 * Crea una inversión mock para tests
 */
export function createMockInvestment(overrides = {}) {
  return {
    id: 'test-investment-id',
    userId: 'test-user-id',
    etfId: 'nu-holdings',
    etfName: 'Nu Holdings Ltd. (Nubank)',
    etfTicker: 'NU',
    totalUnits: 100,
    averagePurchasePrice: 30000,
    currentPrice: 32000,
    totalInvested: 3000000,
    currentValue: 3200000,
    returnPercentage: 6.67,
    returnAbsolute: 200000,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Crea una transacción mock para tests
 */
export function createMockTransaction(overrides = {}) {
  return {
    id: 'test-transaction-id',
    userId: 'test-user-id',
    investmentId: 'test-investment-id',
    etfId: 'nu-holdings',
    etfTicker: 'NU',
    etfName: 'Nu Holdings Ltd. (Nubank)',
    type: 'buy' as const,
    units: 10,
    pricePerUnit: 30000,
    totalAmount: 300000,
    commission: 0,
    date: new Date(),
    note: 'Test transaction',
    milestone: undefined,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Crea un ETF mock para tests
 */
export function createMockETF(overrides = {}) {
  return {
    id: 'nu-holdings',
    ticker: 'NU',
    name: 'Nu Holdings Ltd. (Nubank)',
    description: 'Fintech latinoamericana',
    category: 'international_equity' as const,
    currency: 'COP' as const,
    exchange: 'BVC',
    currentPrice: 32000,
    priceUpdatedAt: new Date(),
    icon: '🏦',
    color: '#820AD1',
    plantType: 'bamboo' as const,
    ...overrides,
  };
}

// ============================================
// ASYNC HELPERS
// ============================================

/**
 * Espera a que pase un tiempo determinado
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Espera a que una condición sea verdadera
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('waitFor timeout');
    }
    await wait(interval);
  }
}

// ============================================
// EXPORTS
// ============================================

// Re-exportar todo de @testing-library/react
export * from '@testing-library/react';

// Exportar el render personalizado como default
export { customRender as render };
