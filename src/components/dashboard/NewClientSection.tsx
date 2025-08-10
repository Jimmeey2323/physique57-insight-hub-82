import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from './DataTable';
import { InteractiveChart } from './InteractiveChart';
import { AutoCloseFilterSection } from './AutoCloseFilterSection';
import { ClientConversionCharts } from './ClientConversionCharts';
import { ClientAcquisitionFunnel } from './ClientAcquisitionFunnel';
import { ClientConversionTopBottomLists } from './ClientConversionTopBottomLists';
import { SourceDataModal } from '@/components/ui/SourceDataModal';
import { DrillDownModal } from './DrillDownModal';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { NewClientData, NewClientFilterOptions } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface NewClientSectionProps {
  data: NewClientData[];
}

const locations = [{
  id: 'kwality',
  name: 'Kwality House, Kemps Corner',
  fullName: 'Kwality House, Kemps Corner'
}, {
  id: 'supreme',
  name: 'Supreme HQ, Bandra',
  fullName: 'Supreme HQ, Bandra'
}, {
  id: 'kenkere',
  name: 'Kenkere House',
  fullName: 'Kenkere House'
}];

const trainers = [{
  id: 'trainer1',
  name: 'Trainer 1'
}, {
  id: 'trainer2',
  name: 'Trainer 2'
}, {
  id: 'trainer3',
  name: 'Trainer 3'
}];

export const NewClientSection: React.FC<NewClientSectionProps> = ({
  data
}) => {
  const [activeLocation, setActiveLocation] = useState('kwality');
  const [showSourceData, setShowSourceData] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [filters, setFilters] = useState<NewClientFilterOptions>({
    dateRange: {
      start: '',
      end: ''
    },
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

    // Apply location filter
    if (filters.location?.length) {
      filtered = filtered.filter(item => filters.location!.includes(item.firstVisitLocation));
    }

    // Apply home location filter
    if (filters.homeLocation?.length) {
      filtered = filtered.filter(item => filters.homeLocation!.includes(item.homeLocation));
    }

    // Apply trainer filter
    if (filters.trainer?.length) {
      filtered = filtered.filter(item => filters.trainer!.includes(item.trainerName));
    }

    // Apply payment method filter
    if (filters.paymentMethod?.length) {
      filtered = filtered.filter(item => filters.paymentMethod!.includes(item.paymentMethod));
    }

    // Apply retention status filter
    if (filters.retentionStatus?.length) {
      filtered = filtered.filter(item => filters.retentionStatus!.includes(item.retentionStatus));
    }

    // Apply conversion status filter
    if (filters.conversionStatus?.length) {
      filtered = filtered.filter(item => filters.conversionStatus!.includes(item.conversionStatus));
    }

    // Apply isNew filter
    if (filters.isNew?.length) {
      filtered = filtered.filter(item => filters.isNew!.includes(item.isNew));
    }

    // Apply LTV range filter
    if (filters.minLTV !== undefined) {
      filtered = filtered.filter(item => (item.ltv || 0) >= filters.minLTV!);
    }
    if (filters.maxLTV !== undefined) {
      filtered = filtered.filter(item => (item.ltv || 0) <= filters.maxLTV!);
    }

    return filtered;
  };

  const filteredData = useMemo(() => applyFilters(data || []), [data, filters]);

  const resetFilters = () => {
    setFilters({
      dateRange: {
        start: '',
        end: ''
      },
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
  };

  const handleItemClick = (item: any) => {
    console.log('Item clicked:', item);
    setDrillDownData(item);
  };

  return (
    <>
      <div className="space-y-8">
        {/* Filter and Location Tabs */}
        <div className="space-y-6">
          {/* Filters */}
          <AutoCloseFilterSection
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
            isClientSection={true}
          />

          {/* Conversion Charts */}
          <ClientConversionCharts data={filteredData} />

          {/* Top/Bottom Lists */}
          <ClientConversionTopBottomLists data={filteredData} onItemClick={handleItemClick} />

          {/* Acquisition Funnel */}
          <ClientAcquisitionFunnel data={filteredData} />

          {/* Drill Down Modal */}
          {drillDownData && (
            <DrillDownModal
              isOpen={!!drillDownData}
              onClose={() => setDrillDownData(null)}
              data={drillDownData}
              type="member"
            />
          )}

          {/* Source Data Modal */}
          {showSourceData && (
            <SourceDataModal
              open={showSourceData}
              onOpenChange={setShowSourceData}
              sources={[
                {
                  name: "New Clients",
                  data: data
                }
              ]}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default NewClientSection;
