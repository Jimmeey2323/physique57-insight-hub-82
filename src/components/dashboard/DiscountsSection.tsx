
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { DiscountAnalyticsCharts } from './DiscountAnalyticsCharts';
import { DiscountTopBottomLists } from './DiscountTopBottomLists';
import { DiscountImpactInsights } from './DiscountImpactInsights';
import { 
  Tag, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Target, 
  Users, 
  Calendar, 
  Award,
  Database,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useDiscountAnalysis } from '@/hooks/useDiscountAnalysis';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { designTokens } from '@/utils/designTokens';
import { cn } from '@/lib/utils';
import { SourceDataModal } from '@/components/ui/SourceDataModal';

export const DiscountsSection: React.FC = () => {
  const { data, metrics, loading, error } = useDiscountAnalysis();
  const { data: salesData } = useGoogleSheets();
  const [openSource, setOpenSource] = useState(false);

  const heroStats = useMemo(() => {
    if (!metrics) return [];
    
    return [
      {
        value: formatCurrency(metrics.totalDiscountAmount),
        label: 'Total Discounts Given',
        icon: TrendingDown,
      },
      {
        value: formatNumber(metrics.totalTransactions),
        label: 'Discounted Transactions',
        icon: Users,
      },
      {
        value: `${metrics.avgDiscountPercentage.toFixed(1)}%`,
        label: 'Average Discount %',
        icon: Percent,
      }
    ];
  }, [metrics]);

  const metricCards = useMemo(() => {
    if (!metrics) return [];

    return [
      {
        title: 'Total Revenue Impact',
        value: formatCurrency(metrics.totalRevenueLost),
        change: -((metrics.totalRevenueLost / metrics.totalPotentialRevenue) * 100),
        description: 'Revenue reduced by discounts',
        icon: DollarSign,
        color: 'red' as const,
      },
      {
        title: 'Discount Effectiveness',
        value: `${metrics.discountEffectiveness.toFixed(1)}%`,
        change: metrics.discountEffectiveness - 80,
        description: 'Revenue conversion rate',
        icon: Target,
        color: 'green' as const,
      },
      {
        title: 'Discounted Transactions',
        value: formatNumber(metrics.totalTransactions),
        change: 15.2,
        description: 'Total transactions with discounts',
        icon: Users,
        color: 'blue' as const,
      },
      {
        title: 'Average Discount Rate',
        value: `${metrics.avgDiscountPercentage.toFixed(1)}%`,
        change: -2.3,
        description: 'Mean discount percentage',
        icon: Percent,
        color: 'orange' as const,
      },
    ];
  }, [metrics]);

  const topDiscountedProducts = useMemo(() => {
    if (!metrics?.productBreakdown) return [];
    
    return metrics.productBreakdown
      .sort((a: any, b: any) => b.totalDiscount - a.totalDiscount)
      .slice(0, 10)
      .map((item: any) => ({
        product: item.product,
        transactions: item.transactions,
        totalDiscount: item.totalDiscount,
        avgDiscountPercentage: item.avgDiscountPercentage,
        revenue: item.revenue,
      }));
  }, [metrics]);

  const monthlyTrends = useMemo(() => {
    if (!metrics?.monthlyBreakdown) return [];
    
    return metrics.monthlyBreakdown
      .sort((a: any, b: any) => a.month.localeCompare(b.month))
      .map((item: any) => ({
        month: item.month,
        transactions: item.transactions,
        totalDiscount: item.totalDiscount,
        revenue: item.revenue,
        avgDiscountPerTransaction: item.totalDiscount / item.transactions,
        discountRate: (item.totalDiscount / item.revenue) * 100,
      }));
  }, [metrics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-red-50/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <LoadingSkeleton type="full-page" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-red-50/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Card className={cn(designTokens.card.background, designTokens.card.shadow)}>
            <CardContent className="text-center py-16">
              <Tag className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Error Loading Discount Data</h3>
              <p className="text-slate-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-red-50/20">
      {/* Modern Hero Section */}
      <ModernHeroSection
        title="Discounts & Promotions"
        description="Comprehensive analysis of discount strategies and promotional impact across all sales channels"
        badgeText="Discount Analytics"
        badgeIcon={Tag}
        gradient="orange"
        stats={heroStats}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Source Data Info */}
        <div className="flex justify-between items-center animate-fade-in">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-slate-700">Data Source: Sales Sheet</span>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
            onClick={() => setOpenSource(true)}
          >
            <Eye className="w-4 h-4" />
            View Source Data
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((metric, index) => (
            <Card key={metric.title} className={cn(
              designTokens.card.background,
              designTokens.card.shadow,
              designTokens.card.hover,
              'group cursor-pointer animate-fade-in'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                  {metric.title}
                </CardTitle>
                <div className={cn(
                  'p-3 rounded-xl group-hover:scale-110 transition-transform',
                  metric.color === 'red' ? 'bg-red-50 text-red-600' :
                  metric.color === 'green' ? 'bg-green-50 text-green-600' :
                  metric.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  'bg-orange-50 text-orange-600'
                )}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold text-slate-900">
                  {metric.value}
                </div>
                {metric.change !== undefined && (
                  <div className="flex items-center text-sm">
                    <Badge className={cn(
                      'text-xs font-medium',
                      metric.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </Badge>
                    <span className="ml-2 text-slate-500">vs last period</span>
                  </div>
                )}
                <p className="text-sm text-slate-600">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Interactive Charts */}
        <Card className={cn(designTokens.card.background, designTokens.card.shadow, 'animate-slide-up delay-200')}>
          <CardHeader className="pb-6 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 rounded-t-2xl">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent flex items-center gap-2">
              <Award className="w-6 h-6 text-orange-600" />
              Discount Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <DiscountAnalyticsCharts data={data} metrics={metrics} />
          </CardContent>
        </Card>

        {/* Top/Bottom Lists */}
        <div className="animate-slide-up delay-300">
          <DiscountTopBottomLists data={data} />
        </div>

        {/* Impact Insights */}
        <div className="animate-slide-up delay-400">
          <DiscountImpactInsights data={data} />
        </div>

        {/* Top Discounted Products Table */}
        <ModernDataTable
          title="Top Discounted Products Analysis"
          data={topDiscountedProducts}
          columns={[
            { key: 'product', header: 'Product', align: 'left' },
            { key: 'transactions', header: 'Transactions', align: 'center', render: (value) => formatNumber(value) },
            { key: 'totalDiscount', header: 'Total Discount', align: 'right', render: (value) => formatCurrency(value) },
            { key: 'avgDiscountPercentage', header: 'Avg Discount %', align: 'center', render: (value) => `${value.toFixed(1)}%` },
            { key: 'revenue', header: 'Revenue', align: 'right', render: (value) => formatCurrency(value) },
          ]}
          className="animate-slide-up delay-500"
          showFooter={true}
          footerData={{
            product: 'TOTAL',
            transactions: topDiscountedProducts.reduce((sum, item) => sum + item.transactions, 0),
            totalDiscount: topDiscountedProducts.reduce((sum, item) => sum + item.totalDiscount, 0),
            avgDiscountPercentage: topDiscountedProducts.reduce((sum, item) => sum + item.avgDiscountPercentage, 0) / topDiscountedProducts.length,
            revenue: topDiscountedProducts.reduce((sum, item) => sum + item.revenue, 0),
          }}
        />

        {/* Monthly Discount Trends Table */}
        <ModernDataTable
          title="Monthly Discount Performance Trends"
          data={monthlyTrends}
          columns={[
            { key: 'month', header: 'Month', align: 'left' },
            { key: 'transactions', header: 'Transactions', align: 'center', render: (value) => formatNumber(value) },
            { key: 'totalDiscount', header: 'Total Discount', align: 'right', render: (value) => formatCurrency(value) },
            { key: 'revenue', header: 'Revenue', align: 'right', render: (value) => formatCurrency(value) },
            { key: 'discountRate', header: 'Discount Rate', align: 'center', render: (value) => `${value.toFixed(1)}%` },
            { key: 'avgDiscountPerTransaction', header: 'Avg Discount/Txn', align: 'right', render: (value) => formatCurrency(value) },
          ]}
          className="animate-slide-up delay-600"
          showFooter={true}
          footerData={{
            month: 'TOTAL / AVG',
            transactions: monthlyTrends.reduce((sum, item) => sum + item.transactions, 0),
            totalDiscount: monthlyTrends.reduce((sum, item) => sum + item.totalDiscount, 0),
            revenue: monthlyTrends.reduce((sum, item) => sum + item.revenue, 0),
            discountRate: monthlyTrends.reduce((sum, item) => sum + item.discountRate, 0) / monthlyTrends.length,
            avgDiscountPerTransaction: monthlyTrends.reduce((sum, item) => sum + item.avgDiscountPerTransaction, 0) / monthlyTrends.length,
          }}
        />

        {/* Insights Footer */}
        <Card className={cn(
          designTokens.card.background,
          designTokens.card.shadow,
          'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 animate-slide-up delay-700'
        )}>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Key Discount Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-orange-800">
              <div>
                <strong>Total Impact:</strong> {formatCurrency(metrics?.totalDiscountAmount || 0)} in discounts given
              </div>
              <div>
                <strong>Effectiveness:</strong> {metrics?.discountEffectiveness.toFixed(1)}% conversion efficiency
              </div>
              <div>
                <strong>Average Rate:</strong> {metrics?.avgDiscountPercentage.toFixed(1)}% discount per transaction
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SourceDataModal
        open={openSource}
        onOpenChange={setOpenSource}
        sources={[{
          name: 'Sales',
          sheetName: 'Sales',
          spreadsheetId: '149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI',
          data: salesData || []
        }]}
      />
    </div>
  );
};

export default DiscountsSection;
