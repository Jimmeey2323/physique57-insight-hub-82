
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewClientFilterSection } from './NewClientFilterSection';
import { ClientConversionCharts } from './ClientConversionCharts';
import { ClientAcquisitionFunnel } from './ClientAcquisitionFunnel';
import { ClientConversionTopBottomLists } from './ClientConversionTopBottomLists';
import { ClientConversionMetricCards } from './ClientConversionMetricCards';
import { ClientConversionDataTable } from './ClientConversionDataTable';
import { SourceDataModal } from '@/components/ui/SourceDataModal';
import { DrillDownModal } from './DrillDownModal';
import { Eye, BarChart3, Users, Target, TrendingUp, Database } from 'lucide-react';
import { NewClientData, NewClientFilterOptions } from '@/types/dashboard';

interface NewClientSectionProps {
  data: NewClientData[];
}

export const NewClientSection: React.FC<NewClientSectionProps> = ({ data }) => {
  const [showSourceData, setShowSourceData] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<NewClientFilterOptions>({
    dateRange: { start: '', end: '' },
    location: [],
    homeLocation: [],
    trainer: [],
    paymentMethod: [],
    retentionStatus: [],
    conversionStatus: [],
    isNew: [],
    minLTV: undefined,
    maxLTV: undefined
  });

  // Helper function to filter data
  const applyFilters = (rawData: NewClientData[]) => {
    if (!rawData || !Array.isArray(rawData)) {
      return [];
    }

    let filtered = rawData;

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

      filtered = filtered.filter(item => {
        if (!item.firstVisitDate) return false;
        const itemDate = new Date(item.firstVisitDate);
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      });
    }

    // Apply other filters
    if (filters.location?.length) {
      filtered = filtered.filter(item => filters.location!.includes(item.firstVisitLocation));
    }
    if (filters.homeLocation?.length) {
      filtered = filtered.filter(item => filters.homeLocation!.includes(item.homeLocation));
    }
    if (filters.trainer?.length) {
      filtered = filtered.filter(item => filters.trainer!.includes(item.trainerName));
    }
    if (filters.paymentMethod?.length) {
      filtered = filtered.filter(item => filters.paymentMethod!.includes(item.paymentMethod));
    }
    if (filters.retentionStatus?.length) {
      filtered = filtered.filter(item => filters.retentionStatus!.includes(item.retentionStatus));
    }
    if (filters.conversionStatus?.length) {
      filtered = filtered.filter(item => filters.conversionStatus!.includes(item.conversionStatus));
    }
    if (filters.isNew?.length) {
      filtered = filtered.filter(item => filters.isNew!.includes(item.isNew));
    }
    if (filters.minLTV !== undefined) {
      filtered = filtered.filter(item => (item.ltv || 0) >= filters.minLTV!);
    }
    if (filters.maxLTV !== undefined) {
      filtered = filtered.filter(item => (item.ltv || 0) <= filters.maxLTV!);
    }

    return filtered;
  };

  const filteredData = useMemo(() => applyFilters(data || []), [data, filters]);

  const handleItemClick = (item: any) => {
    console.log('Item clicked:', item);
    setDrillDownData(item);
  };

  const handleClientClick = (client: NewClientData) => {
    setDrillDownData({ ...client, type: 'client-detail' });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Client Conversion Analytics</h2>
          <p className="text-gray-600">Comprehensive analysis of client acquisition, conversion, and retention</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowSourceData(true)}
          className="gap-2 bg-white border-gray-200 hover:bg-gray-50"
        >
          <Database className="w-4 h-4" />
          View Source Data
        </Button>
      </div>

      {/* Filter Section */}
      <NewClientFilterSection
        filters={filters}
        onFiltersChange={setFilters}
        data={data || []}
      />

      {/* Summary Badge */}
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50 px-4 py-2">
          <Users className="w-4 h-4 mr-2" />
          {filteredData.length} clients analyzed
        </Badge>
        <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 px-4 py-2">
          <Target className="w-4 h-4 mr-2" />
          {filteredData.filter(c => c.conversionStatus === 'Converted').length} converted
        </Badge>
        <Badge variant="outline" className="text-purple-600 border-purple-600 bg-purple-50 px-4 py-2">
          <TrendingUp className="w-4 h-4 mr-2" />
          {filteredData.filter(c => c.retentionStatus === 'Retained').length} retained
        </Badge>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="font-medium">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="font-medium">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="performance" className="font-medium">
            <Target className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="detailed" className="font-medium">
            <Database className="w-4 h-4 mr-2" />
            Detailed View
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          <ClientConversionMetricCards data={filteredData} />
          <ClientAcquisitionFunnel data={filteredData} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-8">
          <ClientConversionCharts data={filteredData} />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-8">
          <ClientConversionTopBottomLists data={filteredData} onItemClick={handleItemClick} />
        </TabsContent>

        {/* Detailed View Tab */}
        <TabsContent value="detailed" className="space-y-8">
          <ClientConversionDataTable data={filteredData} onRowClick={handleClientClick} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {drillDownData && (
        <DrillDownModal
          isOpen={!!drillDownData}
          onClose={() => setDrillDownData(null)}
          data={drillDownData}
          type="member"
        />
      )}

      {showSourceData && (
        <SourceDataModal
          open={showSourceData}
          onOpenChange={setShowSourceData}
          sources={[
            {
              name: "New Clients Data",
              data: data,
              description: "Raw client conversion and retention data from Google Sheets"
            }
          ]}
        />
      )}
    </div>
  );
};

export default NewClientSection;
