
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { OptimizedTable } from '@/components/ui/OptimizedTable';
import { YearOnYearMetricTabs } from './YearOnYearMetricTabs';
import { YearOnYearMetricType, SalesData } from '@/types/dashboard';
import { TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface YearOnYearData {
  year: string;
  currentYear: number;
  previousYear: number;
  difference: number;
  growthRate: number;
}

interface EnhancedYearOnYearTableProps {
  data: SalesData[];
  loading?: boolean;
  activeMetric: YearOnYearMetricType;
  onMetricChange: (value: YearOnYearMetricType) => void;
  onRowClick?: (item: any) => void;
  selectedMetric?: YearOnYearMetricType;
}

const formatValue = (value: number, metric: YearOnYearMetricType = "revenue"): string => {
  switch (metric) {
    case "revenue":
    case "atv":
    case "auv":
    case "asv":
      return formatCurrency(value);
    case "transactions":
    case "members":
    case "units":
      return formatNumber(value);
    case "upt":
      return value.toFixed(1);
    case "vat":
      return formatPercentage(value);
    default:
      return value.toString();
  }
};

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

const getMetricValue = (items: SalesData[], metric: YearOnYearMetricType) => {
  if (!items.length) return 0;
  const totalRevenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
  const totalTransactions = items.length;
  const uniqueMembers = new Set(items.map(item => item.memberId)).size;
  const totalUnits = items.length;
  
  switch (metric) {
    case 'revenue':
      return totalRevenue;
    case 'transactions':
      return totalTransactions;
    case 'members':
      return uniqueMembers;
    case 'units':
      return totalUnits;
    case 'atv':
      return totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    case 'auv':
      return totalUnits > 0 ? totalRevenue / totalUnits : 0;
    case 'asv':
      return uniqueMembers > 0 ? totalRevenue / uniqueMembers : 0;
    case 'upt':
      return totalTransactions > 0 ? totalUnits / totalTransactions : 0;
    case 'vat':
      return items.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
    default:
      return 0;
  }
};

export const EnhancedYearOnYearTable: React.FC<EnhancedYearOnYearTableProps> = ({
  data,
  loading = false,
  activeMetric,
  onMetricChange,
  onRowClick
}) => {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data by year
    const yearGroups: Record<string, SalesData[]> = {};
    
    data.forEach(item => {
      const itemDate = parseDate(item.paymentDate);
      if (itemDate) {
        const year = itemDate.getFullYear().toString();
        if (!yearGroups[year]) {
          yearGroups[year] = [];
        }
        yearGroups[year].push(item);
      }
    });

    const years = Object.keys(yearGroups).sort().reverse(); // Most recent first
    if (years.length < 2) return [];

    const currentYear = years[0];
    const previousYear = years[1];

    const currentYearValue = getMetricValue(yearGroups[currentYear] || [], activeMetric);
    const previousYearValue = getMetricValue(yearGroups[previousYear] || [], activeMetric);

    const difference = currentYearValue - previousYearValue;
    const growthRate = previousYearValue !== 0 ? (difference / previousYearValue) * 100 : 0;

    return [{
      year: `${currentYear} vs ${previousYear}`,
      currentYear: currentYearValue,
      previousYear: previousYearValue,
      difference: difference,
      growthRate: growthRate
    }];
  }, [data, activeMetric]);

  if (loading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-xl border-0 overflow-hidden">
      <CardHeader className="border-b border-gray-100 space-y-4 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Year-on-Year Performance Comparison
          </CardTitle>
          <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50 px-3 py-1">
            {processedData.length > 0 ? 'Comparison Available' : 'No Data'}
          </Badge>
        </div>
        
        <YearOnYearMetricTabs 
          value={activeMetric} 
          onValueChange={onMetricChange}
          className="w-full"
        />
      </CardHeader>
      
      <CardContent className="p-0">
        {processedData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No year-on-year comparison data available</p>
            <p className="text-sm mt-2">Need data from at least 2 different years</p>
          </div>
        ) : (
          <OptimizedTable
            data={processedData}
            columns={[
              { 
                key: 'year', 
                header: 'Comparison', 
                align: 'left',
                className: 'font-bold text-gray-800'
              },
              { 
                key: 'currentYear', 
                header: `Current Year (${activeMetric})`, 
                align: 'right',
                render: (value: number) => (
                  <span className="font-bold text-blue-600">
                    {formatValue(value, activeMetric)}
                  </span>
                )
              },
              { 
                key: 'previousYear', 
                header: `Previous Year (${activeMetric})`, 
                align: 'right',
                render: (value: number) => (
                  <span className="font-medium text-gray-600">
                    {formatValue(value, activeMetric)}
                  </span>
                )
              },
              { 
                key: 'difference', 
                header: 'Difference', 
                align: 'right',
                render: (value: number) => (
                  <span className={`font-bold ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {value >= 0 ? '+' : ''}{formatValue(value, activeMetric)}
                  </span>
                )
              },
              { 
                key: 'growthRate', 
                header: 'Growth Rate', 
                align: 'center',
                render: (value: number) => (
                  <Badge 
                    variant={value >= 0 ? "default" : "destructive"}
                    className={`px-3 py-1 font-bold w-[80px] justify-center ${
                      value >= 0 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}
                  >
                    {value >= 0 ? '+' : ''}{value.toFixed(1)}%
                  </Badge>
                )
              }
            ]}
            loading={loading}
            maxHeight="600px"
            stickyHeader={true}
            onRowClick={onRowClick}
            showFooter={false}
          />
        )}
      </CardContent>
    </Card>
  );
};
