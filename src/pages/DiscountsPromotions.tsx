
import React from 'react';
import { DiscountsSection } from '@/components/dashboard/DiscountsSection';
import { Footer } from '@/components/ui/footer';

const DiscountsPromotions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <DiscountsSection />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DiscountsPromotions;
