import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Target, CreditCard, Calendar } from 'lucide-react';
import { NewClientData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface ClientConversionChartsProps {
  data: NewClientData[];
}

export const ClientConversionCharts: React.FC<ClientConversionChartsProps> = ({ data }) => {
  const [activeChart, setActiveChart] = useState('area'); // 'line', 'bar', 'pie'

  // Data aggregation for charts
  const monthlyConversionData = useMemo(() => {
    const monthlyData = data.reduce((acc, item) => {
      if (!item.firstVisitDate) return acc;
      const date = new Date(item.firstVisitDate);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[month]) {
        acc[month] = {
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
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
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [data]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const pieData = useMemo(() => {
    const convertedCount = data.filter(item => item.conversionStatus === 'Converted').length;
    const retainedCount = data.filter(item => item.retentionStatus === 'Retained').length;
    const notConvertedCount = data.filter(item => item.conversionStatus !== 'Converted').length;

    return [
      { name: 'Converted', value: convertedCount },
      { name: 'Retained', value: retainedCount },
      { name: 'Not Converted', value: notConvertedCount }
    ];
  }, [data]);

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-md shadow-md p-3">
          <p className="font-semibold text-gray-800">{`${label}`}</p>
          {payload.map((item, index) => (
            <p key={`tooltip-item-${index}`} className="text-gray-700">
              {`${item.name}: ${formatNumber(item.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Conversion & Retention Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeChart} onValueChange={setActiveChart} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="area" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md transition-colors">Area Chart</TabsTrigger>
            <TabsTrigger value="line" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md transition-colors">Line Chart</TabsTrigger>
            <TabsTrigger value="bar" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md transition-colors">Bar Chart</TabsTrigger>
            <TabsTrigger value="pie" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md transition-colors">Pie Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="area" className="mt-4">
            <Card className="border-none shadow-none">
              <CardContent className="p-0">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={monthlyConversionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={renderCustomTooltip} />
                    <Area type="monotone" dataKey="newClients" stroke="#8884d8" fill="#8884d8" name="New Clients" />
                    <Area type="monotone" dataKey="conversions" stroke="#82ca9d" fill="#82ca9d" name="Conversions" />
                    <Area type="monotone" dataKey="retained" stroke="#ffc658" fill="#ffc658" name="Retained" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="line" className="mt-4">
            <Card className="border-none shadow-none">
              <CardContent className="p-0">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={monthlyConversionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend />
                    <Line type="monotone" dataKey="newClients" stroke="#8884d8" name="New Clients" />
                    <Line type="monotone" dataKey="conversions" stroke="#82ca9d" name="Conversions" />
                    <Line type="monotone" dataKey="retained" stroke="#ffc658" name="Retained" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bar" className="mt-4">
            <Card className="border-none shadow-none">
              <CardContent className="p-0">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={monthlyConversionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend />
                    <Bar dataKey="newClients" fill="#8884d8" name="New Clients" />
                    <Bar dataKey="conversions" fill="#82ca9d" name="Conversions" />
                    <Bar dataKey="retained" fill="#ffc658" name="Retained" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pie" className="mt-4">
            <Card className="border-none shadow-none">
              <CardContent className="p-0">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      isAnimationActive={false}
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={renderCustomTooltip} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
