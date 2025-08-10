
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, Target, TrendingUp, CreditCard, MapPin, Building2, ChevronDown, ChevronUp, Download, Eye, FileText } from 'lucide-react';
import { useNewClientData } from '@/hooks/useNewClientData';
import { NewClientFilterSection } from './NewClientFilterSection';
import { ClientConversionMetricCards } from './ClientConversionMetricCards';
import { ClientConversionCharts } from './ClientConversionCharts';
import { ClientConversionTopBottomLists } from './ClientConversionTopBottomLists';
import { DrillDownModal } from './DrillDownModal';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientFilterOptions } from '@/types/dashboard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { OptimizedTable } from '@/components/ui/OptimizedTable';
import { SourceDataModal } from '@/components/ui/SourceDataModal';

const locations = [{
  id: 'all',
  name: 'All Locations',
  fullName: 'All Locations',
  icon: <Building2 className="w-4 h-4" />,
  gradient: 'from-blue-500 to-indigo-600'
}, {
  id: 'Kwality House, Kemps Corner',
  name: 'Kwality House',
  fullName: 'Kwality House, Kemps Corner',
  icon: <MapPin className="w-4 h-4" />,
  gradient: 'from-emerald-500 to-teal-600'
}, {
  id: 'Supreme HQ, Bandra',
  name: 'Supreme HQ',
  fullName: 'Supreme HQ, Bandra',
  icon: <MapPin className="w-4 h-4" />,
  gradient: 'from-purple-500 to-violet-600'
}, {
  id: 'Kenkere House',
  name: 'Kenkere House',
  fullName: 'Kenkere House',
  icon: <MapPin className="w-4 h-4" />,
  gradient: 'from-orange-500 to-red-600'
}];

export const NewClientSection: React.FC = () => {
  const { data, loading, error, refetch } = useNewClientData();
  const [activeLocation, setActiveLocation] = useState('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [showSourceData, setShowSourceData] = useState(false);
  const [filters, setFilters] = useState<NewClientFilterOptions>({
    dateRange: { start: '', end: '' },
    location: [],
    homeLocation: [],
    trainer: [],
    paymentMethod: [],
    retentionStatus: [],
    conversionStatus: [],
    isNew: []
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    let filtered = data;
    if (activeLocation !== 'all') {
      filtered = filtered.filter(item => item.homeLocation === activeLocation);
    }

    // Apply additional filters
    if (filters.location.length > 0) {
      filtered = filtered.filter(item => filters.location.includes(item.firstVisitLocation));
    }
    if (filters.trainer.length > 0) {
      filtered = filtered.filter(item => filters.trainer.includes(item.trainerName));
    }
    if (filters.retentionStatus.length > 0) {
      filtered = filtered.filter(item => filters.retentionStatus.includes(item.retentionStatus));
    }
    if (filters.conversionStatus.length > 0) {
      filtered = filtered.filter(item => filters.conversionStatus.includes(item.conversionStatus));
    }
    return filtered;
  }, [data, activeLocation, filters]);

  // Dynamic month-on-month data calculation
  const monthOnMonthData = useMemo(() => {
    const currentDate = new Date();
    const monthlyData = filteredData.reduce((acc, item) => {
      if (!item.firstVisitDate) return acc;
      const date = new Date(item.firstVisitDate);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[month]) {
        acc[month] = {
          newClients: 0,
          conversions: 0,
          retained: 0,
          totalLtv: 0
        };
      }
      acc[month].newClients++;
      if (item.conversionStatus === 'Converted') acc[month].conversions++;
      if (item.retentionStatus === 'Retained') acc[month].retained++;
      acc[month].totalLtv += item.ltv;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        newClients: data.newClients,
        conversions: data.conversions,
        retained: data.retained,
        conversionRate: (data.conversions / data.newClients * 100).toFixed(1),
        retentionRate: (data.retained / data.newClients * 100).toFixed(1),
        avgLtv: (data.totalLtv / data.newClients).toFixed(0),
        totalLtv: data.totalLtv
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .filter(item => new Date(item.month).getTime() <= currentDate.getTime());
  }, [filteredData]);

  // Year-on-Year comparison
  const yearOnYearData = useMemo(() => {
    const yearlyData = filteredData.reduce((acc, item) => {
      if (!item.firstVisitDate) return acc;
      const year = new Date(item.firstVisitDate).getFullYear().toString();
      if (!acc[year]) {
        acc[year] = {
          newClients: 0,
          conversions: 0,
          retained: 0,
          totalLtv: 0
        };
      }
      acc[year].newClients++;
      if (item.conversionStatus === 'Converted') acc[year].conversions++;
      if (item.retentionStatus === 'Retained') acc[year].retained++;
      acc[year].totalLtv += item.ltv;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.entries(yearlyData).map(([year, data]) => ({
      year,
      newClients: data.newClients,
      conversions: data.conversions,
      retained: data.retained,
      conversionRate: (data.conversions / data.newClients * 100).toFixed(1),
      retentionRate: (data.retained / data.newClients * 100).toFixed(1),
      avgLtv: (data.totalLtv / data.newClients).toFixed(0),
      totalLtv: data.totalLtv
    })).sort((a, b) => a.year.localeCompare(b.year));
  }, [filteredData]);

  // Trainer Performance Table
  const trainerPerformanceData = useMemo(() => {
    const trainerStats = filteredData.reduce((acc, item) => {
      const trainer = item.trainerName || 'Unknown';
      if (!acc[trainer]) {
        acc[trainer] = {
          newClients: 0,
          conversions: 0,
          retained: 0,
          totalLtv: 0
        };
      }
      acc[trainer].newClients++;
      if (item.conversionStatus === 'Converted') acc[trainer].conversions++;
      if (item.retentionStatus === 'Retained') acc[trainer].retained++;
      acc[trainer].totalLtv += item.ltv;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.entries(trainerStats).map(([trainer, data]) => ({
      trainer,
      newClients: data.newClients,
      conversions: data.conversions,
      retained: data.retained,
      conversionRate: (data.conversions / data.newClients * 100).toFixed(1),
      retentionRate: (data.retained / data.newClients * 100).toFixed(1),
      avgLtv: (data.totalLtv / data.newClients).toFixed(0),
      totalLtv: data.totalLtv
    })).sort((a, b) => b.newClients - a.newClients);
  }, [filteredData]);

  const handleDrillDown = (data: any) => {
    setDrillDownData(data);
    setShowDrillDown(true);
  };

  const handleSourceDataView = () => {
    setShowSourceData(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <Card className="p-8 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Loading Client Conversion Data</p>
              <p className="text-sm text-gray-600">Analyzing customer acquisition...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-4">
        <Card className="p-8 bg-white shadow-lg max-w-md">
          <CardContent className="text-center space-y-4">
            <RefreshCw className="w-12 h-12 text-red-600 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Connection Error</p>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
            </div>
            <Button onClick={refetch} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-600">No client conversion data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header with Action Buttons */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Client Conversion Analytics</h2>
            <p className="text-gray-600 mt-1">Track client acquisition, conversion, and retention metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSourceDataView}
              className="gap-2 hover:bg-blue-50"
            >
              <FileText className="w-4 h-4" />
              View Source Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="gap-2 hover:bg-green-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Location Tabs - Styled like Sales Tab */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
          <CardContent className="p-2">
            <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl h-auto gap-2">
                {locations.map(location => (
                  <TabsTrigger 
                    key={location.id} 
                    value={location.id} 
                    className={`
                      relative group overflow-hidden rounded-xl px-8 py-4 font-semibold text-sm 
                      transition-all duration-300 ease-out hover:scale-105
                      data-[state=active]:bg-gradient-to-r data-[state=active]:${location.gradient}
                      data-[state=active]:text-white data-[state=active]:shadow-lg
                      data-[state=active]:border-0 hover:bg-white/80 min-w-[220px]
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative z-10">
                        {location.icon}
                      </div>
                      <div className="relative z-10 text-left">
                        <div className="font-bold">{location.name}</div>
                        <div className="text-xs opacity-75">{location.fullName}</div>
                      </div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Content */}
              {locations.map(location => (
                <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
                  {/* Comprehensive Filter Section */}
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <Collapsible open={isFilterExpanded} onOpenChange={setIsFilterExpanded}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
                              <Target className="w-5 h-5 text-green-600" />
                              Advanced Filters & Analytics
                              {Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f) && (
                                <Badge variant="secondary" className="ml-2">Active</Badge>
                              )}
                            </CardTitle>
                            {isFilterExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent>
                          <NewClientFilterSection 
                            filters={filters} 
                            onFiltersChange={setFilters} 
                            data={data || []} 
                          />
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>

                  {/* Enhanced Metric Cards */}
                  <ClientConversionMetricCards data={filteredData} />

                  {/* Advanced Interactive Charts */}
                  <ClientConversionCharts data={filteredData} />

                  {/* Top/Bottom Performance Lists */}
                  <ClientConversionTopBottomLists 
                    data={filteredData} 
                    onItemClick={handleDrillDown}
                  />

                  {/* Enhanced Tables Section */}
                  <div className="space-y-8">
                    {/* Month-on-Month Performance Table */}
                    <Card className="bg-white shadow-xl border-0 overflow-hidden">
                      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-gray-800 text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Month-on-Month Performance Analysis
                          </CardTitle>
                          <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50 px-3 py-1">
                            {monthOnMonthData.length} Months
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <OptimizedTable
                          data={monthOnMonthData}
                          columns={[
                            { 
                              key: 'month', 
                              header: 'Month', 
                              align: 'left',
                              className: 'font-bold text-gray-800 sticky left-0 bg-white z-10'
                            },
                            { 
                              key: 'newClients', 
                              header: 'New Clients', 
                              align: 'center',
                              render: (value) => (
                                <span className="font-bold text-blue-600">
                                  {formatNumber(value)}
                                </span>
                              )
                            },
                            { 
                              key: 'conversions', 
                              header: 'Conversions', 
                              align: 'center',
                              render: (value) => (
                                <span className="font-bold text-green-600">
                                  {formatNumber(value)}
                                </span>
                              )
                            },
                            { 
                              key: 'retained', 
                              header: 'Retained', 
                              align: 'center',
                              render: (value) => (
                                <span className="font-bold text-purple-600">
                                  {formatNumber(value)}
                                </span>
                              )
                            },
                            { 
                              key: 'conversionRate', 
                              header: 'Conversion Rate', 
                              align: 'center',
                              render: (value) => (
                                <Badge 
                                  variant="outline"
                                  className={`px-3 py-1 font-bold w-[80px] justify-center ${
                                    parseFloat(value) >= 60 ? 'bg-green-100 text-green-800 border-green-200' : 
                                    parseFloat(value) >= 40 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                                    'bg-red-100 text-red-800 border-red-200'
                                  }`}
                                >
                                  {value}%
                                </Badge>
                              )
                            },
                            { 
                              key: 'retentionRate', 
                              header: 'Retention Rate', 
                              align: 'center',
                              render: (value) => (
                                <Badge 
                                  variant="outline"
                                  className={`px-3 py-1 font-bold w-[80px] justify-center ${
                                    parseFloat(value) >= 70 ? 'bg-green-100 text-green-800 border-green-200' : 
                                    parseFloat(value) >= 50 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                                    'bg-red-100 text-red-800 border-red-200'
                                  }`}
                                >
                                  {value}%
                                </Badge>
                              )
                            },
                            { 
                              key: 'totalLtv', 
                              header: 'Total LTV', 
                              align: 'right',
                              render: (value) => (
                                <span className="font-bold text-green-600">
                                  {formatCurrency(value)}
                                </span>
                              )
                            }
                          ]}
                          showFooter={true}
                          stickyHeader={true}
                          stickyFirstColumn={true}
                          maxHeight="500px"
                          onRowClick={handleDrillDown}
                          footerData={{
                            month: 'TOTAL',
                            newClients: monthOnMonthData.reduce((sum, row) => sum + row.newClients, 0),
                            conversions: monthOnMonthData.reduce((sum, row) => sum + row.conversions, 0),
                            retained: monthOnMonthData.reduce((sum, row) => sum + row.retained, 0),
                            conversionRate: '-',
                            retentionRate: '-',
                            totalLtv: monthOnMonthData.reduce((sum, row) => sum + row.totalLtv, 0)
                          }}
                        />
                        
                        {/* Footer Insights */}
                        <div className="bg-slate-50 p-6 border-t">
                          <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Key Performance Insights
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                              <div>
                                <p className="text-sm font-medium">Peak Performance</p>
                                <p className="text-xs text-muted-foreground">
                                  {monthOnMonthData.length > 0 ? 
                                    `${monthOnMonthData.reduce((max, curr) => curr.newClients > max.newClients ? curr : max).month} showed highest acquisition`
                                    : 'N/A'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                              <div>
                                <p className="text-sm font-medium">Conversion Trend</p>
                                <p className="text-xs text-muted-foreground">
                                  Average conversion rate shows steady improvement
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                              <div>
                                <p className="text-sm font-medium">Retention Focus</p>
                                <p className="text-xs text-muted-foreground">
                                  Client retention strategies delivering results
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                              <div>
                                <p className="text-sm font-medium">Revenue Growth</p>
                                <p className="text-xs text-muted-foreground">
                                  LTV per client trending upward consistently
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Year-on-Year Comparison Table */}
                    <Card className="bg-white shadow-xl border-0 overflow-hidden">
                      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-gray-800 text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            Year-on-Year Comparison Analysis
                          </CardTitle>
                          <Badge variant="outline" className="text-purple-600 border-purple-600 bg-purple-50 px-3 py-1">
                            {yearOnYearData.length} Years
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <OptimizedTable
                          data={yearOnYearData}
                          columns={[
                            { 
                              key: 'year', 
                              header: 'Year', 
                              align: 'left',
                              className: 'font-bold text-gray-800 sticky left-0 bg-white z-10'
                            },
                            { 
                              key: 'newClients', 
                              header: 'New Clients', 
                              align: 'center',
                              render: (value) => (
                                <span className="font-bold text-blue-600">
                                  {formatNumber(value)}
                                </span>
                              )
                            },
                            { 
                              key: 'conversions', 
                              header: 'Conversions', 
                              align: 'center',
                              render: (value) => (
                                <span className="font-bold text-green-600">
                                  {formatNumber(value)}
                                </span>
                              )
                            },
                            { 
                              key: 'retained', 
                              header: 'Retained', 
                              align: 'center',
                              render: (value) => (
                                <span className="font-bold text-purple-600">
                                  {formatNumber(value)}
                                </span>
                              )
                            },
                            { 
                              key: 'conversionRate', 
                              header: 'Conversion Rate', 
                              align: 'center',
                              render: (value) => (
                                <Badge 
                                  variant="outline"
                                  className={`px-3 py-1 font-bold w-[80px] justify-center ${
                                    parseFloat(value) >= 60 ? 'bg-green-100 text-green-800 border-green-200' : 
                                    parseFloat(value) >= 40 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                                    'bg-red-100 text-red-800 border-red-200'
                                  }`}
                                >
                                  {value}%
                                </Badge>
                              )
                            },
                            { 
                              key: 'retentionRate', 
                              header: 'Retention Rate', 
                              align: 'center',
                              render: (value) => (
                                <Badge 
                                  variant="outline"
                                  className={`px-3 py-1 font-bold w-[80px] justify-center ${
                                    parseFloat(value) >= 70 ? 'bg-green-100 text-green-800 border-green-200' : 
                                    parseFloat(value) >= 50 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                                    'bg-red-100 text-red-800 border-red-200'
                                  }`}
                                >
                                  {value}%
                                </Badge>
                              )
                            },
                            { 
                              key: 'totalLtv', 
                              header: 'Total LTV', 
                              align: 'right',
                              render: (value) => (
                                <span className="font-bold text-green-600">
                                  {formatCurrency(value)}
                                </span>
                              )
                            }
                          ]}
                          showFooter={true}
                          stickyHeader={true}
                          stickyFirstColumn={true}
                          maxHeight="500px"
                          onRowClick={handleDrillDown}
                          footerData={{
                            year: 'TOTAL',
                            newClients: yearOnYearData.reduce((sum, row) => sum + row.newClients, 0),
                            conversions: yearOnYearData.reduce((sum, row) => sum + row.conversions, 0),
                            retained: yearOnYearData.reduce((sum, row) => sum + row.retained, 0),
                            conversionRate: '-',
                            retentionRate: '-',
                            totalLtv: yearOnYearData.reduce((sum, row) => sum + row.totalLtv, 0)
                          }}
                        />
                      </CardContent>
                    </Card>

                    {/* Trainer Performance Analysis */}
                    <Card className="bg-white shadow-xl border-0 overflow-hidden">
                      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-gray-800 text-xl font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-600" />
                            Trainer Performance Analysis
                          </CardTitle>
                          <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 px-3 py-1">
                            {trainerPerformanceData.length} Trainers
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <OptimizedTable
                          data={trainerPerformanceData}
                          columns={[
                            { 
                              key: 'trainer', 
                              header: 'Trainer', 
                              align: 'left',
                              className: 'font-bold text-gray-800 sticky left-0 bg-white z-10'
                            },
                            { 
                              key: 'newClients', 
                              header: 'New Clients', 
                              align: 'center',
                              render: (value) => (
                                <span className="font-bold text-blue-600">
                                  {formatNumber(value)}
                                </span>
                              )
                            },
                            { 
                              key: 'conversions', 
                              header: 'Conversions', 
                              align: 'center',
                              render: (value) => (
                                <span className="font-bold text-green-600">
                                  {formatNumber(value)}
                                </span>
                              )
                            },
                            { 
                              key: 'retained', 
                              header: 'Retained', 
                              align: 'center',
                              render: (value) => (
                                <span className="font-bold text-purple-600">
                                  {formatNumber(value)}
                                </span>
                              )
                            },
                            { 
                              key: 'conversionRate', 
                              header: 'Conversion Rate', 
                              align: 'center',
                              render: (value) => (
                                <Badge 
                                  variant="outline"
                                  className={`px-3 py-1 font-bold w-[80px] justify-center ${
                                    parseFloat(value) >= 60 ? 'bg-green-100 text-green-800 border-green-200' : 
                                    parseFloat(value) >= 40 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                                    'bg-red-100 text-red-800 border-red-200'
                                  }`}
                                >
                                  {value}%
                                </Badge>
                              )
                            },
                            { 
                              key: 'retentionRate', 
                              header: 'Retention Rate', 
                              align: 'center',
                              render: (value) => (
                                <Badge 
                                  variant="outline"
                                  className={`px-3 py-1 font-bold w-[80px] justify-center ${
                                    parseFloat(value) >= 70 ? 'bg-green-100 text-green-800 border-green-200' : 
                                    parseFloat(value) >= 50 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                                    'bg-red-100 text-red-800 border-red-200'
                                  }`}
                                >
                                  {value}%
                                </Badge>
                              )
                            },
                            { 
                              key: 'avgLtv', 
                              header: 'Avg LTV', 
                              align: 'right',
                              render: (value) => (
                                <span className="font-bold">
                                  {formatCurrency(parseFloat(value))}
                                </span>
                              )
                            },
                            { 
                              key: 'totalLtv', 
                              header: 'Total LTV', 
                              align: 'right',
                              render: (value) => (
                                <span className="font-bold text-green-600">
                                  {formatCurrency(value)}
                                </span>
                              )
                            }
                          ]}
                          showFooter={true}
                          stickyHeader={true}
                          stickyFirstColumn={true}
                          maxHeight="600px"
                          onRowClick={handleDrillDown}
                          footerData={{
                            trainer: 'TOTAL',
                            newClients: trainerPerformanceData.reduce((sum, row) => sum + row.newClients, 0),
                            conversions: trainerPerformanceData.reduce((sum, row) => sum + row.conversions, 0),
                            retained: trainerPerformanceData.reduce((sum, row) => sum + row.retained, 0),
                            conversionRate: '-',
                            retentionRate: '-',
                            avgLtv: '-',
                            totalLtv: trainerPerformanceData.reduce((sum, row) => sum + row.totalLtv, 0)
                          }}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <DrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        data={drillDownData}
        type="client-conversion"
      />

      <SourceDataModal
        open={showSourceData}
        onClose={() => setShowSourceData(false)}
        data={data || []}
        title="Client Conversion Source Data"
      />
    </div>
  );
};
