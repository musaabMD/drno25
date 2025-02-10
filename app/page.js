'use client';

import React from 'react';
import HomeHeader from '@/components/Quiz/HHeader';
import Header from '@/components/Header';
import { usePathname } from 'next/navigation';
import HomePage from '@/components/Quiz/Homepage';

const Page = () => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  return (
    <main className="bg-gray-50">
      {isHomePage ? <HomeHeader /> : <Header />}
      <HomePage />
    </main>
  );
};

export default Page;