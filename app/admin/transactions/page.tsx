'use client';

import React, { useState, useEffect } from 'react';
import { useBooks, Transaction, Student } from '@/context/BookContext';
import Toast from '@/components/Toast';
import {
  Search, RefreshCcw, CheckCircle, Clock, Calendar,
  AlertCircle, BookOpen, Users, ArrowDownCircle, PlusCircle, Receipt,
  Edit2, Trash2, X, CalendarDays, Coins
} from 'lucide-react';

export default function TransaksiPerpus() {
  const { 
    books, transactions, students, borrowBook, returnBook, 
    isBookAvailable, addStudent, updateTransaction, deleteTransaction 
  } = useBooks();

  const [activeTab, setActiveTab] = useState<'active' | 'new' | 'history'>('active');
  const [searchTerm, setSearchTerm] = useState('');

  // New-borrow form state
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedStudentUsername, setSelectedStudentUsername] = useState('');
  const [duration, setDuration] = useState('7');
  
  // Student registration states
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('XII-RPL-1');
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Edit modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentUsername, setEditStudentUsername] = useState('');
  const [editBorrowDate, setEditBorrowDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editReturnDate, setEditReturnDate] = useState('');
  const [editStatus, setEditStatus] = useState<'borrowed' | 'returned' | 'late'>('borrowed');
  const [editFine, setEditFine] = useState('0');
  const [isCustomReturnDate, setIsCustomReturnDate] = useState(false);

  // Delete confirmation states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  // Action status indicators
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const availableBooks = books.filter(b => isBookAvailable(b._id));

  // Check URL parameters for shortcut borrowing redirects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const bookIdParam = params.get('bookId');
      if (tabParam === 'new') {
        setActiveTab('new');
      }
      if (bookIdParam) {
        setSelectedBookId(bookIdParam);
      }
    }
  }, []);

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) { setToast({ message: 'Pilih buku terlebih dahulu.', type: 'error' }); return; }
    if (!selectedStudentUsername) { setToast({ message: 'Pilih siswa peminjam.', type: 'error' }); return; }
    
    setIsSubmitting(true);
    const res = await borrowBook(selectedBookId, selectedStudentUsername, parseInt(duration));
    setIsSubmitting(false);

    if (res.success) {
      setToast({ message: res.message, type: 'success' });
      setSelectedBookId('');
      setSelectedStudentUsername('');
      setActiveTab('active');
    } else {
      setToast({ message: res.message, type: 'error' });
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentUsername.trim() || !newStudentName.trim()) {
      setToast({ message: 'Username dan Nama Siswa wajib diisi.', type: 'error' }); return;
    }
    const lower = newStudentUsername.toLowerCase().trim();
    if (students.some(s => s.username === lower)) {
      setToast({ message: 'Siswa dengan username ini sudah terdaftar.', type: 'error' }); return;
    }

    setIsSubmitting(true);
    await addStudent({ username: lower, name: newStudentName.trim(), class: newStudentClass });
    setIsSubmitting(false);

    setToast({ message: `Siswa "${newStudentName}" berhasil didaftarkan!`, type: 'success' });
    setSelectedStudentUsername(lower);
    setNewStudentUsername('');
    setNewStudentName('');
    setIsAddingStudent(false);
  };

  const handleReturn = async (txId: string) => {
    setIsSubmitting(true);
    const res = await returnBook(txId);
    setIsSubmitting(false);
    setToast({ message: res.message, type: res.success ? 'success' : 'error' });
  };

  // Open Edit Modal
  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setEditStudentName(tx.studentName);
    setEditStudentUsername(tx.studentUsername);
    setEditBorrowDate(tx.borrowDate.substring(0, 10));
    setEditDueDate(tx.dueDate.substring(0, 10));
    if (tx.returnDate) {
      setEditReturnDate(tx.returnDate.substring(0, 10));
      setIsCustomReturnDate(true);
    } else {
      setEditReturnDate('');
      setIsCustomReturnDate(false);
    }
    setEditStatus(tx.status);
    setEditFine(tx.fine.toString());
    setIsEditOpen(true);
  };

  // Save Edit Transaction
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const bDate = new Date(editBorrowDate);
    const dDate = new Date(editDueDate);
    let rDate: string | null = null;
    
    if (editStatus === 'returned') {
      rDate = editReturnDate ? new Date(editReturnDate).toISOString() : new Date().toISOString();
    } else if (isCustomReturnDate && editReturnDate) {
      rDate = new Date(editReturnDate).toISOString();
    }

    const updatedTx: Transaction = {
      ...editingTx,
      studentName: editStudentName,
      studentUsername: editStudentUsername.toLowerCase().trim(),
      borrowDate: bDate.toISOString(),
      dueDate: dDate.toISOString(),
      returnDate: rDate,
      status: editStatus,
      fine: parseInt(editFine) || 0
    };

    setIsSubmitting(true);
    const res = await updateTransaction(updatedTx);
    setIsSubmitting(false);

    if (res.success) {
      setToast({ message: 'Detail transaksi peminjaman berhasil diperbarui!', type: 'success' });
      setIsEditOpen(false);
      setEditingTx(null);
    } else {
      setToast({ message: res.message, type: 'error' });
    }
  };

  // Open Delete Modal
  const openDeleteModal = (txId: string) => {
    setDeletingTxId(txId);
    setIsDeleteOpen(true);
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deletingTxId) return;

    setIsSubmitting(true);
    const res = await deleteTransaction(deletingTxId);
    setIsSubmitting(false);

    if (res.success) {
      setToast({ message: 'Riwayat transaksi peminjaman berhasil dihapus secara permanen!', type: 'success' });
      setIsDeleteOpen(false);
      setDeletingTxId(null);
    } else {
      setToast({ message: res.message, type: 'error' });
    }
  };

  const activeLoans = transactions.filter(t => t.status === 'borrowed' || t.status === 'late');
  const pastLoans = transactions.filter(t => t.status === 'returned');

  const filtered = (list: Transaction[]) =>
    list.filter(tx =>
      tx.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.studentUsername.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  // ── Status Badge helper ──────────────────────────────────────────────────
  const StatusBadge = ({ status }: { status: 'borrowed' | 'returned' | 'late' }) => {
    if (status === 'returned')
      return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20"><CheckCircle className="h-3 w-3" />Dikembalikan</span>;
    if (status === 'late')
      return <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-400 border border-rose-500/20"><AlertCircle className="h-3 w-3" />Terlambat</span>;
    return <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-400 border border-amber-500/20"><Clock className="h-3 w-3" />Dipinjam</span>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Transaksi Perpustakaan
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Pantau semua peminjaman buku oleh siswa, edit rincian transaksi, hapus riwayat usang, dan kelola pengembalian.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Aktif Dipinjam', value: activeLoans.length, color: 'amber', icon: <Clock className="h-5 w-5" /> },
          { label: 'Terlambat', value: activeLoans.filter(t => t.status === 'late').length, color: 'rose', icon: <AlertCircle className="h-5 w-5" /> },
          { label: 'Sudah Kembali', value: pastLoans.length, color: 'emerald', icon: <CheckCircle className="h-5 w-5" /> },
          { label: 'Total Siswa', value: students.length, color: 'indigo', icon: <Users className="h-5 w-5" /> },
        ].map(stat => (
          <div key={stat.label} className="border border-zinc-800/80 bg-zinc-900/40 p-4 rounded-2xl flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border bg-${stat.color}-500/10 text-${stat.color}-400 border-${stat.color}-500/15`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{stat.label}</p>
              <p className="text-xl font-bold text-zinc-200 mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800/80 gap-6 text-sm font-semibold">
        {[
          { key: 'active', label: `Peminjaman Aktif (${activeLoans.length})` },
          { key: 'new', label: 'Pinjamkan Manual' },
          { key: 'history', label: `Riwayat Kembali (${pastLoans.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key as typeof activeTab); setSearchTerm(''); }}
            className={`pb-4 relative transition-colors ${activeTab === tab.key ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {tab.label}
            {activeTab === tab.key && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Search Bar (for list tabs) */}
      {activeTab !== 'new' && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan judul buku, nama atau username siswa..."
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
      )}

      {/* ── Tab: Active Loans ── */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {filtered(activeLoans).length > 0 ? filtered(activeLoans).map(tx => (
            <div
              key={tx.id}
              className="border border-zinc-800/80 bg-zinc-900/40 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-zinc-900/60 transition-all"
            >
              {/* Book + Student info */}
              <div className="flex gap-4 items-start min-w-0">
                <img src={tx.coverImage} alt={tx.bookTitle}
                  className="w-14 h-20 object-cover rounded-xl bg-zinc-950 border border-zinc-800 shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=387&auto=format&fit=crop'; }}
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-zinc-100 truncate" title={tx.bookTitle}>{tx.bookTitle}</h3>
                  <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 text-xs text-zinc-400">
                    <span className="font-semibold text-indigo-400">{tx.studentName}</span>
                    <span className="text-zinc-700">•</span>
                    <span className="bg-zinc-950 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500">@{tx.studentUsername}</span>
                    <span className="text-zinc-700">•</span>
                    <span>{students.find(s => s.username === tx.studentUsername)?.class || 'XII-RPL-1'}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 mt-2.5 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Pinjam: {formatDate(tx.borrowDate)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Batas: {formatDate(tx.dueDate)}</span>
                  </div>
                </div>
              </div>

              {/* Status + Return / Edit / Delete btn */}
              <div className="flex items-center gap-4 border-t border-zinc-800/60 md:border-0 pt-4 md:pt-0 shrink-0 justify-between md:justify-end">
                <div>
                  <StatusBadge status={tx.status} />
                  {tx.fine > 0 && (
                    <p className="text-[11px] font-bold text-rose-400 mt-1.5 flex items-center gap-1">
                      <Receipt className="h-3 w-3" /> Denda: Rp {tx.fine.toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReturn(tx.id)}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/15 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-400 px-3.5 py-2.5 transition-all active:scale-95 shadow"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" /> Kembalikan
                  </button>

                  <button
                    onClick={() => openEditModal(tx)}
                    className="p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/20 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-all"
                    title="Ubah Rincian"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => openDeleteModal(tx.id)}
                    className="p-2.5 rounded-xl border border-rose-500/10 hover:border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 transition-all"
                    title="Hapus Transaksi"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl py-20 text-center">
              <CheckCircle className="h-12 w-12 text-zinc-700 mb-3" />
              <h3 className="font-bold text-zinc-400">Tidak ada peminjaman aktif</h3>
              <p className="text-xs text-zinc-600 mt-1">Semua buku telah dikembalikan ke perpustakaan.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Manual Borrow ── */}
      {activeTab === 'new' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 border border-zinc-800/80 bg-zinc-900/40 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-zinc-200 mb-5 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-indigo-400" /> Pinjamkan Buku (Manual / Admin)
            </h2>
            <p className="text-xs text-zinc-500 mb-5 -mt-3 leading-relaxed">
              Siswa dapat meminjam buku secara mandiri dari katalog. Gunakan formulir ini untuk mendaftarkan peminjaman secara langsung dari meja petugas perpustakaan.
            </p>

            <form onSubmit={handleBorrow} className="space-y-5">
              {/* Select Book */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Pilih Buku *</label>
                <select
                  value={selectedBookId}
                  onChange={e => setSelectedBookId(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all"
                >
                  <option value="">-- Pilih Buku Tersedia ({availableBooks.length} buku) --</option>
                  {availableBooks.map(b => (
                    <option key={b._id} value={b._id} className="bg-zinc-900">
                      {b.title} — {b.author?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Student */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400">Siswa Peminjam *</label>
                  <button type="button" onClick={() => setIsAddingStudent(!isAddingStudent)}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                    {isAddingStudent ? '✕ Batal' : '+ Daftarkan Siswa Baru'}
                  </button>
                </div>
                {!isAddingStudent ? (
                  <select
                    value={selectedStudentUsername}
                    onChange={e => setSelectedStudentUsername(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all"
                  >
                    <option value="">-- Pilih Siswa ({students.length} terdaftar) --</option>
                    {students.map(s => (
                      <option key={s.username} value={s.username} className="bg-zinc-900">
                        {s.name} · {s.class} · @{s.username}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 border border-zinc-800 bg-zinc-950/60 rounded-xl space-y-3">
                    <p className="text-xs font-bold text-indigo-400">Registrasi Siswa Baru</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" value={newStudentUsername} onChange={e => setNewStudentUsername(e.target.value)}
                        placeholder="username (e.g. budi)" className="bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-300" />
                      <input type="text" value={newStudentName} onChange={e => setNewStudentName(e.target.value)}
                        placeholder="Nama Lengkap" className="bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-300" />
                      <select value={newStudentClass} onChange={e => setNewStudentClass(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-300 text-zinc-400">
                        <option>XII-RPL-1</option><option>XI-TKJ-2</option><option>X-RPL-2</option><option>XI-RPL-1</option>
                      </select>
                    </div>
                    <button type="button" onClick={handleAddStudent}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 text-xs font-semibold transition-all">
                      Daftarkan &amp; Pilih Siswa
                    </button>
                  </div>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Durasi Peminjaman</label>
                <div className="grid grid-cols-3 gap-3">
                  {[['7 Hari', '7'], ['14 Hari', '14'], ['30 Hari', '30']].map(([label, val]) => (
                    <button key={val} type="button" onClick={() => setDuration(val)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${duration === val ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || availableBooks.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/10 active:scale-[0.98] transition-all disabled:opacity-50">
                <ArrowDownCircle className="h-4.5 w-4.5" /> Proses Peminjaman Manual
              </button>
            </form>
          </div>

          {/* Side info */}
          <div className="space-y-4">
            <div className="border border-zinc-800/80 bg-zinc-900/40 p-5 rounded-2xl">
              <h3 className="font-bold text-zinc-200 text-sm mb-3">Ketentuan Transaksi</h3>
              <ul className="text-xs text-zinc-500 space-y-2.5 list-disc pl-4">
                <li>Buku yang bisa dipinjamkan bersumber langsung dari data Bukuacak API.</li>
                <li>Denda keterlambatan dihitung otomatis sebesar <strong className="text-zinc-300">Rp 1.000 / hari</strong> setelah melewati batas pengembalian.</li>
                <li>Gunakan fitur <strong className="text-zinc-300">Ubah Rincian</strong> untuk memperpanjang tenggat atau menyesuaikan nilai denda.</li>
                <li>Penghapusan transaksi akan menghapus permanen catatan tanpa mengembalikan riwayat apa pun.</li>
              </ul>
            </div>
            <div className="border border-zinc-800/80 bg-zinc-900/40 p-5 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/15">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-zinc-500">Siswa Terdaftar</p>
                <p className="text-xl font-bold text-zinc-200 mt-0.5">{students.length} Siswa</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Return History ── */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {filtered(pastLoans).length > 0 ? (
            <div className="border border-zinc-800/80 bg-zinc-900/40 rounded-2xl p-5 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="pb-3">Judul Buku</th>
                    <th className="pb-3">Siswa</th>
                    <th className="pb-3">Tgl Pinjam</th>
                    <th className="pb-3">Tgl Kembali</th>
                    <th className="pb-3">Denda</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filtered(pastLoans).map(tx => (
                    <tr key={tx.id} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="py-3.5 pr-3 font-semibold text-zinc-200 max-w-[200px] truncate" title={tx.bookTitle}>
                        {tx.bookTitle}
                      </td>
                      <td className="py-3.5 px-1 text-zinc-300">
                        {tx.studentName}
                        <span className="text-[10px] text-zinc-600 ml-1">(@{tx.studentUsername})</span>
                      </td>
                      <td className="py-3.5 px-1 text-zinc-400 text-xs">{formatDate(tx.borrowDate)}</td>
                      <td className="py-3.5 px-1 text-zinc-400 text-xs">{tx.returnDate ? formatDate(tx.returnDate) : '-'}</td>
                      <td className="py-3.5 px-1 text-xs font-semibold">
                        {tx.fine > 0
                          ? <span className="text-rose-400">Rp {tx.fine.toLocaleString('id-ID')}</span>
                          : <span className="text-zinc-600">Nihil</span>}
                      </td>
                      <td className="py-3.5 px-1">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="py-3.5 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950/20 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-all"
                            title="Ubah Rincian"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(tx.id)}
                            className="p-1.5 rounded-lg border border-rose-500/10 hover:border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 transition-all"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl py-20 text-center">
              <Clock className="h-12 w-12 text-zinc-700 mb-3" />
              <h3 className="font-bold text-zinc-400">Belum ada riwayat pengembalian</h3>
              <p className="text-xs text-zinc-500 mt-1">Transaksi yang sudah dikembalikan akan tampil di sini.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Edit Borrowing Modal ── */}
      {isEditOpen && editingTx && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg border border-zinc-800 bg-zinc-900 p-6 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => { setIsEditOpen(false); setEditingTx(null); }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Title */}
            <h2 className="text-xl font-bold text-zinc-100 mb-2 bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Ubah Transaksi Peminjaman
            </h2>
            <p className="text-xs text-zinc-500 mb-6 truncate" title={editingTx.bookTitle}>
              Buku: <strong className="text-zinc-300">{editingTx.bookTitle}</strong>
            </p>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Nama Siswa *</label>
                  <input
                    type="text"
                    required
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Student Username */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Username Siswa *</label>
                  <input
                    type="text"
                    required
                    value={editStudentUsername}
                    onChange={(e) => setEditStudentUsername(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Borrow Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Tanggal Pinjam *</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={editBorrowDate}
                      onChange={(e) => setEditBorrowDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Tenggat Pengembalian *</label>
                  <input
                    type="date"
                    required
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Status Peminjaman *</label>
                <select
                  value={editStatus}
                  onChange={(e) => {
                    const status = e.target.value as typeof editStatus;
                    setEditStatus(status);
                    if (status === 'returned' && !editReturnDate) {
                      setEditReturnDate(new Date().toISOString().substring(0, 10));
                    }
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="borrowed">Sedang Dipinjam</option>
                  <option value="returned">Sudah Dikembalikan</option>
                  <option value="late">Terlambat Kembali</option>
                </select>
              </div>

              {/* Toggle Custom Return Date */}
              {(editStatus === 'returned' || isCustomReturnDate) && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-xs font-semibold text-zinc-400">Tanggal Dikembalikan</label>
                  <input
                    type="date"
                    value={editReturnDate}
                    onChange={(e) => setEditReturnDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Custom Fine */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400">Denda Transaksi (Rp)</label>
                  <span className="text-[10px] text-zinc-600">Bisa di-override manual</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-600 text-xs font-semibold">
                    Rp
                  </div>
                  <input
                    type="number"
                    value={editFine}
                    onChange={(e) => setEditFine(e.target.value)}
                    placeholder="0"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-3.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setEditingTx(null); }}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-xl shadow-indigo-500/10 transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm border border-zinc-800 bg-zinc-900 p-6 rounded-2xl shadow-2xl text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            
            <h3 className="text-lg font-bold text-zinc-200">Hapus Riwayat Transaksi?</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan peminjaman ini secara permanen dari database? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => { setIsDeleteOpen(false); setDeletingTxId(null); }}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-all shadow-lg shadow-rose-500/10"
              >
                Ya, Hapus Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
