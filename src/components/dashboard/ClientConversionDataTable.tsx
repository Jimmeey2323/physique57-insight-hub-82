
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Search, Filter, Download, Eye, Users, Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionDataTableProps {
  data: NewClientData[];
  onRowClick?: (client: NewClientData) => void;
}

export const ClientConversionDataTable: React.FC<ClientConversionDataTableProps> = ({
  data,
  onRowClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'converted' | 'retained' | 'new'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(client => 
        client.firstName?.toLowerCase().includes(search) ||
        client.lastName?.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search) ||
        client.phoneNumber?.includes(search) ||
        client.homeLocation?.toLowerCase().includes(search) ||
        client.trainerName?.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'converted':
          filtered = filtered.filter(client => client.conversionStatus === 'Converted');
          break;
        case 'retained':
          filtered = filtered.filter(client => client.retentionStatus === 'Retained');
          break;
        case 'new':
          filtered = filtered.filter(client => client.isNew === 'Yes');
          break;
      }
    }

    return filtered;
  }, [data, searchTerm, statusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getStatusBadge = (status: string, type: 'conversion' | 'retention') => {
    const isPositive = status === 'Converted' || status === 'Retained';
    return (
      <Badge 
        variant={isPositive ? 'default' : 'secondary'}
        className={`text-xs font-medium px-2 py-1 ${
          isPositive 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-gray-100 text-gray-600 border-gray-200'
        }`}
      >
        {status || 'Unknown'}
      </Badge>
    );
  };

  const getNewClientBadge = (isNew: string) => {
    return (
      <Badge 
        variant={isNew === 'Yes' ? 'default' : 'secondary'}
        className={`text-xs font-medium px-2 py-1 ${
          isNew === 'Yes' 
            ? 'bg-blue-100 text-blue-800 border-blue-200' 
            : 'bg-gray-100 text-gray-600 border-gray-200'
        }`}
      >
        {isNew === 'Yes' ? 'New' : 'Existing'}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'firstName' as keyof NewClientData,
      header: 'Client Name',
      render: (value: any, item: NewClientData) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {item.firstName?.charAt(0)}{item.lastName?.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">
              {item.firstName} {item.lastName}
            </p>
            <p className="text-xs text-gray-500">{item.email}</p>
          </div>
        </div>
      ),
      width: '250px'
    },
    {
      key: 'memberId' as keyof NewClientData,
      header: 'Member ID',
      render: (value: any) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{value}</span>
      ),
      width: '120px'
    },
    {
      key: 'firstVisitDate' as keyof NewClientData,
      header: 'First Visit',
      render: (value: any) => (
        <div className="text-sm">
          {value ? new Date(value).toLocaleDateString() : '-'}
        </div>
      ),
      width: '120px'
    },
    {
      key: 'homeLocation' as keyof NewClientData,
      header: 'Location',
      render: (value: any) => (
        <span className="text-sm text-gray-700 truncate max-w-[120px]" title={value}>
          {value || '-'}
        </span>
      ),
      width: '140px'
    },
    {
      key: 'trainerName' as keyof NewClientData,
      header: 'Trainer',
      render: (value: any) => (
        <span className="text-sm text-gray-700">{value || '-'}</span>
      ),
      width: '120px'
    },
    {
      key: 'isNew' as keyof NewClientData,
      header: 'Status',
      render: (value: any) => getNewClientBadge(value),
      align: 'center' as const,
      width: '100px'
    },
    {
      key: 'conversionStatus' as keyof NewClientData,
      header: 'Conversion',
      render: (value: any) => getStatusBadge(value, 'conversion'),
      align: 'center' as const,
      width: '120px'
    },
    {
      key: 'retentionStatus' as keyof NewClientData,
      header: 'Retention',
      render: (value: any) => getStatusBadge(value, 'retention'),
      align: 'center' as const,
      width: '120px'
    },
    {
      key: 'visitsPostTrial' as keyof NewClientData,
      header: 'Visits',
      render: (value: any) => (
        <div className="text-center">
          <span className="font-semibold text-blue-600">{formatNumber(value || 0)}</span>
        </div>
      ),
      align: 'center' as const,
      width: '80px'
    },
    {
      key: 'purchaseCountPostTrial' as keyof NewClientData,
      header: 'Purchases',
      render: (value: any) => (
        <div className="text-center">
          <span className="font-semibold text-green-600">{formatNumber(value || 0)}</span>
        </div>
      ),
      align: 'center' as const,
      width: '100px'
    },
    {
      key: 'ltv' as keyof NewClientData,
      header: 'LTV',
      render: (value: any) => (
        <div className="text-right">
          <span className="font-semibold text-orange-600">{formatCurrency(value || 0)}</span>
        </div>
      ),
      align: 'right' as const,
      width: '120px'
    }
  ];

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Client Conversion Analytics
          </CardTitle>
          <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50 px-3 py-1">
            {filteredData.length} clients
          </Badge>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="text-xs"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'new' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('new')}
              className="text-xs"
            >
              New
            </Button>
            <Button
              variant={statusFilter === 'converted' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('converted')}
              className="text-xs"
            >
              Converted
            </Button>
            <Button
              variant={statusFilter === 'retained' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('retained')}
              className="text-xs"
            >
              Retained
            </Button>
          </div>
          
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ModernDataTable
          data={paginatedData}
          columns={columns}
          onRowClick={onRowClick}
          maxHeight="600px"
          stickyHeader={true}
        />
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} clients
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
