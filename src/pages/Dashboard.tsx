import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// --- TIPE DATA SESUAI SUPABASE ---
type Transaction = {
  id: string; // UUID dari Supabase
  user_id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  note?: string;
  created_at: string;
  users: {
    name: string;
    color: string;
  } | null;
};


type DashboardProps = {
  user: { id: string; name: string; color: string };
  onLogout: () => void;
};

// --- KOMPONEN MODAL EDIT TRANSAKSI ---
type EditTransactionModalProps = {
  transaction: Transaction;
  onClose: () => void;
  onSave: (id: string, newDetails: { amount: number; type: 'deposit' | 'withdraw'; note: string }) => void;
};

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ transaction, onClose, onSave }) => {
  const [amount, setAmount] = useState(new Intl.NumberFormat('id-ID').format(transaction.amount));
  const [type, setType] = useState<'deposit' | 'withdraw'>(transaction.type);
  const [note, setNote] = useState(transaction.note || '');
  
  const formatInput = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (!numbers) return '';
    return new Intl.NumberFormat('id-ID').format(Number(numbers));
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatInput(e.target.value));
  };

  const handleSave = () => {
    const numericAmount = parseInt(amount.replace(/[^\d]/g, ''), 10);
    if (!isNaN(numericAmount) && numericAmount > 0) {
      onSave(transaction.id, { amount: numericAmount, type, note });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl lg:rounded-3xl w-full max-w-md lg:max-w-lg">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl lg:text-2xl font-semibold">Edit Transaksi</h3>
            <button onClick={onClose} className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Transaksi</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setType('deposit')} 
                  className={`py-3 rounded-lg font-semibold transition-colors ${type === 'deposit' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Nabung
                </button>
                <button 
                  onClick={() => setType('withdraw')} 
                  className={`py-3 rounded-lg font-semibold transition-colors ${type === 'withdraw' ? 'bg-slate-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Tarik
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah (Rp)</label>
              <input 
                type="text" 
                inputMode="numeric" 
                value={amount} 
                onChange={handleAmountChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
              <input 
                type="text" 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                placeholder="Tulis catatan..." 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={!amount || amount === '0'} 
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${amount && amount !== '0' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN MODAL TAMBAH/TARIK UANG ---
type MoneyModalProps = {
  type: 'deposit' | 'withdraw';
  onClose: () => void;
  onSubmit: (type: 'deposit' | 'withdraw', amount: number, note: string) => void;
  maxAmount?: number;
};

const MoneyModal: React.FC<MoneyModalProps> = ({ type, onClose, onSubmit, maxAmount = Infinity }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const title = type === 'deposit' ? 'Nabung Uang' : 'Tarik Uang';
  
  const formatInput = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (!numbers) return '';
    return new Intl.NumberFormat('id-ID').format(Number(numbers));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatInput(e.target.value));
  };

  const handleSubmit = () => {
    const numericAmount = parseInt(amount.replace(/[^\d]/g, ''), 10);
    if (numericAmount > 0) {
      if (type === 'withdraw' && numericAmount > maxAmount) {
        alert('Jumlah penarikan melebihi saldo.');
        return;
      }
      onSubmit(type, numericAmount, note);
    }
  };

  const quickAmounts = [50000, 100000, 250000, 500000];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl lg:rounded-3xl w-full max-w-md lg:max-w-lg">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h3 className="text-xl lg:text-2xl font-semibold">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">Jumlah (Rp)</label>
            <input 
              type="text" 
              inputMode="numeric" 
              value={amount} 
              onChange={handleAmountChange} 
              placeholder="0" 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg lg:text-xl font-semibold" 
            />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6">
            {quickAmounts.map((qa) => (
              <button 
                key={qa} 
                onClick={() => setAmount(formatInput(qa.toString()))} 
                className="py-2 px-4 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Rp {new Intl.NumberFormat('id-ID').format(qa)}
              </button>
            ))}
          </div>
          <div className="mb-8">
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">Catatan (opsional)</label>
            <input 
              type="text" 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              placeholder="Tulis catatan..." 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={!amount || amount === '0'} 
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${amount && amount !== '0' ? type === 'deposit' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-600 hover:bg-slate-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {type === 'deposit' ? 'Nabung Sekarang' : 'Tarik Uang'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN MODAL PENGATURAN ---
type SettingsModalProps = {
  onClose: () => void;
  onSave: (target: number, months: number) => void;
  currentTarget: number;
  currentMonths: number;
};

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSave, currentTarget, currentMonths }) => {
  const [newTarget, setNewTarget] = useState(new Intl.NumberFormat('id-ID').format(currentTarget));
  const [newMonths, setNewMonths] = useState(currentMonths.toString());
  
  const formatInput = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (!numbers) return '';
    return new Intl.NumberFormat('id-ID').format(Number(numbers));
  };
  
  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTarget(formatInput(e.target.value));
  };

  const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/[^\d]/g, '');
    setNewMonths(numbers);
  };

  const handleSave = () => {
    const numericTarget = parseInt(newTarget.replace(/[^\d]/g, ''), 10);
    const numericMonths = parseInt(newMonths, 10);
    if (!isNaN(numericTarget) && numericTarget > 0 && !isNaN(numericMonths) && numericMonths > 0) {
      onSave(numericTarget, numericMonths);
    }
  };

  const isSaveDisabled = !newTarget || newTarget === '0' || !newMonths || newMonths === '0';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl lg:rounded-3xl w-full max-w-md lg:max-w-lg">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h3 className="text-xl lg:text-2xl font-semibold">Pengaturan Target</h3>
            <button onClick={onClose} className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">Target Tabungan (Rp)</label>
              <input 
                type="text" 
                value={newTarget} 
                onChange={handleTargetChange} 
                placeholder="0" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg lg:text-xl font-semibold" 
              />
            </div>
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">Jangka Waktu (Bulan)</label>
              <input 
                type="text" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                value={newMonths} 
                onChange={handleMonthsChange} 
                placeholder="Contoh: 6" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg lg:text-xl font-semibold" 
              />
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaveDisabled} 
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${!isSaveDisabled ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN UTAMA DASHBOARD ---
const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [target, setTarget] = useState(10000000);
  const [targetMonths, setTargetMonths] = useState(6);
  const [startDate, setStartDate] = useState(new Date());
  const [targetId, setTargetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      // Fetch transactions dengan join ke users
      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select(`
          *,
          users (
            name,
            color
          )
        `)
        .order('created_at', { ascending: false });
      if (transError) {
        console.error('Gagal mengambil transaksi:', transError);
      } else {
        setTransactions(transData || []);
        // Hitung balance dari transaksi
        const newBalance = (transData || []).reduce((acc, t) => {
          return t.type === 'deposit' ? acc + t.amount : acc - t.amount;
        }, 0);
        setBalance(newBalance);
      }

      // Fetch active target
      const { data: targetData, error: targetError } = await supabase
        .from('targets')
        .select('*')
        .order('updated_at', { ascending: true })
        .limit(1)
        .single();

      if (targetError) {
        if (targetError.code !== 'PGRST116') {
          console.error('Gagal mengambil target:', targetError);
        }
        // fallback default
        setTarget(10000000);
        setTargetMonths(6);
        setStartDate(new Date());
        setTargetId(null);
      } else if (targetData) {
        setTarget(targetData.target_amount);
        setTargetMonths(targetData.target_months);
        setStartDate(new Date(targetData.start_date));
        setTargetId(targetData.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTransaction = async (type: 'deposit' | 'withdraw', amount: number, note: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type,
          amount,
          note: note || null
        }]);
      
      if (error) {
        console.error('Gagal menambah transaksi:', error);
        alert('Gagal menambah transaksi: ' + error.message);
      } else {
        await fetchData();
        setShowAddMoney(false);
        setShowWithdraw(false);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Terjadi kesalahan saat menambah transaksi');
    }
  };

    const deleteTransaction = async (transactionId: string) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      try {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', transactionId)
          .eq('user_id', user.id); // ⬅️ hanya milik user sendiri

        if (error) {
          console.error('Gagal menghapus transaksi:', error);
          alert('Gagal menghapus transaksi: ' + error.message);
        } else {
          await fetchData();
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Terjadi kesalahan saat menghapus transaksi');
      }
    }
  };
  const updateTransaction = async (id: string, newDetails: { amount: number; type: 'deposit' | 'withdraw'; note: string }) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({
        type: newDetails.type,
        amount: newDetails.amount,
        note: newDetails.note || null
      })
      .eq('id', id)
      .eq('user_id', user.id); // ⬅️ pastikan hanya user yg punya transaksi ini yg bisa edit

    if (error) {
      console.error('Gagal mengedit transaksi:', error);
      alert('Gagal mengedit transaksi: ' + error.message);
    } else {
      await fetchData();
      setEditingTransaction(null);
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    alert('Terjadi kesalahan saat mengedit transaksi');
  }
};


  const handleSettingsSave = async (newTargetValue: number, newMonthsValue: number) => {
  try {
    if (targetId) {
      const { error } = await supabase
        .from('targets')
        .update({
          target_amount: newTargetValue,
          target_months: newMonthsValue,
          start_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', targetId)
        

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('targets')
        .insert({
          user_id: user.id,
          target_amount: newTargetValue,
          target_months: newMonthsValue,
          start_date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;
    }

    await fetchData();
    setShowSettings(false);
  } catch (error: any) {
    console.error('Error saving settings:', error);
    alert('Terjadi kesalahan saat menyimpan pengaturan: ' + error.message);
  }
};

  const formatCurrency = (num: number) => `Rp ${new Intl.NumberFormat('id-ID').format(num)}`;
  const formatDate = (date: Date) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  
  const progress = target > 0 ? (balance / target) * 100 : 0;
  const isTargetAchieved = balance >= target;
  
  const today = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + targetMonths);
  const remainingDays = isTargetAchieved ? 0 : Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div>
            <img 
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-bounce"
              src="/icon.svg" 
              alt="FundLove"
            />
          </div>
          <p className="text-white font-semibold text-lg">Memuat data dari Supabase...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="px-4 lg:px-8 py-6 lg:py-8">
            <div className="flex justify-between items-center mb-6 lg:mb-8">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r ${user.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm lg:text-base opacity-80">Hai,</p>
                  <p className="font-semibold text-lg lg:text-xl">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <p className="md:block text-sm font-medium text-white/90">
                  {formatDate(today)}
                </p>
                <button onClick={onLogout} className="flex-shrink-0 w-10 h-10 lg:w-auto lg:h-auto lg:px-4 lg:py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors shadow-md flex items-center justify-center lg:gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium hidden lg:inline">Logout</span>
                </button>
              </div>
            </div>
            
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl mb-6 lg:mb-0">
                <p className="text-sm lg:text-base opacity-80 mb-2">Total Tabungan</p>
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6">{formatCurrency(balance)}</h2>
                <div className="mb-4 lg:mb-6">
                  <div className="flex justify-between text-sm lg:text-base mb-2">
                    <span>Progress ke Target</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 lg:h-3">
                    <div className="bg-white rounded-full h-2 lg:h-3 transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>
                  <p className="text-sm lg:text-base opacity-80 mt-2">Target: {formatCurrency(target)} / {targetMonths} bulan</p>
                </div>
              </div>
              
              <div className="hidden lg:block space-y-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-white text-sm">Target</p>
                  </div>
                  {isTargetAchieved ? (
                    <>
                      <p className="text-2xl font-bold text-white">Selamat! 🎉</p>
                      <p className="text-xs text-white/70">Anda telah mencapai target</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-white">{remainingDays} <span className="text-lg font-medium">hari lagi</span></p>
                      <p className="text-xs text-white/70 mt-1">Target Selesai: {formatDate(endDate)}</p>
                    </>
                  )}
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <p className="text-white text-sm">Kurang</p>
                  </div>
                  <p className="text-xl font-bold text-white">{isTargetAchieved ? 'Rp 0' : formatCurrency(target - balance)}</p>
                  <p className="text-xs text-white/70">{isTargetAchieved ? 'Target tercapai!' : 'untuk mencapai target'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-8 -mt-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setShowAddMoney(true)}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-semibold">Nabung</span>
              </button>

              <button
                onClick={() => setShowWithdraw(true)}
                className="flex items-center justify-center space-x-2 bg-slate-600 text-white py-3 px-4 rounded-xl hover:bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                <span className="font-semibold">Tarik</span>
              </button>

              <button className="flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Laporan</span>
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Pengaturan</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 mb-6 lg:hidden">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Target</p>
              </div>
              {isTargetAchieved ? (
                <>
                  <p className="text-xl font-bold text-gray-800">Tercapai! 🎉</p>
                  <p className="text-xs text-gray-500">Selamat, target terpenuhi</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-800">{remainingDays} <span className="text-lg font-medium">hari</span></p>
                  <p className="text-xs text-gray-500 mt-1">Target: {formatDate(endDate)}</p>
                </>
              )}
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Kurang</p>
              </div>
              <p className="text-xl font-bold text-gray-800">{isTargetAchieved ? 'Rp 0' : formatCurrency(target - balance)}</p>
              <p className="text-xs text-gray-500">{isTargetAchieved ? 'Target tercapai!' : 'untuk mencapai target'}</p>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-8 pb-6 lg:pb-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-lg lg:text-xl">Transaksi Terakhir</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="p-4 lg:p-6 flex items-start justify-between">
                  <div className="flex items-start space-x-3 lg:space-x-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex-shrink-0 flex items-center justify-center ${transaction.type === 'deposit' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                      {transaction.type === 'deposit' ? (
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-sm lg:text-base truncate">{transaction.type === 'deposit' ? 'Nabung' : 'Tarik Uang'}</p>
                      <p className="text-xs lg:text-sm text-gray-500 mb-1">
                        {transaction.users?.name || 'Unknown'} • {formatDate(new Date(transaction.created_at))}
                      </p>
                      {transaction.note && (
                        <p className="text-xs lg:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md inline-block">{transaction.note}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-2">
                    <p className={`font-semibold text-sm lg:text-base whitespace-nowrap ${transaction.type === 'deposit' ? 'text-blue-600' : 'text-slate-600'}`}>
                      {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setEditingTransaction(transaction)} 
                        className="w-8 h-8 bg-yellow-100 hover:bg-yellow-200 rounded-full flex items-center justify-center" 
                        title="Edit transaksi"
                      >
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => deleteTransaction(transaction.id)} 
                        className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center" 
                        title="Hapus transaksi"
                      >
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddMoney && (
        <MoneyModal 
          type="deposit" 
          onClose={() => setShowAddMoney(false)} 
          onSubmit={addTransaction} 
        />
      )}
      {showWithdraw && (
        <MoneyModal 
          type="withdraw" 
          onClose={() => setShowWithdraw(false)} 
          onSubmit={addTransaction} 
          maxAmount={balance} 
        />
      )}
      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)} 
          onSave={handleSettingsSave} 
          currentTarget={target} 
          currentMonths={targetMonths} 
        />
      )}
      {editingTransaction && (
        <EditTransactionModal 
          transaction={editingTransaction} 
          onClose={() => setEditingTransaction(null)} 
          onSave={updateTransaction} 
        />
      )}
    </div>
  );
};


export default Dashboard;

