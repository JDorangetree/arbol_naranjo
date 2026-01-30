export * from './user.types';
export * from './investment.types';
export * from './report.types';

// Nueva arquitectura de 3 capas
// Re-exportar tipos específicos para evitar conflictos con investment.types
export type {
  FinancialTransaction,
  FinancialTransactionType,
  Currency,
  FinancialSnapshot,
  SnapshotType,
  FinancialHolding,
  ETFReference,
  PortfolioCalculation,
  FinancialExportData,
  // ETFCategory y PlantType ya exportados desde investment.types
} from './financial.types';

export type {
  TransactionMetadata,
  MetadataVersion,
  MilestoneConfig,
  PeriodMetadata,
  PeriodMetadataVersion,
  MetadataExportData,
  // MilestoneType ya exportado desde investment.types
} from './metadata.types';
export { MILESTONE_CONFIGS } from './metadata.types';

export * from './emotional.types';
export * from './app.types';
