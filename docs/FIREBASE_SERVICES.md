# Servicios Firebase - API Interna

> Documentación técnica de los servicios Firebase para El Tesoro de Tomás.
> Última actualización: 2 de Febrero de 2026

---

## Estructura de Archivos

```
src/services/firebase/
├── config.ts           # Inicialización de Firebase
├── index.ts            # Exportaciones principales
├── auth.ts             # Autenticación de usuarios
├── authGuard.ts        # Validación de tokens y acceso
├── storageService.ts   # Gestión de almacenamiento de imágenes
├── investments.ts      # CRUD de inversiones y transacciones
├── financialService.ts # Capa financiera - datos objetivos
├── emotionalService.ts # Capa emocional - capítulos y narrativas
├── metadataService.ts  # Capa de metadatos - contexto/razones
└── migrationService.ts # Migración de datos legacy a 3 capas
```

---

## Arquitectura de 3 Capas

```
┌─────────────────────────────────────────────────────────┐
│         CAPA EMOCIONAL (emotionalService.ts)            │
│  Capítulos, Narrativas, Historias para Tomás            │
│  Desbloqueo por edad/fecha                              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│         CAPA METADATOS (metadataService.ts)             │
│  Contexto y razones detrás de decisiones                │
│  Milestones, fotos, notas personales                    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│         CAPA FINANCIERA (financialService.ts)           │
│  Transacciones, Snapshots, Cálculos de portafolio       │
└─────────────────────────────────────────────────────────┘
```

---

## Servicios por Archivo

### config.ts

Inicialización y exportación de instancias Firebase.

```typescript
import { auth, db, storage } from './services/firebase';
```

| Export | Tipo | Descripción |
|--------|------|-------------|
| `auth` | `Auth` | Instancia de Firebase Auth |
| `db` | `Firestore` | Instancia de Firestore |
| `storage` | `Storage` | Instancia de Cloud Storage |

---

### auth.ts

Gestión de autenticación de usuarios.

#### Funciones

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `registerUser` | `data: RegisterData` | `Promise<User>` | Registra nuevo usuario |
| `loginUser` | `data: LoginData` | `Promise<User>` | Inicia sesión |
| `logoutUser` | - | `Promise<void>` | Cierra sesión |
| `getCurrentUserData` | `firebaseUser: FirebaseUser` | `Promise<User>` | Obtiene datos del usuario actual |
| `subscribeToAuthChanges` | `callback: (user) => void` | `() => void` | Suscribe a cambios de auth |

#### Tipos

```typescript
interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  childName: string;
  childBirthDate: Date;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  displayName: string;
  childName: string;
  childBirthDate: Date;
  createdAt: Date;
  settings: UserSettings;
}
```

#### Ejemplo de uso

```typescript
import { registerUser, loginUser, logoutUser } from './services/firebase';

// Registrar usuario
const user = await registerUser({
  email: 'padre@ejemplo.com',
  password: 'contraseña123',
  displayName: 'Papá de Tomás',
  childName: 'Tomás',
  childBirthDate: new Date('2020-05-15'),
});

// Iniciar sesión
const user = await loginUser({
  email: 'padre@ejemplo.com',
  password: 'contraseña123',
});

// Cerrar sesión
await logoutUser();
```

---

### authGuard.ts

Validación de autenticación y autorización.

#### Funciones

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `getCurrentUser` | - | `FirebaseUser` | Obtiene usuario actual (lanza si no hay) |
| `validateAuth` | - | `Promise<FirebaseUser>` | Valida que hay sesión activa |
| `validateUserAccess` | `userId: string` | `void` | Valida acceso a recursos del usuario |
| `validateAuthAndAccess` | `userId: string` | `Promise<FirebaseUser>` | Combina validación de auth y acceso |
| `withAuthValidation` | `userId, operation` | `Promise<T>` | Wrapper para operaciones autenticadas |
| `isAuthenticated` | - | `boolean` | Verifica si hay sesión |
| `getCurrentUserId` | - | `string \| null` | Obtiene ID del usuario actual |

#### Ejemplo de uso

```typescript
import { validateAuthAndAccess, withAuthValidation } from './services/firebase';

// Validar antes de operación
await validateAuthAndAccess(userId);
const investments = await getInvestments(userId);

// Usar wrapper
const result = await withAuthValidation(userId, async () => {
  return await someOperation();
});
```

---

### storageService.ts

Gestión de archivos e imágenes en Cloud Storage.

#### Funciones

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `validateImageFile` | `file: File` | `{ valid, error? }` | Valida archivo de imagen |
| `uploadChapterImage` | `userId, chapterId, file, onProgress?` | `Promise<UploadResult>` | Sube imagen de capítulo |
| `uploadMultipleImages` | `userId, chapterId, files, onProgress?` | `Promise<UploadResult[]>` | Sube múltiples imágenes |
| `deleteChapterImage` | `imageUrl: string` | `Promise<void>` | Elimina imagen |
| `deleteMultipleImages` | `imageUrls: string[]` | `Promise<void>` | Elimina múltiples imágenes |
| `compressImage` | `file, maxWidth?, quality?` | `Promise<File>` | Comprime imagen |

#### Tipos

```typescript
interface UploadProgress {
  progress: number;        // 0-100
  bytesTransferred: number;
  totalBytes: number;
}

interface UploadResult {
  url: string;      // URL pública de la imagen
  path: string;     // Path en Storage
  fileName: string; // Nombre del archivo
}
```

#### Ejemplo de uso

```typescript
import { uploadChapterImage, compressImage } from './services/firebase';

// Comprimir y subir imagen
const compressedFile = await compressImage(originalFile, 1200, 0.8);
const result = await uploadChapterImage(
  userId,
  chapterId,
  compressedFile,
  (progress) => console.log(`${progress.progress}%`)
);

console.log('URL:', result.url);
```

---

### investments.ts

CRUD de inversiones y transacciones (capa legacy, compatible con nueva arquitectura).

#### Funciones de Inversiones

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `createInvestment` | `userId, etf, units, pricePerUnit` | `Promise<Investment>` | Crea inversión |
| `getInvestments` | `userId` | `Promise<Investment[]>` | Lista inversiones |
| `getInvestmentByEtf` | `userId, etfId` | `Promise<Investment \| null>` | Busca por ETF |
| `updateInvestment` | `userId, investmentId, updates` | `Promise<void>` | Actualiza inversión |
| `addToInvestment` | `userId, investmentId, units, price` | `Promise<void>` | Añade unidades |
| `deleteInvestment` | `userId, investmentId` | `Promise<void>` | Elimina inversión |

#### Funciones de Transacciones

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `createTransaction` | `transaction` | `Promise<Transaction>` | Crea transacción |
| `getTransactions` | `userId, limit?` | `Promise<Transaction[]>` | Lista transacciones |
| `getTransactionsByInvestment` | `userId, investmentId` | `Promise<Transaction[]>` | Filtra por inversión |

#### Tipos

```typescript
interface Investment {
  id: string;
  userId: string;
  etfId: string;
  etfName: string;
  etfTicker: string;
  totalUnits: number;
  averagePurchasePrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  returnPercentage: number;
  returnAbsolute: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Transaction {
  id: string;
  userId: string;
  investmentId: string;
  etfId: string;
  etfTicker: string;
  etfName: string;
  type: 'buy' | 'sell' | 'dividend';
  units: number;
  pricePerUnit: number;
  totalAmount: number;
  commission?: number;
  date: Date;
  note?: string;
  milestone?: MilestoneType;
  createdAt: Date;
}
```

---

### financialService.ts

Capa financiera - datos objetivos y cálculos.

#### Funciones de Transacciones Financieras

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `createFinancialTransaction` | `userId, transaction` | `Promise<FinancialTransaction>` | Crea transacción |
| `getFinancialTransactions` | `userId, options?` | `Promise<FinancialTransaction[]>` | Lista transacciones |
| `getFinancialTransactionById` | `userId, transactionId` | `Promise<FinancialTransaction \| null>` | Obtiene por ID |
| `updateFinancialTransaction` | `userId, transactionId, updates` | `Promise<void>` | Actualiza |
| `deleteFinancialTransaction` | `userId, transactionId` | `Promise<void>` | Elimina |

#### Funciones de Snapshots

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `createFinancialSnapshot` | `userId, type, holdings` | `Promise<FinancialSnapshot>` | Crea snapshot |
| `getFinancialSnapshots` | `userId, options?` | `Promise<FinancialSnapshot[]>` | Lista snapshots |
| `getLatestSnapshot` | `userId` | `Promise<FinancialSnapshot \| null>` | Último snapshot |
| `generateMonthlySnapshot` | `userId` | `Promise<FinancialSnapshot>` | Genera snapshot mensual |

#### Funciones de ETFs

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `saveETFReference` | `userId, etf` | `Promise<void>` | Guarda referencia de ETF |
| `getETFReferences` | `userId` | `Promise<ETFReference[]>` | Lista ETFs del usuario |
| `updateETFPrice` | `userId, ticker, price` | `Promise<void>` | Actualiza precio |

#### Funciones de Cálculo

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `calculatePortfolio` | `userId` | `Promise<PortfolioCalculation>` | Calcula portafolio completo |

#### Tipos

```typescript
interface FinancialTransaction {
  id: string;
  userId: string;
  date: Date;
  type: 'buy' | 'sell' | 'dividend' | 'transfer';
  etfTicker: string;
  units: number;
  pricePerUnit: number;
  totalAmount: number;
  currency: 'COP' | 'USD';
  exchangeRate?: number;
  fees?: number;
  metadataId?: string;  // Vincula con capa de metadatos
  createdAt: Date;
  updatedAt: Date;
}

interface FinancialSnapshot {
  id: string;
  userId: string;
  date: Date;
  type: 'monthly' | 'yearly' | 'custom';
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  totalReturnPercentage: number;
  holdings: FinancialHolding[];
  createdAt: Date;
}

interface PortfolioCalculation {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  holdings: Array<{
    etfTicker: string;
    etfName: string;
    units: number;
    averageCost: number;
    currentPrice: number;
    currentValue: number;
    returnPercentage: number;
  }>;
  transactionCount: number;
  firstTransactionDate: Date | null;
  lastTransactionDate: Date | null;
}
```

---

### emotionalService.ts

Capa emocional - capítulos, narrativas y contenido para el hijo.

#### Funciones de Capítulos

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `createChapter` | `userId, data` | `Promise<Chapter>` | Crea capítulo |
| `getChapter` | `userId, chapterId, childBirthDate?` | `Promise<Chapter \| null>` | Obtiene capítulo |
| `getChapters` | `userId, options?` | `Promise<Chapter[]>` | Lista capítulos |
| `updateChapter` | `userId, chapterId, updates, editNote?` | `Promise<void>` | Actualiza (con versionado) |
| `publishChapter` | `userId, chapterId` | `Promise<void>` | Publica capítulo |
| `deleteChapter` | `userId, chapterId` | `Promise<void>` | Elimina capítulo |
| `reorderChapters` | `userId, chapterIds` | `Promise<void>` | Reordena capítulos |

#### Funciones de Narrativas Anuales

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `saveYearlyNarrative` | `userId, year, data, editNote?` | `Promise<YearlyNarrative>` | Guarda/actualiza narrativa |
| `getYearlyNarrative` | `userId, year` | `Promise<YearlyNarrative \| null>` | Obtiene narrativa del año |
| `getAllYearlyNarratives` | `userId` | `Promise<YearlyNarrative[]>` | Lista todas las narrativas |

#### Funciones de Desbloqueo

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `isChapterLocked` | `chapter, childBirthDate` | `boolean` | Verifica si está bloqueado |
| `getUnlockStatus` | `chapter, childBirthDate` | `UnlockStatus` | Estado detallado de desbloqueo |
| `getUpcomingUnlocks` | `userId, childBirthDate, withinYears?` | `Promise<Chapter[]>` | Próximos desbloqueos |

#### Funciones de Vinculación

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `linkChapterToTransactions` | `userId, chapterId, transactionIds` | `Promise<void>` | Vincula con transacciones |
| `linkChapterToYears` | `userId, chapterId, years` | `Promise<void>` | Vincula con años |
| `getChaptersByYear` | `userId, year, childBirthDate?` | `Promise<Chapter[]>` | Capítulos de un año |

#### Tipos

```typescript
interface Chapter {
  id: string;
  userId: string;
  title: string;
  type: 'letter' | 'story' | 'milestone' | 'yearly_reflection';
  content: string;
  excerpt?: string;
  mediaUrls?: string[];
  mediaCaptions?: string[];
  unlockAge?: number;           // Edad para desbloquear
  unlockDate?: Date;            // Fecha específica para desbloquear
  isLocked: boolean;
  lockedTeaser?: string;        // Adelanto para contenido bloqueado
  linkedTransactionIds?: string[];
  linkedYears?: number[];
  linkedChapterIds?: string[];
  sortOrder: number;
  tags?: string[];
  versions: ChapterVersion[];   // Historial de versiones
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

interface UnlockStatus {
  isLocked: boolean;
  unlockAge?: number;
  unlockDate?: Date;
  currentAge: number;
  yearsUntilUnlock?: number;
  daysUntilUnlock?: number;
}
```

#### Ejemplo de uso

```typescript
import {
  createChapter,
  getUnlockStatus,
  linkChapterToTransactions
} from './services/firebase';

// Crear capítulo que se desbloquea a los 18 años
const chapter = await createChapter(userId, {
  title: 'Carta para tus 18 años',
  type: 'letter',
  content: 'Querido Tomás, cuando leas esto...',
  unlockAge: 18,
  lockedTeaser: 'Una carta especial te espera cuando cumplas 18.',
});

// Verificar estado de desbloqueo
const status = getUnlockStatus(chapter, childBirthDate);
console.log(`Bloqueado: ${status.isLocked}, Años restantes: ${status.yearsUntilUnlock}`);

// Vincular con transacciones
await linkChapterToTransactions(userId, chapter.id, [transactionId1, transactionId2]);
```

---

### metadataService.ts

Capa de metadatos - contexto y razones detrás de las decisiones.

#### Funciones de Metadatos de Transacciones

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `createTransactionMetadata` | `userId, transactionId, data` | `Promise<TransactionMetadata>` | Crea metadatos |
| `getTransactionMetadata` | `userId, transactionId` | `Promise<TransactionMetadata \| null>` | Obtiene por transacción |
| `getAllTransactionMetadata` | `userId, options?` | `Promise<TransactionMetadata[]>` | Lista metadatos |
| `updateTransactionMetadata` | `userId, metadataId, updates, editNote?` | `Promise<void>` | Actualiza (con versionado) |
| `getMetadataVersionHistory` | `userId, metadataId` | `Promise<MetadataVersion[]>` | Historial de versiones |
| `restoreMetadataVersion` | `userId, metadataId, version` | `Promise<void>` | Restaura versión anterior |
| `deleteTransactionMetadata` | `userId, metadataId` | `Promise<void>` | Elimina |

#### Funciones de Metadatos de Períodos

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `savePeriodMetadata` | `userId, year, month, data, editNote?` | `Promise<PeriodMetadata>` | Guarda/actualiza |
| `getPeriodMetadata` | `userId, year, month?` | `Promise<PeriodMetadata \| null>` | Obtiene período |
| `getAllPeriodMetadata` | `userId` | `Promise<PeriodMetadata[]>` | Lista todos |

#### Funciones de Búsqueda

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `getTransactionsByMilestone` | `userId, milestone` | `Promise<TransactionMetadata[]>` | Filtra por milestone |
| `getTransactionsWithPhotos` | `userId` | `Promise<TransactionMetadata[]>` | Con fotos |
| `getMilestoneStats` | `userId` | `Promise<Record<MilestoneType, number>>` | Estadísticas |

#### Tipos

```typescript
interface TransactionMetadata {
  id: string;
  userId: string;
  transactionId: string;
  reason?: string;              // Por qué se hizo la inversión
  decisionContext?: string;     // Contexto de la decisión
  milestone?: MilestoneType;    // Hito asociado
  milestoneNote?: string;       // Nota del hito
  photoUrl?: string;            // Foto del momento
  photoCaption?: string;
  versions: MetadataVersion[];  // Historial
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PeriodMetadata {
  id: string;
  userId: string;
  year: number;
  month?: number;               // undefined = año completo
  economicContext?: string;     // Contexto económico del período
  personalContext?: string;     // Contexto personal/familiar
  financialNotes?: string;      // Notas financieras
  versions: PeriodMetadataVersion[];
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

type MilestoneType =
  | 'birth'       // Nacimiento
  | 'birthday'    // Cumpleaños
  | 'graduation'  // Graduación
  | 'job'         // Primer trabajo
  | 'wedding'     // Matrimonio
  | 'custom';     // Personalizado
```

#### Ejemplo de uso

```typescript
import {
  createTransactionMetadata,
  savePeriodMetadata,
  getMilestoneStats
} from './services/firebase';

// Agregar contexto a una transacción
await createTransactionMetadata(userId, transactionId, {
  reason: 'Primera inversión para el fondo universitario de Tomás',
  decisionContext: 'Acabamos de recibir el aguinaldo y decidimos invertirlo',
  milestone: 'custom',
  milestoneNote: 'Inicio del fondo educativo',
});

// Agregar contexto del período
await savePeriodMetadata(userId, 2026, 1, {
  economicContext: 'Inflación en 5%, tasas de interés bajando',
  personalContext: 'Tomás empezó el jardín',
  financialNotes: 'Decidimos aumentar aportes mensuales',
});

// Ver estadísticas de milestones
const stats = await getMilestoneStats(userId);
console.log(stats); // { birth: 1, birthday: 5, custom: 3, ... }
```

---

### migrationService.ts

Migración de datos legacy a la arquitectura de 3 capas.

#### Funciones

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `getMigrationStatus` | `userId` | `Promise<MigrationStatus>` | Estado de migración |
| `migrateUserData` | `userId` | `Promise<MigrationResult>` | Ejecuta migración |
| `verifyMigration` | `userId` | `Promise<{ isValid, issues }>` | Verifica integridad |
| `exportLegacyData` | `userId` | `Promise<{ transactions, exportDate }>` | Exporta datos legacy |
| `downloadLegacyBackup` | `data` | `void` | Descarga backup |

#### Tipos

```typescript
interface MigrationStatus {
  isMigrated: boolean;
  lastMigrationDate?: Date;
  version: string;
  originalTransactionCount: number;
  financialTransactionCount: number;
  metadataCount: number;
}

interface MigrationResult {
  success: boolean;
  migratedTransactions: number;
  createdFinancialRecords: number;
  createdMetadataRecords: number;
  skippedRecords: number;
  errors: string[];
  warnings: string[];
  duration: number;
}
```

---

## Patrones Comunes

### Retry con Backoff Exponencial

Todas las operaciones de red usan `withRetry` para manejar fallos transitorios:

```typescript
import { withRetry, FIREBASE_RETRY_OPTIONS } from '../utils/retry';

const result = await withRetry(
  () => getDocs(query),
  FIREBASE_RETRY_OPTIONS  // 3 reintentos, 1-8s delay
);
```

### Validación de Autenticación

Operaciones sensibles validan auth antes de ejecutar:

```typescript
import { validateAuthAndAccess } from './authGuard';

export async function getInvestments(userId: string) {
  await validateAuthAndAccess(userId);
  // ... operación
}
```

### Versionado Automático

Capítulos y metadatos mantienen historial de cambios:

```typescript
// Al actualizar, se crea nueva versión automáticamente
await updateChapter(userId, chapterId, {
  content: 'Nuevo contenido'
}, 'Corregí errores ortográficos');

// Restaurar versión anterior
await restoreMetadataVersion(userId, metadataId, 2);
```

### Timestamps Consistentes

Todas las entidades usan `serverTimestamp()` para audit trail:

```typescript
{
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}
```

---

## Estructura de Firestore

```
users/
  {userId}/
    ├── profile              # Datos del usuario
    ├── investments/         # Inversiones (legacy)
    │   └── {investmentId}
    ├── transactions/        # Transacciones (legacy)
    │   └── {transactionId}
    ├── financial/
    │   └── data/
    │       ├── transactions/{transactionId}  # Transacciones financieras
    │       ├── snapshots/{snapshotId}        # Snapshots mensuales
    │       └── etfs/{ticker}                 # Referencias de ETFs
    ├── emotional/
    │   └── data/
    │       ├── chapters/{chapterId}          # Capítulos
    │       └── narratives/{year}             # Narrativas anuales
    └── metadata/
        └── data/
            ├── transactionMeta/{metadataId}  # Metadatos de transacciones
            └── periodMeta/{periodId}         # Metadatos de períodos
```

---

## Flujos de Operaciones Comunes

### Crear inversión con contexto completo

```typescript
// 1. Crear transacción financiera
const transaction = await createFinancialTransaction(userId, {
  type: 'buy',
  etfTicker: 'VOO',
  units: 10,
  pricePerUnit: 450,
  totalAmount: 4500,
  currency: 'USD',
});

// 2. Agregar metadatos (razón, contexto)
await createTransactionMetadata(userId, transaction.id, {
  reason: 'Inversión para el fondo universitario',
  milestone: 'custom',
  milestoneNote: 'Primer aporte del año',
});

// 3. Opcionalmente, crear capítulo emocional
const chapter = await createChapter(userId, {
  title: 'Tu primer ETF de este año',
  type: 'story',
  content: 'Hoy decidimos...',
});

await linkChapterToTransactions(userId, chapter.id, [transaction.id]);
```

### Generar reporte mensual

```typescript
// 1. Calcular portafolio actual
const portfolio = await calculatePortfolio(userId);

// 2. Generar snapshot
const snapshot = await generateMonthlySnapshot(userId);

// 3. Agregar contexto del período
await savePeriodMetadata(userId, 2026, 2, {
  economicContext: 'Mercados estables, inflación controlada',
  personalContext: 'Mes tranquilo en la familia',
});
```

---

## Manejo de Errores

Todos los servicios lanzan errores con mensajes amigables definidos en `errorMessages.ts`:

```typescript
import { INVESTMENT_ERRORS, CHAPTER_ERRORS } from '../utils/errorMessages';

// Ejemplos de mensajes
INVESTMENT_ERRORS.NOT_FOUND    // "No encontramos esta inversión..."
CHAPTER_ERRORS.LOCKED          // "Este capítulo aún no está disponible..."
```

Ver [errorMessages.ts](../src/utils/errorMessages.ts) para la lista completa.

---

## Referencias

- [Firebase Security Rules](./FIREBASE_DEPLOYMENT.md)
- [Testing Guide](./TESTING.md)
- [README Principal](../README.md)
