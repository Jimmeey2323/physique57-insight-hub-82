
import { Icons } from "@/components/ui/icons"

export interface NavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
  icon?: keyof typeof Icons
  label?: string
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[]
}

export type MainNavItem = NavItem

export type SidebarNavItem = NavItemWithChildren

export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
  }
}

export type DashboardConfig = {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export interface DataTableSearchableColumn<TData> {
  id: keyof TData
  title: string
  sortable?: boolean
  filter?: boolean
}

export interface DataTableFilterableColumn<TData> extends DataTableSearchableColumn<TData> {
  options: { label: string; value: any }[]
}

export interface LeadsData {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  stage: string;
  createdAt: string;
  updatedAt: string;
  city: string;
  country: string;
  industry: string;
  company: string;
  leadOwner: string;
  campaign: string;
  medium: string;
  content: string;
  term: string;
  conversionStatus: string;
  ltv: number;
  visits: number;
}

export interface SalesData {
  memberId: string;
  customerName: string;
  customerEmail: string;
  saleItemId: string;
  paymentCategory: string;
  paymentDate: string;
  paymentValue: number;
  paidInMoneyCredits: number;
  paymentVAT: number;
  paymentItem: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentTransactionId: string;
  stripeToken: string;
  soldBy: string;
  saleReference: string;
  calculatedLocation: string;
  cleanedProduct: string;
  cleanedCategory: string;
  hostId: string;
  mrpPreTax: number;
  mrpPostTax: number;
  discountAmount: number;
  discountPercentage: number;
  membershipType: string;
  grossRevenue: number;
  netRevenue: number;
  grossDiscountPercent: number;
  netDiscountPercent: number;
}

export interface NewClientData {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  firstVisitDate: string;
  firstVisitEntityName: string;
  firstVisitType: string;
  firstVisitLocation: string;
  paymentMethod: string;
  membershipUsed: string;
  homeLocation: string;
  classNo: number;
  trainerName: string;
  isNew: string;
  visitsPostTrial: number;
  membershipsBoughtPostTrial: string;
  purchaseCountPostTrial: number;
  ltv: number;
  retentionStatus: string;
  conversionStatus: string;
  period: string;
  unique: string;
  firstPurchase: string;
  conversionSpan: number;
  customerName?: string;
  customerEmail?: string;
  firstPurchaseDate?: string;
  firstPurchaseValue?: number;
  firstPurchaseCategory?: string;
  firstPurchaseProduct?: string;
  currentStatus?: string;
  totalSpent?: number;
  totalSessions?: number;
  lastPurchaseDate?: string;
  calculatedLocation?: string;
  retentionRate?: number;
  conversionRate?: number;
  acquisitionSource?: string;
  membershipType?: string;
  newClients?: number;
  conversions?: number;
  retained?: number;
  totalLtv?: number;
}

export interface NewClientFilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  location: string[];
  homeLocation: string[];
  trainer: string[];
  paymentMethod: string[];
  retentionStatus: string[];
  conversionStatus: string[];
  isNew: string[];
  minLtv?: number;
  maxLtv?: number;
}

export type LeadsMetricType =
  | "totalLeads"
  | "leadToTrialConversion"
  | "trialToMembershipConversion"
  | "ltv"
  | "totalRevenue"
  | "visitFrequency"

export type TrainerMetricType =
  | 'totalSessions'
  | 'totalCustomers'
  | 'totalPaid'
  | 'classAverage'
  | 'classAverageInclEmpty'
  | 'classAverageExclEmpty'
  | 'retention'
  | 'conversion'
  | 'emptySessions'
  | 'newMembers';

export type YearOnYearMetricType =
  | "revenue"
  | "transactions"
  | "members"
  | "atv"
  | "auv"
  | "asv"
  | "upt"
  | "vat"
  | "units"

export type DrillDownType = 'metric' | 'product' | 'category' | 'member' | 'soldBy' | 'paymentMethod' | 'client-conversion';

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  location: string[];
  category: string[];
  product: string[];
  soldBy: string[];
  paymentMethod: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  change?: number;
  calculation?: string;
}

export interface EnhancedYearOnYearTableProps {
  data: any[];
  loading?: boolean;
  activeMetric: YearOnYearMetricType;
  onMetricChange: (value: YearOnYearMetricType) => void;
  onRowClick?: (item: any) => void;
  selectedMetric?: YearOnYearMetricType;
}
