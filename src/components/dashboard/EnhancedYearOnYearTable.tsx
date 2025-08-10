
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { OptimizedTable } from '@/components/ui/OptimizedTable';
import { YearOnYearMetricTabs } from './YearOnYearMetricTabs';
import { YearOnYearMetricType } from '@/types/dashboard';
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
  data: any[];
  loading: boolean;
  activeMetric: YearOnYearMetricType;
  onMetricChange: (value: YearOnYearMetricType) => void;
  onRowClick?: (item: any) => void;
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

export const EnhancedYearOnYearTable: React.FC<EnhancedYearOnYearTableProps> = ({
  data,
  loading,
  activeMetric,
  onMetricChange,
  onRowClick
}) => {
  const processedData = useMemo(() => {
    if (!data || data.length < 2) return [];

    const currentYearData = data[0];
    const previousYearData = data[1];

    const currentYearValue = currentYearData?.[activeMetric] || 0;
    const previousYearValue = previousYearData?.[activeMetric] || 0;

    const difference = currentYearValue - previousYearValue;
    const growthRate = previousYearValue !== 0 ? (difference / previousYearValue) * 100 : 0;

    return [{
      year: currentYearData?.year || 'Current',
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
            {processedData.length} Years
          </Badge>
        </div>
        
        <YearOnYearMetricTabs 
          value={activeMetric} 
          onValueChange={onMetricChange}
          className="w-full"
        />
      </CardHeader>
      
      <CardContent className="p-0">
        <OptimizedTable
          data={processedData}
          columns={[
            { 
              key: 'year', 
              header: 'Year', 
              align: 'left',
              className: 'font-bold text-gray-800'
            },
            { 
              key: 'currentYear', 
              header: `Current (${activeMetric})`, 
              align: 'right',
              render: (value: number) => (
                <span className="font-bold text-blue-600">
                  {formatValue(value, activeMetric)}
                </span>
              )
            },
            { 
              key: 'previousYear', 
              header: `Previous (${activeMetric})`, 
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
          showFooter={true}
          footerData={{
            year: 'TOTAL',
            currentYear: processedData.reduce((sum, row) => sum + (row.currentYear || 0), 0),
            previousYear: processedData.reduce((sum, row) => sum + (row.previousYear || 0), 0),
            difference: processedData.reduce((sum, row) => sum + (row.difference || 0), 0),
            growthRate: processedData.length > 0 
              ? processedData.reduce((sum, row) => sum + (row.growthRate || 0), 0) / processedData.length 
              : 0
          }}
        />
      </CardContent>
    </Card>
  );
};
