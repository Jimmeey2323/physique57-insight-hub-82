
import { useState, useEffect } from 'react';
import { SalesData } from '@/types/dashboard';

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-007ermh3iidknbbtdmu5vct207mdlbaa.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//04MmvT_BibTsBCgYIARAAGAQSNwF-L9IrG9yxJvvQRMLPR39xzWSrqfTVMkvq3WcZqsDO2HjUkV6s7vo1pQkex4qGF3DITTiweAA",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SPREADSHEET_ID = "149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI";

export const useGoogleSheets = () => {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = async () => {
    try {
      const response = await fetch(GOOGLE_CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CONFIG.CLIENT_ID,
          client_secret: GOOGLE_CONFIG.CLIENT_SECRET,
          refresh_token: GOOGLE_CONFIG.REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      });

      const tokenData = await response.json();
      return tokenData.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sales?alt=json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      const rows = result.values || [];
      
      if (rows.length < 2) {
        setData([]);
        return;
      }

      const salesData: SalesData[] = rows.slice(1).map((row: any[]) => ({
        memberId: row[0] || '',
        customerName: row[1] || '',
        customerEmail: row[2] || '',
        payingMemberId: row[0] || '', // Using Member ID for consistency
        saleItemId: row[3] || '',
        paymentCategory: row[4] || '',
        membershipType: row[24] || '',
        paymentDate: row[5] || '',
        paymentValue: parseFloat(row[6]) || 0,
        paidInMoneyCredits: parseFloat(row[7]) || 0,
        paymentVAT: parseFloat(row[8]) || 0,
        paymentItem: row[9] || '',
        paymentStatus: row[11] || '',
        paymentMethod: row[10] || '',
        paymentTransactionId: row[12] || '',
        stripeToken: row[13] || '',
        soldBy: row[14] || '',
        saleReference: row[15] || '',
        calculatedLocation: row[16] || '',
        cleanedProduct: row[17] || '',
        cleanedCategory: row[18] || '',
        discountAmount: parseFloat(row[22]) || 0,
        grossRevenue: parseFloat(row[21]) || 0, // MRP Post Tax
        preTaxMrp: parseFloat(row[20]) || 0, // MRP Pre Tax
        vat: parseFloat(row[8]) || 0, // Payment VAT
        netRevenue: parseFloat(row[6]) || 0, // Payment Value
        postTaxMrp: parseFloat(row[21]) || 0, // MRP Post Tax
        grossDiscountPercent: parseFloat(row[23]) || 0,
        netDiscountPercent: parseFloat(row[23]) || 0
      }));

      console.log('Sales data loaded:', salesData.length, 'records');
      setData(salesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  return { data, loading, error, refetch: fetchSalesData };
};
