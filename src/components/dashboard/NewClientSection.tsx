
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
import { Eye, BarChart3, Users, Target, TrendingUp, Database, Activity, UserCheck, Percent } from 'lucide-react';
import { NewClientData, NewClientFilterOptions } from '@/types/dashboard';

interface NewClientSectionProps {
  data: NewClientData[];
}

export const NewClientSection: React.FC<NewClientSectionProps> = ({ data }) => {
  const [showSourceData, setShowSourceData] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('metrics');
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

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalClients = filteredData.length;
    const newMembers = filteredData.filter(c => c.isNew === 'Yes').length;
    const convertedMembers = filteredData.filter(c => c.conversionStatus === 'Converted').length;
    const retainedMembers = filteredData.filter(c => c.retentionStatus === 'Retained').length;
    const trialsCompleted = filteredData.filter(c => c.visitsPostTrial > 0).length;
    
    const leadToTrialConversion = totalClients > 0 ? (trialsCompleted / totalClients) * 100 : 0;
    const trialToMemberConversion = trialsCompleted > 0 ? (convertedMembers / trialsCompleted) * 100 : 0;

    return {
      newMembers,
      convertedMembers,
      retainedMembers,
      trialsCompleted,
      leadToTrialConversion,
      trialToMemberConversion
    };
  }, [filteredData]);

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

      {/* Key Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">New Members</span>
            </div>
            <div className="text-2xl font-bold">{metrics.newMembers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Converted</span>
            </div>
            <div className="text-2xl font-bold">{metrics.convertedMembers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4" />
              <span className="text-sm font-medium">Retained</span>
            </div>
            <div className="text-2xl font-bold">{metrics.retainedMembers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Trials Completed</span>
            </div>
            <div className="text-2xl font-bold">{metrics.trialsCompleted}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4" />
              <span className="text-sm font-medium">Lead → Trial</span>
            </div>
            <div className="text-2xl font-bold">{metrics.leadToTrialConversion.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Trial → Member</span>
            </div>
            <div className="text-2xl font-bold">{metrics.trialToMemberConversion.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="metrics" className="font-medium">
            <BarChart3 className="w-4 h-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="sources" className="font-medium">
            <Target className="w-4 h-4 mr-2" />
            Lead Sources
          </TabsTrigger>
          <TabsTrigger value="stages" className="font-medium">
            <Activity className="w-4 h-4 mr-2" />
            Lead Stages
          </TabsTrigger>
          <TabsTrigger value="associates" className="font-medium">
            <Users className="w-4 h-4 mr-2" />
            Associates
          </TabsTrigger>
          <TabsTrigger value="detailed" className="font-medium">
            <Database className="w-4 h-4 mr-2" />
            Detailed View
          </TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-8">
          <ClientConversionMetricCards data={filteredData} />
          <ClientAcquisitionFunnel data={filteredData} />
        </TabsContent>

        {/* Lead Sources Tab */}
        <TabsContent value="sources" className="space-y-8">
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Lead Source Analytics</h3>
            <p className="text-gray-500">MoM, YoY, and Top/Bottom performance by source</p>
            <p className="text-sm text-gray-400 mt-2">Coming soon...</p>
          </div>
        </TabsContent>

        {/* Lead Stages Tab */}
        <TabsContent value="stages" className="space-y-8">
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Lead Stage Analytics</h3>
            <p className="text-gray-500">MoM, YoY, and Top/Bottom performance by stage</p>
            <p className="text-sm text-gray-400 mt-2">Coming soon...</p>
          </div>
        </TabsContent>

        {/* Associates Tab */}
        <TabsContent value="associates" className="space-y-8">
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
              data: data
            }
          ]}
        />
      )}
    </div>
  );
};

export default NewClientSection;
