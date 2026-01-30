export interface Investment {
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

export interface ETF {
  id: string;
  ticker: string;
  name: string;
  description: string;
  category: ETFCategory;
  currency: 'COP' | 'USD';
  exchange: string;
  currentPrice: number;
  priceUpdatedAt: Date;
  icon: string;
  color: string;
  plantType: PlantType;
}

export type ETFCategory =
  | 'colombian_equity'
  | 'international_equity'
  | 'bonds'
  | 'mixed'
  | 'commodities'
  | 'dividend';

export type PlantType =
  | 'oak'       // Renta variable - crece grande pero lento
  | 'bamboo'    // Crecimiento rápido
  | 'fruit'     // Dividendos
  | 'flower'    // Bonos - estable y bonito
  | 'cactus';   // Commodities - resistente

export interface Transaction {
  id: string;
  userId: string;
  investmentId: string;
  etfId: string;
  etfTicker: string;
  etfName: string;
  type: TransactionType;
  units: number;
  pricePerUnit: number;
  totalAmount: number;
  commission: number;
  date: Date;
  note?: string;
  milestone?: MilestoneType;
  photo?: string;
  createdAt: Date;
}

export type TransactionType = 'buy' | 'sell' | 'dividend' | 'split';

export type MilestoneType =
  | 'first_investment'
  | 'birthday'
  | 'christmas'
  | 'achievement'
  | 'monthly'
  | 'special_moment';

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: GoalCategory;
  icon: string;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export type GoalCategory =
  | 'education'
  | 'first_car'
  | 'travel'
  | 'emergency'
  | 'independence'
  | 'custom';

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  monthlyContribution: number;
  lastContributionDate: Date | null;
  investmentCount: number;
  diversificationScore: number;
  investments: Investment[];
  recentTransactions: Transaction[];
}

export interface MonthlySnapshot {
  id: string;
  userId: string;
  month: string;
  totalValue: number;
  totalInvested: number;
  contributions: number;
  returns: number;
  breakdown: {
    etfId: string;
    etfName: string;
    value: number;
    percentage: number;
  }[];
  createdAt: Date;
}

// Tipos para visualización del árbol
export type TreeStage =
  | 'seed'         // < $100,000 COP
  | 'sprout'       // $100,000 - $500,000
  | 'sapling'      // $500,000 - $2,000,000
  | 'young_tree'   // $2,000,000 - $10,000,000
  | 'mature_tree'  // $10,000,000 - $50,000,000
  | 'mighty_oak';  // > $50,000,000

export interface TreeVisualization {
  stage: TreeStage;
  leaves: number;
  fruits: number;
  progress: number; // 0-100 dentro de la etapa actual
  nextMilestone: number;
}
