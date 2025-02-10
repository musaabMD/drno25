'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/libs/supabase/client';
import { Check } from 'lucide-react';
import HomeHeader from "@/components/Quiz/HHeader";

const PricingOption = ({ duration, price, days }) => (
  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
    <div>
      <div className="font-medium text-gray-900">{duration}</div>
      <div className="text-sm text-gray-500">{days} days access</div>
    </div>
    <div className="text-right">
      <div className="text-lg font-bold text-blue-600">${price}</div>
    </div>
  </div>
);

const PricingCard = ({ plan, currentSub }) => (
  <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
    {currentSub && (
      <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-lg">
        Current Plan
      </div>
    )}
    <div className="p-8">
      <div className="text-4xl mb-4">{plan.emoji}</div>
      <h3 className="text-2xl font-bold mb-2">{plan.exam?.initials || plan.exam_id}</h3>
      <p className="text-gray-500">{plan.exam?.name}</p>
      
      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <PricingOption 
            duration="1 Month" 
            price={plan.price_monthly} 
            days={30}
          />
          <PricingOption 
            duration="3 Months" 
            price={plan.price_quarterly} 
            days={90}
          />
          <PricingOption 
            duration="6 Months" 
            price={plan.price_biannual} 
            days={180}
          />
          <PricingOption 
            duration="12 Months" 
            price={plan.price_annual} 
            days={365}
          />
        </div>

        <ul className="space-y-3">
          {plan.features?.map((feature, idx) => (
            <li key={idx} className="flex items-center text-gray-600">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              {feature}
            </li>
          ))}
        </ul>

        {!currentSub ? (
          <button
            onClick={() => alert('Stripe integration coming soon!')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Subscribe Now
          </button>
        ) : (
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-gray-600">Expires on</p>
            <p className="font-medium">{new Date(currentSub.current_period_end).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function UpgradePage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSubs, setCurrentSubs] = useState({});
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: pricingData, error } = await supabase
          .from('drnote_pricing')
          .select(`
            *,
            exam:exams!inner (
              name,
              initials
            )
          `);

        if (error) throw error;
        if (pricingData) {
          setPlans(pricingData);
        }

        if (user) {
          const { data: subscriptions } = await supabase
            .from('drnote_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active');

          const subsMap = {};
          subscriptions?.forEach(sub => {
            subsMap[sub.exam_id] = sub;
          });
          setCurrentSubs(subsMap);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">Select the exam you want to prepare for</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currentSub={currentSubs[plan.exam_id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}