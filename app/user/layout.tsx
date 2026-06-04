'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/');
      } else if (user.role !== 'user') {
        router.push('/admin');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'user') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#141414] transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 dark:border-zinc-800 border-t-teal-600 dark:border-t-teal-500"></div>
          <p className="text-sm font-medium text-zinc-650 dark:text-zinc-400">Memverifikasi otorisasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#141414] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-300">
      {/* Top Navbar */}
      <Navbar />

      {/* Main content body spacing top to avoid navbar overlay */}
      <main className="flex-grow pt-16 flex flex-col">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {children}
        </div>
      </main>

      {/* Global User Footer */}
      <Footer />
    </div>
  );
}
