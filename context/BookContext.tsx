'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Book {
  _id: string;
  title: string;
  cover_image?: string;
  author: {
    name: string;
  };
  category: {
    name: string;
  };
  summary: string;
  details?: {
    isbn?: string;
    price?: string;
    total_pages?: string;
    published_date?: string;
    format?: string;
  };
  publisher?: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  bookId: string;
  bookTitle: string;
  coverImage?: string;
  studentName: string;
  studentUsername: string;
  borrowDate: string; // ISO date
  dueDate: string; // ISO date
  returnDate: string | null; // ISO date
  status: 'pending' | 'borrowed' | 'returned' | 'late';
  fine: number;
}

export interface Student {
  username: string;
  name: string;
  class: string;
}

interface BookContextType {
  books: Book[];
  transactions: Transaction[];
  students: Student[];
  addBook: (book: Omit<Book, '_id'>) => Book;
  updateBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  borrowBook: (bookId: string, studentUsername: string, durationDays?: number, isAdminManual?: boolean) => Promise<{ success: boolean; message: string }>;
  returnBook: (transactionId: string) => Promise<{ success: boolean; message: string }>;
  approveRequest: (transactionId: string) => Promise<{ success: boolean; message: string }>;
  rejectRequest: (transactionId: string) => Promise<{ success: boolean; message: string }>;
  getBorrowedBooksForUser: (username: string) => Transaction[];
  isBookAvailable: (bookId: string) => boolean;
  addStudent: (student: Student) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<{ success: boolean; message: string }>;
  deleteTransaction: (transactionId: string) => Promise<{ success: boolean; message: string }>;
  refreshStudents: () => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

// High-quality seed data from Bukuacak API as fallback
const SEED_BOOKS: Book[] = [
  {
    _id: "6782324379bd51cee772b72d",
    title: "Harry Potter dan Si Anak Terkutuk: Naskah Drama Orisinal",
    cover_image: "https://gpu.id/data-gpu/images/img-book/94735/Fiksi_-_Harry_Potter_dan_Si_Anak_Terkutuk_Naskah_Drama_Orisinal.jpg",
    author: { name: "J.K. Rowling" },
    category: { name: "Drama" },
    summary: "Menjadi Harry Potter memang sulit dan sekarang pun tidak lebih mudah ketika ia menjadi pegawai Kementerian Sihir yang kelelahan, suami, dan ayah tiga anak usia sekolah. Sementara Harry berjuang menghadapi masa lalu yang mengikutinya, putra bungsunya, Albus, harus berjuang menghadapi beban warisan keluarga yang tak pernah ia inginkan.",
    details: {
      isbn: "9786020680170",
      price: "Rp 139,000",
      total_pages: "384 pages",
      published_date: "29 January 2025",
      format: "Soft Cover"
    },
    publisher: "Gramedia Pustaka Utama"
  },
  {
    _id: "6782324179bd51cee772b72c",
    title: "Focus on What Matters",
    cover_image: "https://gpu.id/data-gpu/images/img-book/94734/Hum_-_Focus_on_What_Matters.jpg",
    author: { name: "Darius Foroux" },
    category: { name: "Self-Improvement" },
    summary: "Mengapa begitu sulit untuk hidup sejahtera di tengah kekacauan dan kebisingan? Ini bukan masalah dunia modern saja, melainkan persoalan manusia sepanjang masa. Dua ribu tahun lalu, para Stoik kuno sudah membicarakan tantangan-tantangan yang kita hadapi saat ini. Buku ini merupakan kumpulan 70 surat/esai Stoikisme.",
    details: {
      isbn: "9786020679761",
      price: "Rp 119,000",
      total_pages: "294 pages",
      published_date: "21 January 2025",
      format: "Soft Cover"
    },
    publisher: "Gramedia Pustaka Utama"
  },
  {
    _id: "6782323279bd51cee772b724",
    title: "Petualangan Sukab",
    cover_image: "https://gpu.id/data-gpu/images/img-book/94726/petualangan_sukab.jpg",
    author: { name: "Seno Gumira Ajidarma" },
    category: { name: "Literary" },
    summary: "WASPADA! AWASI TANGAN ANDA! Saudara-saudara sebangsa dan setanah air, sebagai kelanjutan masalah penemuan tangan, diketahui bahwa ternyata banyak tangan telah dipotong, dibawa pergi, dan tidak diketahui di mana rimbanya, kecuali beberapa yang ditemukan secara kebetulan.",
    details: {
      isbn: "9786020680033",
      price: "Rp 99,000",
      total_pages: "174 pages",
      published_date: "25 December 2024",
      format: "Soft Cover"
    },
    publisher: "Gramedia Pustaka Utama"
  }
];

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize data from server database and Bukuacak API
  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Fetch transactions from database api
        const txRes = await fetch('/api/transactions');
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData);
        }

        // 2. Fetch students from database api
        const stdRes = await fetch('/api/students');
        if (stdRes.ok) {
          const stdData = await stdRes.json();
          setStudents(stdData);
        }

        // 3. Fetch books from Bukuacak API
        const bookRes = await fetch('https://api.bukuacak.shabsolute.tech/api/v1/book?limit=100');
        if (bookRes.ok) {
          const bookData = await bookRes.json();
          setBooks(bookData.books || []);
        } else {
          setBooks(SEED_BOOKS);
        }
      } catch (err) {
        console.error('Error fetching data from API:', err);
        setBooks(SEED_BOOKS);
      } finally {
        setIsLoaded(true);
      }
    };

    initData();
  }, []);

  // CRUD Books (Retained for compatibility but made no-ops since books are API-driven)
  const addBook = (bookData: Omit<Book, '_id'>): Book => {
    const newBook: Book = {
      ...bookData,
      _id: 'custom_' + Date.now().toString(),
      isCustom: true
    };
    return newBook;
  };

  const updateBook = (updatedBook: Book) => { };
  const deleteBook = (id: string) => { };

  // Availability check — buku terkunci jika ada transaksi pending, borrowed, atau late
  const isBookAvailable = (bookId: string): boolean => {
    return !transactions.some(tx => tx.bookId === bookId && (tx.status === 'pending' || tx.status === 'borrowed' || tx.status === 'late'));
  };

  // Transactions operations
  const borrowBook = async (bookId: string, studentUsername: string, durationDays = 7, isAdminManual = false): Promise<{ success: boolean; message: string }> => {
    let book = books.find(b => b._id === bookId);
    if (!book) {
      try {
        const res = await fetch(`https://api.bukuacak.shabsolute.tech/api/v1/book/${bookId}`);
        if (res.ok) {
          book = await res.json();
        }
      } catch (err) {
        console.error('Error fetching book detail:', err);
      }
    }

    if (!book) {
      return { success: false, message: 'Buku tidak ditemukan.' };
    }

    if (!isBookAvailable(bookId)) {
      return { success: false, message: 'Buku sedang dipinjam oleh siswa lain.' };
    }

    // Auto-register student if not yet in database
    const usernameLower = studentUsername.toLowerCase().trim();
    let student = students.find(s => s.username === usernameLower);
    if (!student) {
      const formattedName = usernameLower.charAt(0).toUpperCase() + usernameLower.slice(1);
      student = { username: usernameLower, name: formattedName, class: 'XII-RPL-1' };
      await addStudent(student);
    }

    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(borrowDate.getDate() + durationDays);

    // Admin manual borrowing: langsung 'borrowed', tanpa perlu approval
    // Siswa meminjam sendiri: 'pending' menunggu persetujuan admin
    const txStatus = isAdminManual ? 'borrowed' : 'pending';

    const newTx = {
      bookId: book._id,
      bookTitle: book.title,
      coverImage: book.cover_image,
      studentName: student.name,
      studentUsername: student.username,
      borrowDate: borrowDate.toISOString(),
      dueDate: dueDate.toISOString(),
      returnDate: null,
      status: txStatus as 'borrowed' | 'pending',
      fine: 0
    };

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      });
      if (!res.ok) throw new Error('Failed to save transaction');
      const data = await res.json();

      setTransactions(prev => [data.transaction, ...prev]);

      if (isAdminManual) {
        return { success: true, message: `Peminjaman "${book.title}" berhasil diproses langsung oleh admin.` };
      }
      return { success: true, message: `Permintaan peminjaman "${book.title}" telah dikirim. Menunggu persetujuan petugas perpustakaan.` };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Gagal memproses permintaan peminjaman pada database.' };
    }
  };

  const approveRequest = async (transactionId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });
      if (!res.ok) throw new Error('Failed to approve');
      const data = await res.json();
      setTransactions(prev => prev.map(t => t.id === transactionId ? data.transaction : t));
      return { success: true, message: 'Peminjaman berhasil disetujui.' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Gagal menyetujui permintaan.' };
    }
  };

  const rejectRequest = async (transactionId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      });
      if (!res.ok) throw new Error('Failed to reject');
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      return { success: true, message: 'Permintaan peminjaman ditolak.' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Gagal menolak permintaan.' };
    }
  };

  const returnBook = async (transactionId: string): Promise<{ success: boolean; message: string }> => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) {
      return { success: false, message: 'Transaksi tidak ditemukan.' };
    }

    if (tx.returnDate !== null) {
      return { success: false, message: 'Buku sudah pernah dikembalikan.' };
    }

    const returnDate = new Date();
    const dueDate = new Date(tx.dueDate);
    let finalFine = 0;

    if (returnDate > dueDate) {
      const diffTime = Math.abs(returnDate.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      finalFine = diffDays * 1000;
    }

    const updatedTx = {
      ...tx,
      returnDate: returnDate.toISOString(),
      status: 'returned' as const,
      fine: finalFine
    };

    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTx)
      });
      if (!res.ok) throw new Error('Failed to update transaction');
      const data = await res.json();

      setTransactions(prev => prev.map(t => t.id === transactionId ? data.transaction : t));
      return {
        success: true,
        message: `Buku "${tx.bookTitle}" berhasil dikembalikan. ${finalFine > 0 ? `Denda keterlambatan: Rp ${finalFine.toLocaleString('id-ID')}` : 'Tidak ada denda.'}`
      };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Gagal memproses pengembalian di database.' };
    }
  };

  const updateTransaction = async (updatedTx: Transaction): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/transactions/${updatedTx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTx)
      });
      if (!res.ok) throw new Error('Failed to update transaction');
      const data = await res.json();

      setTransactions(prev => prev.map(t => t.id === updatedTx.id ? data.transaction : t));
      return { success: true, message: 'Transaksi berhasil diperbarui.' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Gagal memperbarui transaksi pada database.' };
    }
  };

  const deleteTransaction = async (transactionId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete transaction');

      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      return { success: true, message: 'Transaksi berhasil dihapus secara permanen.' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Gagal menghapus transaksi dari database.' };
    }
  };

  const getBorrowedBooksForUser = (username: string): Transaction[] => {
    return transactions.filter(t => t.studentUsername === username.toLowerCase());
  };

  const addStudent = async (student: Student) => {
    if (students.some(s => s.username === student.username.toLowerCase())) return;

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...student, username: student.username.toLowerCase() })
      });
      if (!res.ok) throw new Error('Failed to save student');
      const data = await res.json();

      setStudents(prev => [...prev, data.student]);
    } catch (err) {
      console.error('Failed to register student on server database:', err);
      // Fallback local update if network fails
      setStudents(prev => [...prev, { ...student, username: student.username.toLowerCase() }]);
    }
  };

  const refreshStudents = useCallback(async () => {
    try {
      const stdRes = await fetch('/api/students');
      if (stdRes.ok) {
        const stdData = await stdRes.json();
        setStudents(stdData);
      }
    } catch (err) {
      console.error('Error refreshing students:', err);
    }
  }, []);

  return (
    <BookContext.Provider value={{
      books,
      transactions,
      students,
      addBook,
      updateBook,
      deleteBook,
      borrowBook,
      returnBook,
      approveRequest,
      rejectRequest,
      getBorrowedBooksForUser,
      isBookAvailable,
      addStudent,
      updateTransaction,
      deleteTransaction,
      refreshStudents
    }}>
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
}
