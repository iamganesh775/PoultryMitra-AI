export interface Farm {
  id: string;
  userId: string;
  name: string;
  location: string;
  totalBirds: number;
  breeds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DiseaseDetection {
  id: string;
  imageUrl: string;
  disease: string;
  confidence: number;
  recommendations: string[];
  detectedAt: string;
}

export interface BreedRecommendation {
  breed: string;
  suitability: number;
  pros: string[];
  cons: string[];
  expectedProduction: {
    eggs: number;
    meat: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Invoice {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface VaccinationSchedule {
  id: string;
  vaccineName: string;
  dueDate: string;
  birdCount: number;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
}

export interface BusinessPlan {
  id: string;
  initialInvestment: number;
  monthlyExpenses: number;
  projectedRevenue: number;
  breakEvenMonth: number;
  roi: number;
  insights: string[];
}
