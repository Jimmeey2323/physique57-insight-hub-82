
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, BarChart3, Calendar, Target, Award, DollarSign, Activity, Building2, MapPin, Crown, Trophy, Star, Zap } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { TrainerFilterSection } from './TrainerFilterSection';
import { TopBottomSellers } from './TopBottomSellers';
import { MonthOnMonthTrainerTable } from './MonthOnMonthTrainerTable';
import { YearOnYearTrainerTable } from './YearOnYearTrainerTable';
import { TrainerQuickFilters } from './TrainerQuickFilters';
import { TrainerInsights } from './TrainerInsights';
import { TrainerWordCloud } from './TrainerWordCloud';
import { usePayrollData } from '@/hooks/usePayrollData';
import { PayrollData, TrainerMetricType } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { EnhancedTrainerMetricCards } from './EnhancedTrainerMetricCards';
import { TrainerDetailedPerformanceTable } from './TrainerDetailedPerformanceTable';

const LOCATION_MAPPING = [
  {
    id: 'kwality',
    name: 'Kwality House, Kemps Corner',
    fullName: 'Kwality House, Kemps Corner'
  },
  {
    id: 'supreme',
    name: 'Supreme HQ, Bandra',
    fullName: 'Supreme HQ, Bandra'
  },
  {
    id: 'kenkere',
    name: 'Kenkere House',
    fullName: 'Kenkere House'
  }
];

export const TrainerPerformanceSection = () => {
  const { data: rawData, isLoading, error } = usePayrollData();
  const [activeLocation, setActiveLocation] = useState<string>('all');
  const [activeMetric, setActiveMetric] = useState<TrainerMetricType>('totalSessions');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true); // Collapsed by default
  const [quickFilters, setQuickFilters] = useState<Record<string, string[]>>({});
  const [filters, setFilters] = useState({
    location: '',
    trainer: '',
    month: ''
  });

  const filteredData = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return [];
    }

    let filtered = rawData;

    // Apply location filter
    if (activeLocation !== 'all') {
      const activeLocationName = LOCATION_MAPPING.find(loc => loc.id === activeLocation)?.fullName;
      if (activeLocationName) {
        filtered = filtered.filter(item => item.location === activeLocationName);
      }
    }

    // Apply additional filters
    if (filters.location) {
      filtered = filtered.filter(item => item.location === filters.location);
    }
    if (filters.trainer) {
      filtered = filtered.filter(item => item.teacherName === filters.trainer);
    }
    if (filters.month) {
      filtered = filtered.filter(item => item.monthYear === filters.month);
    }

    return filtered;
  }, [rawData, activeLocation, filters]);

  const processedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return null;
    }

    const totalSessions = filteredData.reduce((sum, item) => sum + (item.totalSessions || 0), 0);
    const totalCustomers = filteredData.reduce((sum, item) => sum + (item.totalCustomers || 0), 0);
    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.totalPaid || 0), 0);
    const totalEmptySessions = filteredData.reduce((sum, item) => sum + (item.totalEmptySessions || 0), 0);
    const totalNonEmptySessions = filteredData.reduce((sum, item) => sum + (item.totalNonEmptySessions || 0), 0);
    const avgClassSize = totalNonEmptySessions > 0 ? totalCustomers / totalNonEmptySessions : 0;

    // Parse conversion and retention rates properly
    const parseRate = (value: string | number): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const cleaned = value.replace('%', '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    const avgRetention = filteredData.length > 0 
      ? filteredData.reduce((sum, item) => sum + parseRate(item.retention || 0), 0) / filteredData.length 
      : 0;

    const avgConversion = filteredData.length > 0 
      ? filteredData.reduce((sum, item) => sum + parseRate(item.conversion || 0), 0) / filteredData.length 
      : 0;

    const totalNewMembers = filteredData.reduce((sum, item) => sum + (item.new || 0), 0);
    const totalRetained = filteredData.reduce((sum, item) => sum + (item.retained || 0), 0);
    const totalConverted = filteredData.reduce((sum, item) => sum + (item.converted || 0), 0);

    // Calculate efficiency metrics
    const revenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;
    const utilizationRate = totalSessions > 0 ? ((totalSessions - totalEmptySessions) / totalSessions) * 100 : 0;
    const revenuePerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    // Top performers with proper null checks
    const topRevenueTrainer = filteredData.length > 0 
      ? filteredData.reduce((max, item) => 
          (item.totalPaid || 0) > (max?.totalPaid || 0) ? item : max, 
          filteredData[0]
        ) 
      : null;

    const topSessionsTrainer = filteredData.length > 0 
      ? filteredData.reduce((max, item) => 
          (item.totalSessions || 0) > (max?.totalSessions || 0) ? item : max, 
          filteredData[0]
        ) 
      : null;

    const topCustomersTrainer = filteredData.length > 0 
      ? filteredData.reduce((max, item) => 
          (item.totalCustomers || 0) > (max?.totalCustomers || 0) ? item : max, 
          filteredData[0]
        ) 
      : null;

    return {
      totalSessions,
      totalCustomers,
      totalRevenue,
      totalEmptySessions,
      totalNonEmptySessions,
      avgClassSize,
      avgRetention: isNaN(avgRetention) ? 0 : avgRetention,
      avgConversion: isNaN(avgConversion) ? 0 : avgConversion,
      totalNewMembers,
      totalRetained,
      totalConverted,
      revenuePerSession,
      utilizationRate,
      revenuePerCustomer,
      topRevenueTrainer,
      topSessionsTrainer,
      topCustomersTrainer,
      trainerCount: new Set(filteredData.map(item => item.teacherName)).size,
      cycleRevenue: filteredData.reduce((sum, item) => sum + (item.cyclePaid || 0), 0),
      barreRevenue: filteredData.reduce((sum, item) => sum + (item.barrePaid || 0), 0),
      cycleSessions: filteredData.reduce((sum, item) => sum + (item.cycleSessions || 0), 0),
      barreSessions: filteredData.reduce((sum, item) => sum + (item.barreSessions || 0), 0)
    };
  }, [filteredData]);

  const getMetricCards = () => {
    if (!processedData) return [];

    return [
      {
        title: 'Total Sessions',
        value: formatNumber(processedData.totalSessions),
        change: 12.5,
        icon: 'sessions' as const,
        description: 'Total classes conducted across all trainers',
        calculation: 'Sum of cycle and barre sessions'
      },
      {
        title: 'Total Members',
        value: formatNumber(processedData.totalCustomers),
        change: 8.3,
        icon: 'members' as const,
        description: 'Total unique members trained',
        calculation: 'Sum of cycle and barre customers'
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(processedData.totalRevenue),
        change: 15.7,
        icon: 'revenue' as const,
        description: 'Total revenue generated by trainers',
        calculation: 'Sum of cycle and barre payments'
      },
      {
        title: 'Avg Class Size',
        value: processedData.avgClassSize.toFixed(1),
        change: -2.1,
        icon: 'efficiency' as const,
        description: 'Average members per non-empty class',
        calculation: 'Total customers / Non-empty sessions'
      },
      {
        title: 'Revenue/Session',
        value: formatCurrency(processedData.revenuePerSession),
        change: 5.2,
        icon: 'efficiency' as const,
        description: 'Average revenue per session',
        calculation: 'Total revenue / Total sessions'
      },
      {
        title: 'Utilization Rate',
        value: `${processedData.utilizationRate.toFixed(1)}%`,
        change: 3.8,
        icon: 'efficiency' as const,
        description: 'Percentage of non-empty sessions',
        calculation: 'Non-empty sessions / Total sessions'
      }
    ];
  };

  const getTrainerPerformanceData = () => {
    return filteredData.map(trainer => ({
      name: trainer.teacherName,
      totalValue: trainer.totalPaid || 0,
      unitsSold: trainer.totalSessions || 0,
      transactions: trainer.totalSessions || 0,
      uniqueMembers: trainer.totalCustomers || 0,
      atv: (trainer.totalPaid || 0) / Math.max(trainer.totalSessions || 1, 1),
      auv: (trainer.totalPaid || 0) / Math.max(trainer.totalSessions || 1, 1),
      asv: (trainer.totalPaid || 0) / Math.max(trainer.totalCustomers || 1, 1),
      upt: trainer.totalSessions || 0,
      location: trainer.location,
      month: trainer.monthYear,
      efficiency: trainer.totalSessions > 0 ? (trainer.totalPaid || 0) / trainer.totalSessions : 0,
      utilization: trainer.totalSessions > 0 ? ((trainer.totalSessions - (trainer.totalEmptySessions || 0)) / trainer.totalSessions) * 100 : 0,
      // Enhanced drill-down data
      emptySessions: trainer.totalEmptySessions || 0,
      nonEmptySessions: trainer.totalNonEmptySessions || 0,
      newMembers: trainer.new || 0,
      converted: trainer.converted || 0,
      retained: trainer.retained || 0,
      conversionRate: typeof trainer.conversion === 'string' ? parseFloat(trainer.conversion.replace('%', '') || '0') : trainer.conversion || 0,
      retentionRate: typeof trainer.retention === 'string' ? parseFloat(trainer.retention.replace('%', '') || '0') : trainer.retention || 0,
      classAvgInclEmpty: trainer.classAverageInclEmpty || 0,
      classAvgExclEmpty: trainer.classAverageExclEmpty || 0,
      cycleSessions: trainer.cycleSessions || 0,
      barreSessions: trainer.barreSessions || 0,
      cycleRevenue: trainer.cyclePaid || 0,
      barreRevenue: trainer.barrePaid || 0
    }));
  };

  const getMonthOnMonthData = () => {
    if (!filteredData.length) return { data: {}, months: [], trainers: [] };

    const data: Record<string, Record<string, number>> = {};
    const months = Array.from(new Set(filteredData.map(item => item.monthYear))).sort((a, b) => {
      const parseMonth = (monthStr: string) => {
        const [month, year] = monthStr.split('-');
        const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
        return new Date(parseInt(year), monthIndex);
      };
      return parseMonth(b).getTime() - parseMonth(a).getTime();
    });

    const trainers = Array.from(new Set(filteredData.map(item => item.teacherName))).sort();

    trainers.forEach(trainer => {
      data[trainer] = {};
      months.forEach(month => {
        const trainerData = filteredData.find(item => item.teacherName === trainer && item.monthYear === month);
        
        switch (activeMetric) {
          case 'totalSessions':
            data[trainer][month] = trainerData?.totalSessions || 0;
            break;
          case 'totalCustomers':
            data[trainer][month] = trainerData?.totalCustomers || 0;
            break;
          case 'totalPaid':
            data[trainer][month] = trainerData?.totalPaid || 0;
            break;
          case 'classAverageExclEmpty':
            data[trainer][month] = trainerData?.classAverageExclEmpty || 0;
            break;
          case 'classAverageInclEmpty':
            data[trainer][month] = trainerData?.classAverageInclEmpty || 0;
            break;
          case 'retention':
            const retentionValue = typeof trainerData?.retention === 'string' 
              ? parseFloat(trainerData.retention.replace('%', '') || '0') 
              : trainerData?.retention || 0;
            data[trainer][month] = isNaN(retentionValue) ? 0 : retentionValue;
            break;
          case 'conversion':
            const conversionValue = typeof trainerData?.conversion === 'string' 
              ? parseFloat(trainerData.conversion.replace('%', '') || '0') 
              : trainerData?.conversion || 0;
            data[trainer][month] = isNaN(conversionValue) ? 0 : conversionValue;
            break;
          case 'emptySessions':
            data[trainer][month] = trainerData?.totalEmptySessions || 0;
            break;
          case 'newMembers':
            data[trainer][month] = trainerData?.new || 0;
            break;
          case 'cycleSessions':
            data[trainer][month] = trainerData?.cycleSessions || 0;
            break;
          case 'barreSessions':
            data[trainer][month] = trainerData?.barreSessions || 0;
            break;
          case 'retainedMembers':
            data[trainer][month] = trainerData?.retained || 0;
            break;
          case 'convertedMembers':
            data[trainer][month] = trainerData?.converted || 0;
            break;
          default:
            data[trainer][month] = trainerData?.totalSessions || 0;
        }
      });
    });

    return { data, months, trainers };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading trainer performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error loading trainer performance data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!rawData || rawData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-slate-600">No trainer performance data available</p>
          </div>
        </div>
      </div>
    );
  }

  const metricCards = getMetricCards();
  const { data: monthOnMonthData, months, trainers } = getMonthOnMonthData();
  const trainerPerformanceData = getTrainerPerformanceData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Location Tabs */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
          <CardContent className="p-2">
            <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl h-auto gap-2">
                <TabsTrigger value="all" className="rounded-xl px-6 py-4 font-semibold text-sm transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <div className="text-center">
                      <div className="font-bold">All Locations</div>
                      <div className="text-xs opacity-80">Combined</div>
                    </div>
                  </div>
                </TabsTrigger>
                {LOCATION_MAPPING.map(location => (
                  <TabsTrigger 
                    key={location.id} 
                    value={location.id} 
                    className="rounded-xl px-6 py-4 font-semibold text-sm transition-all duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <div className="text-center">
                        <div className="font-bold">{location.name}</div>
                        <div className="text-xs opacity-80">Studio</div>
                      </div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Summary Cards */}
        {processedData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium opacity-90">Top Revenue Trainer</h3>
                    <p className="text-2xl font-bold">{processedData.topRevenueTrainer?.teacherName || 'N/A'}</p>
                    <p className="text-sm opacity-80">{formatCurrency(processedData.topRevenueTrainer?.totalPaid || 0)}</p>
                  </div>
                  <Crown className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium opacity-90">Most Sessions</h3>
                    <p className="text-2xl font-bold">{processedData.topSessionsTrainer?.teacherName || 'N/A'}</p>
                    <p className="text-sm opacity-80">{formatNumber(processedData.topSessionsTrainer?.totalSessions || 0)} sessions</p>
                  </div>
                  <Trophy className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium opacity-90">Most Members</h3>
                    <p className="text-2xl font-bold">{processedData.topCustomersTrainer?.teacherName || 'N/A'}</p>
                    <p className="text-sm opacity-80">{formatNumber(processedData.topCustomersTrainer?.totalCustomers || 0)} members</p>
                  </div>
                  <Star className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Filters */}
        {processedData && (
          <TrainerQuickFilters 
            activeFilters={quickFilters} 
            onFilterChange={(key, values) => setQuickFilters(prev => ({ ...prev, [key]: values }))} 
            trainerCount={processedData.trainerCount} 
            totalRevenue={processedData.totalRevenue} 
            avgPerformance={processedData.avgConversion} 
          />
        )}

        {/* Filter Section - Collapsed by default */}
        <TrainerFilterSection 
          data={filteredData} 
          onFiltersChange={setFilters} 
          isCollapsed={isFilterCollapsed} 
          onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)} 
        />

        {/* Enhanced Metric Cards */}
        {metricCards.length > 0 && (
          <EnhancedTrainerMetricCards cards={metricCards} />
        )}

        {/* Detailed Performance Table */}
        {filteredData.length > 0 && (
          <TrainerDetailedPerformanceTable data={filteredData} />
        )}

        {/* Top/Bottom Performers */}
        {trainerPerformanceData.length > 0 && (
          <TopBottomSellers data={trainerPerformanceData} type="trainers" title="Trainer Performance Rankings" />
        )}

        {/* Month-on-Month Analysis */}
        {months.length > 0 && trainers.length > 0 && (
          <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Month-on-Month Performance Analysis
                </CardTitle>
                <Tabs value={activeMetric} onValueChange={(value) => setActiveMetric(value as TrainerMetricType)}>
                  <TabsList className="bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl shadow-lg grid grid-cols-4 gap-1">
                    {[
                      { key: 'totalSessions' as const, label: 'Sessions', icon: Calendar, color: 'from-blue-500 to-cyan-600' },
                      { key: 'totalCustomers' as const, label: 'Members', icon: Users, color: 'from-green-500 to-emerald-600' },
                      { key: 'totalPaid' as const, label: 'Revenue', icon: DollarSign, color: 'from-purple-500 to-violet-600' },
                      { key: 'retention' as const, label: 'Retention', icon: Award, color: 'from-pink-500 to-rose-600' }
                    ].map(metric => {
                      const IconComponent = metric.icon;
                      return (
                        <TabsTrigger 
                          key={metric.key} 
                          value={metric.key} 
                          className={cn(
                            "rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-300",
                            "data-[state=active]:bg-gradient-to-r data-[state=active]:text-white data-[state=active]:shadow-lg",
                            "hover:bg-white/60",
                            `data-[state=active]:${metric.color}`
                          )}
                        >
                          <IconComponent className="w-3 h-3 mr-1" />
                          {metric.label}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <MonthOnMonthTrainerTable 
                data={monthOnMonthData} 
                months={months} 
                trainers={trainers} 
                defaultMetric={activeMetric} 
              />
            </CardContent>
          </Card>
        )}

        {/* Year-on-Year Comparison */}
        {months.length > 0 && trainers.length > 0 && (
          <YearOnYearTrainerTable 
            data={monthOnMonthData} 
            months={months} 
            trainers={trainers} 
            defaultMetric={activeMetric} 
          />
        )}
      </div>
    </div>
  );
};
