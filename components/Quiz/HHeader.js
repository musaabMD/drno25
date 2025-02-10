'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown } from 'lucide-react';
import ButtonAccount from "@/components/ButtonAccount";
import { createClient } from "@/libs/supabase/client";

const Logo = () => (
  <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
    <div className="flex-shrink-0">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-xl font-bold text-white">D</span>
      </div>
    </div>
    <span className="hidden md:block text-xl font-bold text-gray-800 ml-2">DrNote</span>
  </Link>
);

const HomeHeader = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const checkUser = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (!error && currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const AuthButtons = () => (
    <div className="hidden md:flex items-center gap-3">
      <Link
        href="/signin"
        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
      >
        Log in
      </Link>
      <Link
        href="/signin"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Sign up
      </Link>
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <div className="flex items-center gap-3 md:gap-4">
            {!loading && (
              <>
                {!user ? (
                  <AuthButtons />
                ) : (
                  <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                      <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                        Dashboard
                      </button>
                    </Link>
                    <ButtonAccount />
                  </div>
                )}
              </>
            )}
            <Link
              href="/upgrade"
              className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors"
            >
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Upgrade</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;