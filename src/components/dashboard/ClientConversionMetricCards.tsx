
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, TrendingUp, DollarSign, Percent, Clock, UserCheck, Award, Activity, Calendar, Star, Zap } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionMetricCardsProps {
  data: NewClientData[];
}

export const ClientConversionMetricCards: React.FC<ClientConversionMetricCardsProps> = ({ data }) => {
  const totalClients = data.length;
  
  // Calculate conversion metrics
  const convertedClients = data.filter(client => client.conversionStatus === 'Converted').length;
  const retainedClients = data.filter(client => client.retentionStatus === 'Retained').length;
  const newClients = data.filter(client => client.isNew === 'Yes').length;
  const activeClients = data.filter(client => client.visitsPostTrial > 0).length;
  
  // Calculate LTV metrics
  const totalLTV = data.reduce((sum, client) => sum + (client.ltv || 0), 0);
  const avgLTV = totalClients > 0 ? totalLTV / totalClients : 0;
  const convertedLTV = data.filter(c => c.conversionStatus === 'Converted').reduce((sum, client) => sum + (client.ltv || 0), 0);
  const avgConvertedLTV = convertedClients > 0 ? convertedLTV / convertedClients : 0;
  
  // Calculate rates
  const conversionRate = totalClients > 0 ? (convertedClients / totalClients) * 100 : 0;
  const retentionRate = totalClients > 0 ? (retainedClients / totalClients) * 100 : 0;
  const newClientRate = totalClients > 0 ? (newClients / totalClients) * 100 : 0;
  const activationRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
  
  // Calculate average metrics
  const avgVisitsPostTrial = data.length > 0 
    ? data.reduce((sum, client) => sum + (client.visitsPostTrial || 0), 0) / data.length 
    : 0;
  
  const avgPurchaseCount = data.length > 0 
    ? data.reduce((sum, client) => sum + (client.purchaseCountPostTrial || 0), 0) / data.length 
    : 0;
  
  const avgConversionSpan = data.filter(c => c.conversionSpan > 0).length > 0 
    ? data.filter(c => c.conversionSpan > 0).reduce((sum, client) => sum + (client.conversionSpan || 0), 0) / data.filter(c => c.conversionSpan > 0).length
    : 0;

  const metrics = [
    {
      title: 'Total Clients',
      value: formatNumber(totalClients),
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'All client records',
      trend: '+12.5%'
    },
    {
      title: 'New Clients',
      value: formatNumber(newClients),
      icon: Star,
      gradient: 'from-emerald-500 to-green-600',
      description: `${newClientRate.toFixed(1)}% of total`,
      trend: '+8.3%'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate.toFixed(1)}%`,
      icon: Target,
      gradient: 'from-orange-500 to-red-600',
      description: 'Trial to paid conversion',
      trend: '+2.1%'
    },
    {
      title: 'Retention Rate',
      value: `${retentionRate.toFixed(1)}%`,
      icon: UserCheck,
      gradient: 'from-purple-500 to-violet-600',
      description: 'Client retention success',
      trend: '+5.7%'
    },
    {
      title: 'Total LTV',
      value: formatCurrency(totalLTV),
      icon: DollarSign,
      gradient: 'from-cyan-500 to-blue-600',
      description: 'Total lifetime value',
      trend: '+18.2%'
    },
    {
      title: 'Average LTV',
      value: formatCurrency(avgLTV),
      icon: TrendingUp,
      gradient: 'from-pink-500 to-rose-600',
      description: 'Per client average',
      trend: '+4.6%'
    },
    {
      title: 'Converted LTV',
      value: formatCurrency(avgConvertedLTV),
      icon: Award,
      gradient: 'from-amber-500 to-yellow-600',
      description: 'LTV of converted clients',
      trend: '+7.9%'
    },
    {
      title: 'Activation Rate',
      value: `${activationRate.toFixed(1)}%`,
      icon: Zap,
      gradient: 'from-teal-500 to-cyan-600',
      description: 'Clients with post-trial visits',
      trend: '+3.4%'
    },
    {
      title: 'Avg Visits Post Trial',
      value: avgVisitsPostTrial.toFixed(1),
      icon: Activity,
      gradient: 'from-indigo-500 to-purple-600',
      description: 'Average visits after trial',
      trend: '+1.8%'
    },
    {
      title: 'Avg Purchase Count',
      value: avgPurchaseCount.toFixed(1),
      icon: Percent,
      gradient: 'from-green-500 to-emerald-600',
      description: 'Purchases per client',
      trend: '+2.3%'
    },
    {
      title: 'Avg Conversion Time',
      value: `${avgConversionSpan.toFixed(0)} days`,
      icon: Clock,
      gradient: 'from-red-500 to-pink-600',
      description: 'Time to convert',
      trend: '-1.2 days'
    },
    {
      title: 'Active Clients',
      value: formatNumber(activeClients),
      icon: Calendar,
      gradient: 'from-violet-500 to-purple-600',
      description: 'Clients with activity',
      trend: '+6.8%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={metric.title} className="bg-white/95 backdrop-blur-sm shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
          <CardContent className="p-0">
            <div className={`bg-gradient-to-br ${metric.gradient} p-6 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 opacity-20">
                <metric.icon className="w-20 h-20" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <metric.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm">{metric.title}</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{metric.value}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs opacity-90">{metric.description}</p>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs px-2 py-1">
                      {metric.trend}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
