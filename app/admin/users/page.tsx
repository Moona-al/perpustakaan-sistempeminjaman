'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Toast from '@/components/Toast';
import { Search, Users, Trash2, Loader2, Calendar, ShieldCheck, UserCheck } from 'lucide-react';

interface UserRecord {
  id: number;
  username: string;
  name: string;
  class: string;
  role: 'admin' | 'user';
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('Semua');
  const [roleFilter, setRoleFilter] = useState('Semua');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch all users on component mount
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Gagal mengambil data user');
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Gagal memuat daftar user dari server.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Filter logic computed during render via useMemo
  const filteredUsers = useMemo(() => {
    let result = users;

    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.username.toLowerCase().includes(search)
      );
    }

    if (classFilter !== 'Semua') {
      result = result.filter((u) => u.class === classFilter);
    }

    if (roleFilter !== 'Semua') {
      result = result.filter((u) => u.role === roleFilter);
    }

    return result;
  }, [searchTerm, classFilter, roleFilter, users]);

  // Handle Delete
  const handleDeleteUser = async (id: number, username: string) => {
    if (username === 'admin') {
      setToast({ message: 'Akun administrator bawaan tidak dapat dihapus.', type: 'error' });
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus akun "${username}" secara permanen?`)) {
      return;
    }

    setProcessingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        setToast({ message: `Akun "${username}" berhasil dihapus.`, type: 'success' });
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        setToast({ message: data.error || 'Gagal menghapus user.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Gagal menghubungi server.', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get distinct classes for the filter dropdown
  const classesList = ['Semua', ...Array.from(new Set(users.map((u) => u.class))).filter(Boolean).sort()];

  return (
    <div className="space-y-8 text-zinc-100 pb-12">
      {/* Welcome Header */}
      <div className="border-b border-zinc-800/60 pb-6">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Users className="h-4 w-4" /> Manajemen Pengguna Perpustakaan
        </div>
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Daftar Pengguna / User
        </h1>
        <p className="text-xs text-zinc-550 mt-1">
          Kelola seluruh akun pengguna terdaftar, termasuk peran admin dan kelas masing-masing siswa.
        </p>
      </div>

      {/* Filter / Search Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative group col-span-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau username..."
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900/80 transition-all"
          />
        </div>

        {/* Class Filter */}
        <div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900/80 transition-all cursor-pointer"
          >
            <option value="Semua" className="bg-zinc-900 text-zinc-300">Semua Kelas</option>
            {classesList.filter(c => c !== 'Semua').map((cls) => (
              <option key={cls} value={cls} className="bg-zinc-900 text-zinc-300">
                Kelas: {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900/80 transition-all cursor-pointer"
          >
            <option value="Semua" className="bg-zinc-900 text-zinc-300">Semua Peran (Role)</option>
            <option value="user" className="bg-zinc-900 text-zinc-300">Siswa (User)</option>
            <option value="admin" className="bg-zinc-900 text-zinc-300">Petugas (Admin)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center border border-zinc-800 bg-zinc-900/10 rounded-2xl py-24 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm text-zinc-550 animate-pulse font-medium">Memuat data user...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="overflow-hidden border border-zinc-800/80 bg-zinc-900/20 rounded-2xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  <th className="py-4 px-6 text-center w-16">No</th>
                  <th className="py-4 px-6">Nama Pengguna</th>
                  <th className="py-4 px-6">Username</th>
                  <th className="py-4 px-6">Kelas</th>
                  <th className="py-4 px-6">Peran</th>
                  <th className="py-4 px-6">Terdaftar Pada</th>
                  <th className="py-4 px-6 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs">
                {filteredUsers.map((u, idx) => {
                  const isAdmin = u.role === 'admin';
                  const isDeleting = processingId === u.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-zinc-900/30 transition-colors group"
                    >
                      {/* Index */}
                      <td className="py-4 px-6 text-center text-zinc-500 font-mono font-bold">
                        {idx + 1}
                      </td>

                      {/* Name */}
                      <td className="py-4 px-6 font-bold text-zinc-200 group-hover:text-indigo-400 transition-colors">
                        {u.name}
                      </td>

                      {/* Username */}
                      <td className="py-4 px-6 font-mono text-zinc-450">
                        @{u.username}
                      </td>

                      {/* Class */}
                      <td className="py-4 px-6 text-zinc-400 font-semibold">
                        {u.class || '-'}
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-6">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                            <ShieldCheck className="h-3 w-3" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-[10px] font-bold text-zinc-450 border border-zinc-800/60">
                            <UserCheck className="h-3 w-3" /> Siswa
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-6 text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-650" />
                          {formatDate(u.created_at)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          disabled={isAdmin || isDeleting}
                          title={isAdmin ? 'Admin default tidak dapat dihapus' : 'Hapus akun'}
                          className={`inline-flex items-center justify-center gap-1 p-2 rounded-lg border transition-all ${
                            isAdmin
                              ? 'border-transparent text-zinc-700 cursor-not-allowed opacity-40'
                              : isDeleting
                              ? 'border-zinc-800 bg-zinc-950 text-zinc-550'
                              : 'border-rose-500/20 bg-rose-500/5 text-rose-450 hover:bg-rose-500/20 hover:text-rose-350 hover:border-rose-500/40 active:scale-[0.95] cursor-pointer'
                          }`}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin text-zinc-550" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl py-20 px-4 text-center">
          <Users className="h-12 w-12 text-zinc-700 mb-3 animate-pulse" />
          <h3 className="font-bold text-zinc-400">Tidak ada user ditemukan</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
            Tidak ditemukan data user yang cocok dengan kata kunci pencarian atau filter yang dipilih.
          </p>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
