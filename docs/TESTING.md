# Guía de Testing - El Tesoro de Tomás

Esta guía explica cómo escribir y ejecutar tests en la aplicación.

## Comandos Disponibles

```bash
# Ejecutar todos los tests una vez
npm test

# Ejecutar tests en modo watch (re-ejecuta al guardar cambios)
npm run test:watch

# Abrir interfaz visual de Vitest
npm run test:ui

# Ejecutar tests con reporte de coverage
npm run test:coverage
```

---

## Estructura de Archivos de Test

```
src/
├── test/
│   ├── setup.ts          # Configuración global de tests
│   └── test-utils.tsx    # Helpers y mocks reutilizables
├── services/
│   ├── crypto.ts
│   └── crypto.test.ts    # Tests junto al archivo
├── components/
│   └── common/
│       ├── Button.tsx
│       └── Button.test.tsx
└── store/
    ├── useInvestmentStore.ts
    └── useInvestmentStore.test.ts
```

**Convención**: Los tests van junto al archivo que prueban con extensión `.test.ts` o `.test.tsx`.

---

## Tipos de Tests

### 1. Unit Tests (Servicios y Utilidades)

Para funciones puras sin dependencias de React:

```typescript
// src/services/crypto.test.ts
import { describe, it, expect } from 'vitest';
import { hashPin, verifyPin } from './crypto';

describe('Crypto Service', () => {
  describe('hashPin', () => {
    it('genera un hash con salt', () => {
      const result = hashPin('1234');

      expect(result).toHaveProperty('salt');
      expect(result).toHaveProperty('hash');
    });
  });

  describe('verifyPin', () => {
    it('retorna true para PIN correcto', () => {
      const hashed = hashPin('1234');
      expect(verifyPin('1234', hashed)).toBe(true);
    });

    it('retorna false para PIN incorrecto', () => {
      const hashed = hashPin('1234');
      expect(verifyPin('5678', hashed)).toBe(false);
    });
  });
});
```

### 2. Component Tests (React)

Para componentes de UI:

```typescript
// src/components/common/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza el texto correctamente', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('llama onClick al hacer click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('está deshabilitado cuando disabled=true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 3. Store Tests (Zustand)

Para stores de estado:

```typescript
// src/store/useInvestmentStore.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useInvestmentStore } from './useInvestmentStore';

// Mock de Firebase
vi.mock('../services/firebase', () => ({
  getInvestments: vi.fn().mockResolvedValue([]),
  getTransactions: vi.fn().mockResolvedValue([]),
}));

describe('useInvestmentStore', () => {
  beforeEach(() => {
    // Resetear store antes de cada test
    useInvestmentStore.setState({
      investments: [],
      transactions: [],
      isLoading: false,
      error: null,
    });
  });

  it('tiene estado inicial correcto', () => {
    const state = useInvestmentStore.getState();

    expect(state.investments).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('getPortfolioSummary calcula totales correctamente', () => {
    // Configurar estado con datos mock
    useInvestmentStore.setState({
      investments: [
        { totalInvested: 1000000, currentValue: 1100000, /* ... */ },
        { totalInvested: 500000, currentValue: 520000, /* ... */ },
      ],
    });

    const summary = useInvestmentStore.getState().getPortfolioSummary();

    expect(summary.totalInvested).toBe(1500000);
  });
});
```

### 4. Hook Tests

Para custom hooks:

```typescript
// src/hooks/useDebounce.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna el valor inicial inmediatamente', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('debouncea cambios de valor', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'changed' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('changed');
  });
});
```

---

## Mocks Comunes

### Mock de localStorage

Ya configurado en `setup.ts`. Para usarlo:

```typescript
import { vi } from 'vitest';

it('guarda en localStorage', () => {
  const localStorageMock = vi.spyOn(Storage.prototype, 'setItem');

  // Tu código que usa localStorage

  expect(localStorageMock).toHaveBeenCalledWith('key', 'value');
});
```

### Mock de Firebase

```typescript
vi.mock('../services/firebase', () => ({
  getInvestments: vi.fn().mockResolvedValue([
    createMockInvestment({ id: '1' }),
    createMockInvestment({ id: '2' }),
  ]),
  createTransaction: vi.fn().mockResolvedValue({ id: 'new-tx' }),
}));
```

### Mock de Router

El `test-utils.tsx` ya incluye `BrowserRouter`. Para mockear navegación:

```typescript
import { useNavigate } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

it('navega al hacer click', () => {
  const navigate = vi.fn();
  vi.mocked(useNavigate).mockReturnValue(navigate);

  // render y click...

  expect(navigate).toHaveBeenCalledWith('/ruta');
});
```

---

## Data Factories

Usa las factories en `test-utils.tsx` para crear datos mock:

```typescript
import {
  createMockUser,
  createMockInvestment,
  createMockTransaction,
  createMockETF,
} from '../test/test-utils';

it('muestra inversiones', () => {
  const investments = [
    createMockInvestment({ etfTicker: 'NU', totalUnits: 100 }),
    createMockInvestment({ etfTicker: 'SPY', totalUnits: 50 }),
  ];

  // Usar en tests...
});
```

---

## Patrones y Mejores Prácticas

### 1. AAA Pattern (Arrange, Act, Assert)

```typescript
it('calcula el retorno correctamente', () => {
  // Arrange - preparar datos
  const invested = 1000000;
  const currentValue = 1100000;

  // Act - ejecutar acción
  const result = calculateReturn(invested, currentValue);

  // Assert - verificar resultado
  expect(result.percentage).toBe(10);
  expect(result.absolute).toBe(100000);
});
```

### 2. Test IDs para elementos difíciles de seleccionar

```tsx
// En el componente
<div data-testid="portfolio-value">{value}</div>

// En el test
expect(screen.getByTestId('portfolio-value')).toHaveTextContent('$1,000,000');
```

### 3. Queries recomendadas (orden de prioridad)

1. `getByRole` - Accesible, semántico
2. `getByLabelText` - Para formularios
3. `getByPlaceholderText` - Para inputs
4. `getByText` - Para contenido visible
5. `getByTestId` - Último recurso

### 4. Async tests

```typescript
it('carga datos asíncronos', async () => {
  render(<MyComponent />);

  // Esperar a que aparezca el contenido
  await screen.findByText('Datos cargados');

  // O usar waitFor para condiciones complejas
  await waitFor(() => {
    expect(screen.getByText('Datos cargados')).toBeInTheDocument();
  });
});
```

---

## Ejecutar Tests Específicos

```bash
# Un archivo específico
npm test -- src/services/crypto.test.ts

# Tests que coincidan con un patrón
npm test -- --grep "hashPin"

# Solo tests de un describe
npm test -- --grep "Crypto Service"
```

---

## Coverage

Ejecuta `npm run test:coverage` para ver el reporte. Los umbrales mínimos configurados son:

- Statements: 60%
- Branches: 60%
- Functions: 60%
- Lines: 60%

El reporte HTML se genera en `./coverage/index.html`.

---

## Troubleshooting

### "Cannot find module"
Asegúrate de que los paths en `vitest.config.ts` coincidan con `vite.config.ts`.

### Tests que pasan individualmente pero fallan juntos
Revisa si hay estado compartido. Usa `beforeEach` para resetear.

### Problemas con imports de CSS/assets
Vitest maneja esto automáticamente, pero si hay problemas, agrega mocks en `setup.ts`.

### Timeouts en tests async
Aumenta el timeout en el test específico:
```typescript
it('test lento', async () => {
  // ...
}, 30000); // 30 segundos
```

---

## Recursos

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet/)
