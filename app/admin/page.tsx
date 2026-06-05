'use client';

import React, { useState } from 'react';
import { useBooks } from '@/context/BookContext';
import { 
  BookOpen, RefreshCw, AlertCircle, Users, ArrowUpRight, 
  CheckCircle, Clock, TrendingUp, Landmark, Award, BarChart3, 
  ChevronRight, CalendarRange, Sparkles, TrendingDown, BookMarked,
  Bell, Check, X, Hourglass
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { books, transactions, students, approveRequest, rejectRequest } = useBooks();

  // Selected hover point index in chart
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null);

  // Pending requests
  const pendingTransactions = transactions.filter(t => t.status === 'pending');

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setActionMsg({ id, type: 'approve' });
    await approveRequest(id);
    setTimeout(() => setActionMsg(null), 800);
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    setActionMsg({ id, type: 'reject' });
    await rejectRequest(id);
    setTimeout(() => setActionMsg(null), 800);
    setProcessingId(null);
  };

  // Statistics calculations
  const totalBooks = books.length;
  const activeTransactions = transactions.filter(t => t.status === 'borrowed' || t.status === 'late');
  const totalActiveBorrowings = activeTransactions.length;
  const overdueTransactions = transactions.filter(t => t.status === 'late');
  const totalOverdue = overdueTransactions.length;
  const totalStudents = students.length;

  // Premium details
  const totalFines = transactions.reduce((sum, tx) => sum + (tx.fine || 0), 0);
  const lateRate = totalActiveBorrowings > 0 ? Math.round((totalOverdue / totalActiveBorrowings) * 100) : 0;

  // 1. New Detailed Metric: Rata-Rata Waktu Pinjam (in days)
  const completedLoans = transactions.filter(t => t.status === 'returned' && t.returnDate);
  const averageBorrowDuration = completedLoans.length > 0
    ? Math.round(completedLoans.reduce((sum, tx) => {
        const start = new Date(tx.borrowDate).getTime();
        const end = new Date(tx.returnDate!).getTime();
        return sum + (end - start) / (1000 * 60 * 60 * 24);
      }, 0) / completedLoans.length)
    : 7; // Default/Fallback to standard 7 days

  // 2. New Detailed Metric: Mutasi Buku Hari Ini (Peminjaman Baru + Pengembalian)
  const todayStr = new Date().toISOString().split('T')[0];
  const transactionsToday = transactions.filter(t => 
    t.borrowDate.startsWith(todayStr) || (t.returnDate && t.returnDate.startsWith(todayStr))
  ).length;

  // Book Category breakdown
  const categoriesMap = books.reduce((acc, book) => {
    const catName = book.category?.name || 'Lainnya';
    acc[catName] = (acc[catName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoriesMap).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count).slice(0, 5); // top 5

  const maxCategoryCount = Math.max(...categoryData.map(d => d.count), 1);

  // Recent transactions list
  const recentTransactions = transactions.slice(0, 5);

  // Calculate top active students (based on transactions count)
  const studentActivity = transactions.reduce((acc, tx) => {
    const username = tx.studentUsername;
    acc[username] = (acc[username] || { name: tx.studentName, username, count: 0, class: 'XII-RPL-1' });
    acc[username].count += 1;
    return acc;
  }, {} as Record<string, { name: string; username: string; count: number; class: string }>);

  // Match class from registered students list if possible
  Object.keys(studentActivity).forEach(username => {
    const found = students.find(s => s.username === username);
    if (found) studentActivity[username].class = found.class;
  });

  const topStudents = Object.values(studentActivity)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Calculate top borrowed/popular books
  const bookPopularity = transactions.reduce((acc, tx) => {
    const id = tx.bookId;
    acc[id] = (acc[id] || { title: tx.bookTitle, id, count: 0, coverImage: tx.coverImage });
    acc[id].count += 1;
    return acc;
  }, {} as Record<string, { title: string; id: string; count: number; coverImage?: string }>);

  const topBooks = Object.values(bookPopularity)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Dynamic Weekly Chart (Last 7 days data)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  const chartData = last7Days.map(dateStr => {
    const formattedDate = new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    const count = transactions.filter(t => t.borrowDate.startsWith(dateStr)).length;
    return {
      dateStr,
      label: formattedDate,
      count
    };
  });

  // SVG Chart Geometry calculations
  const chartWidth = 500;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;
  const graphWidth = chartWidth - paddingX * 2;
  const graphHeight = chartHeight - paddingY * 2;

  const maxChartValue = Math.max(...chartData.map(d => d.count), 3); // minimum 3 scale

  // Compute SVG points
  const points = chartData.map((d, idx) => {
    const x = paddingX + idx * (graphWidth / (chartData.length - 1));
    const y = chartHeight - paddingY - (d.count / maxChartValue) * graphHeight;
    return { x, y };
  });

  // Create smooth SVG cubic bezier path string
  let curvePath = '';
  let areaPath = '';
  if (points.length > 0) {
    curvePath = `M ${points[0].x} ${points[0].y}`;
    areaPath = `M ${points[0].x} ${chartHeight - paddingY} L ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = next.x - (next.x - curr.x) / 2;
      const cp2y = next.y;

      curvePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
      areaPath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    areaPath += ` L ${points[points.length - 1].x} ${chartHeight - paddingY} Z`;
  }

  const getStatusBadge = (status: 'pending' | 'borrowed' | 'returned' | 'late') => {
    switch (status) {
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-3 w-3" /> Kembali
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/20 animate-pulse">
            <AlertCircle className="h-3 w-3" /> Terlambat
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20 animate-pulse">
            <Hourglass className="h-3 w-3" /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" /> Dipinjam
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6 md:space-y-8 text-zinc-100 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="h-3.5 w-3.5 animate-spin-slow" /> Konsol Petugas Perpustakaan
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Dasbor Utama Admin
          </h1>
          <p className="text-xs text-zinc-500 mt-1 hidden sm:block">
            Kelola transaksi secara real-time, pantau rasio denda keterlambatan, dan analisa grafik peminjaman.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/admin/transactions"
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold px-4 py-2.5 text-xs rounded-xl shadow-lg shadow-indigo-500/15 active:scale-[0.98] transition-all border border-indigo-500/20 whitespace-nowrap"
          >
            Transaksi Baru <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ═══ PENDING REQUESTS SECTION ══════════════════════════════════════════ */}
      {pendingTransactions.length > 0 && (
        <div className="space-y-4">
          {/* Section header with pulsing badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Bell className="h-5 w-5" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white shadow-lg shadow-amber-500/40 animate-bounce">
                  {pendingTransactions.length}
                </span>
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-100">Permintaan Peminjaman Baru</h2>
                <p className="text-xs text-zinc-500">{pendingTransactions.length} permintaan menunggu persetujuan Anda</p>
              </div>
            </div>
          </div>

          {/* Pending Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingTransactions.map((tx) => {
              const isProcessing = processingId === tx.id;
              const msg = actionMsg?.id === tx.id ? actionMsg.type : null;
              return (
                <div
                  key={tx.id}
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                    msg === 'approve'
                      ? 'border-emerald-500/50 bg-emerald-500/10 scale-95 opacity-60'
                      : msg === 'reject'
                      ? 'border-rose-500/50 bg-rose-500/10 scale-95 opacity-60'
                      : 'border-zinc-800/80 bg-zinc-900/50 hover:border-amber-500/30 hover:bg-zinc-900/80'
                  }`}
                >
                  {/* Amber top stripe */}
                  <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 to-orange-500" />

                  <div className="p-4 flex gap-3">
                    {/* Book cover */}
                    <img
                      src={tx.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=387&auto=format&fit=crop'}
                      alt={tx.bookTitle}
                      className="w-12 h-16 object-cover rounded-lg border border-zinc-800 shrink-0 shadow-md"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=387&auto=format&fit=crop'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-extrabold text-zinc-100 line-clamp-2 leading-tight" title={tx.bookTitle}>
                          {tx.bookTitle}
                        </p>
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/25 ml-1">
                          <Hourglass className="h-2.5 w-2.5" /> Pending
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 font-semibold">
                        👤 {tx.studentName}
                        <span className="text-zinc-600 mx-1">·</span>
                        <span className="text-zinc-500">{tx.studentUsername}</span>
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        Request: {new Date(tx.borrowDate).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 px-4 pb-4">
                    <button
                      onClick={() => handleApprove(tx.id)}
                      disabled={isProcessing}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      {msg === 'approve' ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Setujui
                    </button>
                    <button
                      onClick={() => handleReject(tx.id)}
                      disabled={isProcessing}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      <X className="h-3.5 w-3.5" />
                      Tolak
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid Kartu Statistik (4 Cards + Glow effect on hover) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Total Books */}
        <div className="relative overflow-hidden border border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 to-zinc-950/60 p-4 sm:p-6 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all duration-300 shadow-md">
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Koleksi Buku</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white">{totalBooks}</h3>
            <p className="text-[9px] sm:text-[10px] text-zinc-450 flex items-center gap-1"><BookMarked className="h-3 w-3 text-indigo-400" /> API + Buku Kustom</p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl border border-indigo-500/15 bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-all duration-300">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>

        {/* Card 2: Active Borrowings */}
        <div className="relative overflow-hidden border border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 to-zinc-950/60 p-4 sm:p-6 rounded-2xl flex items-center justify-between group hover:border-amber-500/30 transition-all duration-300 shadow-md">
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Aktif Dipinjam</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white">{totalActiveBorrowings}</h3>
            <p className="text-[9px] sm:text-[10px] text-zinc-450 flex items-center gap-1"><RefreshCw className="h-3 w-3 text-amber-400 animate-spin-slow" /> {totalActiveBorrowings} buku di luar</p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl border border-amber-500/15 bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-all duration-300">
            <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>

        {/* Card 3: Overdue Returns */}
        <div className="relative overflow-hidden border border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 to-zinc-950/60 p-4 sm:p-6 rounded-2xl flex items-center justify-between group hover:border-rose-500/30 transition-all duration-300 shadow-md">
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Terlambat Kembali</p>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-500">{totalOverdue}</h3>
            <p className="text-[9px] sm:text-[10px] text-rose-400/80 font-bold flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {lateRate}% rasio</p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-all duration-300">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>

        {/* Card 4: Accumulated Fines */}
        <div className="relative overflow-hidden border border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 to-zinc-950/60 p-4 sm:p-6 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-300 shadow-md">
          <div className="space-y-1 min-w-0">
            <p className="text-[9px] sm:text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Total Denda</p>
            <h3 className="text-lg sm:text-2xl font-black text-emerald-400 truncate">Rp {totalFines.toLocaleString('id-ID')}</h3>
            <p className="text-[9px] sm:text-[10px] text-zinc-450 flex items-center gap-1"><Landmark className="h-3 w-3 text-emerald-400" /> Akumulasi denda</p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-all duration-300 shrink-0">
            <Landmark className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
      </div>

      {/* Main Column Grid: Chart and Categories */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Latar Grafik Frekuensi Peminjaman (Interactive Area Curve Chart) */}
        <div className="relative xl:col-span-2 border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
          
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-base font-bold text-zinc-200 flex items-center gap-1.5">
                <BarChart3 className="h-4.5 w-4.5 text-indigo-400" /> Grafik Frekuensi Peminjaman
              </h2>
              <p className="text-xs text-zinc-500">Frekuensi peminjaman buku harian dalam 7 hari terakhir</p>
            </div>
            
            {/* Absolute indicator for overall week */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg px-2.5 py-1 text-right select-none shadow">
              <span className="text-[8px] font-extrabold text-indigo-400 block uppercase">Total Transaksi</span>
              <span className="text-xs font-black text-white">{transactions.length} Peminjaman</span>
            </div>
          </div>

          {/* SVG Canvas wrapped with relative container for floating tooltip */}
          <div className="relative w-full aspect-[2.6/1] md:aspect-[3.2/1] bg-zinc-950/40 border border-zinc-800/30 rounded-xl pt-4 overflow-visible">
            
            {/* Floating Tooltip Box */}
            {hoveredPoint !== null && (
              <div 
                className="absolute z-30 bg-zinc-900/95 border border-indigo-500/30 rounded-xl px-3 py-1.5 text-center select-none shadow-2xl backdrop-blur-md transition-all duration-150"
                style={{
                  left: `${points[hoveredPoint].x * 100 / chartWidth}%`,
                  top: `${points[hoveredPoint].y * 100 / chartHeight - 12}%`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <p className="text-[8px] text-zinc-400 font-extrabold uppercase">{chartData[hoveredPoint].label}</p>
                <p className="text-xs font-black text-indigo-400">{chartData[hoveredPoint].count} Pinjam</p>
                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-indigo-500/30 rotate-45" />
              </div>
            )}

            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45"/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#27272a" strokeDasharray="3 3" />
              <line x1={paddingX} y1={paddingY + graphHeight / 2} x2={chartWidth - paddingX} y2={paddingY + graphHeight / 2} stroke="#27272a" strokeDasharray="3 3" />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#27272a" />

              {/* Area Gradient Under Curve */}
              {areaPath && <path d={areaPath} fill="url(#chartGlow)" />}

              {/* Curve Line */}
              {curvePath && (
                <path 
                  d={curvePath} 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Axis Label X */}
              {points.map((p, idx) => (
                <text 
                  key={idx}
                  x={p.x}
                  y={chartHeight - 6}
                  fill="#71717a"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {chartData[idx].label}
                </text>
              ))}

              {/* Dots on Curve & Hover Overlays */}
              {points.map((p, idx) => (
                <g key={idx}>
                  {/* Pulsing ring on hover */}
                  {hoveredPoint === idx && (
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="9" 
                      fill="transparent"
                      stroke="#6366f1"
                      strokeWidth="1.5"
                      className="animate-ping"
                    />
                  )}
                  {/* Outer dot */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={hoveredPoint === idx ? "5" : "3.5"} 
                    fill={hoveredPoint === idx ? "#ffffff" : "#6366f1"}
                    stroke="#4f46e5"
                    strokeWidth="1.5"
                    className="transition-all duration-200"
                  />
                  {/* Larger Invisible Circle for easy hover triggering */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="15" 
                    fill="transparent" 
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Daily Details Table under chart */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-2 text-center text-[10px] overflow-x-auto">
            {chartData.map((d, i) => (
              <div 
                key={d.dateStr} 
                className={`p-2 rounded-xl border transition-all duration-300 ${
                  hoveredPoint === i 
                    ? 'bg-indigo-650/20 border-indigo-500/40 text-indigo-400 font-extrabold shadow' 
                    : 'border-zinc-800/45 bg-zinc-950/20 text-zinc-400'
                }`}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <span className="block text-[8px] uppercase tracking-wider font-bold">{d.label.split(' ')[0]}</span>
                <span className="text-sm font-black block mt-0.5">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kategori Buku Chart Panel (Top 5 categories + Detail stats) */}
        <div className="border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-zinc-200 flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-400" /> Kategori Terpopuler
            </h2>
            <p className="text-xs text-zinc-500">Sebaran kategori buku kustom & API</p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {categoryData.length > 0 ? (
              categoryData.map((data, idx) => {
                const percentage = (data.count / maxCategoryCount) * 100;
                const colors = [
                  'from-indigo-500 to-violet-500',
                  'from-purple-500 to-pink-500',
                  'from-emerald-500 to-teal-500',
                  'from-amber-500 to-orange-500',
                  'from-cyan-500 to-blue-500'
                ][idx % 5];

                return (
                  <div key={data.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-zinc-300 truncate max-w-[130px]" title={data.name}>{data.name}</span>
                      <span className="font-extrabold text-zinc-400">{data.count} Buku</span>
                    </div>
                    <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
                      <div 
                        className={`h-full bg-gradient-to-r ${colors} rounded-full transition-all duration-1000`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-zinc-650 text-sm">
                Belum ada data kategori buku.
              </div>
            )}
          </div>

          <Link
            href="/admin/books"
            className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/60 text-xs font-bold text-zinc-300 transition-all shadow-sm"
          >
            Lihat Master Buku <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* NEW: Expanded Detailed Statistics Row (Average Duration & Mutations today) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="border border-zinc-800/80 bg-zinc-900/30 p-5 rounded-2xl flex items-center gap-4 group hover:border-indigo-500/20 transition-all duration-300">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-300">
            <CalendarRange className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Rerata Durasi Peminjaman</h4>
            <p className="text-xl font-black text-white mt-0.5">{averageBorrowDuration} Hari</p>
            <p className="text-[10px] text-zinc-550 mt-0.5">Dihitung otomatis dari riwayat transaksi yang selesai</p>
          </div>
        </div>

        <div className="border border-zinc-800/80 bg-zinc-900/30 p-5 rounded-2xl flex items-center gap-4 group hover:border-emerald-500/20 transition-all duration-300">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Aktivitas &amp; Mutasi Hari Ini</h4>
            <p className="text-xl font-black text-white mt-0.5">{transactionsToday} Transaksi</p>
            <p className="text-[10px] text-zinc-555 mt-0.5">Jumlah transaksi pinjam dan kembali aktif pada tanggal hari ini</p>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Insights & Top lists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Column 1: Top Active Students */}
        <div className="border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="space-y-1 mb-4">
            <h2 className="text-base font-bold text-zinc-200 flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-indigo-400" /> Siswa Paling Aktif
            </h2>
            <p className="text-xs text-zinc-500">Pengguna dengan transaksi peminjaman terbanyak</p>
          </div>

          <div className="divide-y divide-zinc-800/50 flex-1 flex flex-col justify-center">
            {topStudents.length > 0 ? (
              topStudents.map((s, idx) => (
                <div key={s.username} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black border border-indigo-500/20">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{s.name}</p>
                      <p className="text-[10px] text-zinc-500">{s.class}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800/60 shadow-inner">
                    {s.count} Pinjam
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs text-zinc-650">Belum ada aktivitas siswa.</p>
            )}
          </div>
        </div>

        {/* Column 2: Top Borrowed Books */}
        <div className="border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="space-y-1 mb-4">
            <h2 className="text-base font-bold text-zinc-200 flex items-center gap-1.5">
              <BookOpen className="h-4.5 w-4.5 text-indigo-400" /> Buku Terpopuler
            </h2>
            <p className="text-xs text-zinc-500">Koleksi buku yang paling disukai &amp; dipinjam</p>
          </div>

          <div className="divide-y divide-zinc-800/50 flex-1 flex flex-col justify-center">
            {topBooks.length > 0 ? (
              topBooks.map((b, idx) => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 overflow-hidden max-w-[70%]">
                    <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black border border-indigo-500/20">
                      {idx + 1}
                    </span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-zinc-200 truncate" title={b.title}>{b.title}</p>
                      <p className="text-[9px] text-zinc-500 truncate">ID: {b.id}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/10 flex-shrink-0">
                    {b.count}x Dibaca
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs text-zinc-650">Belum ada buku terpopuler.</p>
            )}
          </div>
        </div>

        {/* Column 3: Recent Activity Summary Link */}
        <div className="sm:col-span-2 lg:col-span-1 border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-start">
              <h2 className="text-base font-bold text-zinc-200 flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-indigo-400" /> Riwayat Terkini
              </h2>
              <Link 
                href="/admin/transactions" 
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center"
              >
                Semua <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="text-xs text-zinc-550 mt-0.5">Daftar transaksi mutasi teratas</p>
          </div>

          <div className="divide-y divide-zinc-800/50 my-3 flex-1 flex flex-col justify-center">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 text-xs">
                  <div className="overflow-hidden max-w-[65%]">
                    <p className="font-bold text-zinc-200 truncate" title={tx.bookTitle}>{tx.bookTitle}</p>
                    <p className="text-[10px] text-zinc-500 truncate">Siswa: {tx.studentName}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(tx.status)}
                    <span className="block text-[9px] text-zinc-600 mt-0.5">{formatDate(tx.borrowDate)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs text-zinc-650">Belum ada riwayat transaksi.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
