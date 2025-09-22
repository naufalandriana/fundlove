import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Definisikan tipe User sesuai database
export type User = {
  id: string;
  name: string;
  color: string;
  avatar?: string;
};

// Props LoginScreen
type LoginScreenProps = {
  onLogin: (user: User | undefined) => void;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users dari Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        if (data) {
          setUsers(data);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Gagal memuat daftar user');
        // Fallback ke user hardcoded jika ada masalah
        setUsers([
          // { id: 'fallback-1', name: 'Opang', color: 'from-blue-500 to-blue-600' },
          // { id: 'fallback-2', name: 'Lia', color: 'from-pink-500 to-pink-600' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogin = () => {
    if (!selectedUser) return;

    setIsAnimating(true);
    setTimeout(() => {
      const user = users.find(u => u.id === selectedUser);
      onLogin(user);
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div>
            <img 
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-bounce"
              src="/icon.svg" 
              alt="FundLove"
            />
          </div>
          <p className="text-white font-semibold text-lg">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className={`w-full max-w-md lg:max-w-lg xl:max-w-xl transition-all duration-800 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
        {/* Logo & Header */}
        <div className="text-center mb-8 lg:mb-12">
          <img  className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center lg:mb-6 mx-auto " src="/icon.svg" alt="FundLove"></img>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-2">Fundlove</h1>
          <p className="text-white/80 text-sm lg:text-base">Tabungan bersama buat akhir semester</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-200 text-sm text-center">{error}</p>
          </div>
        )}

        {/* User Selection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl lg:rounded-3xl p-4 lg:p-6 mb-6 shadow-xl">
          <h2 className="text-white text-lg lg:text-xl font-semibold mb-4 text-center">Pilih Akun</h2>
          
          <div className="space-y-3">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={`w-full p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all duration-300 flex items-center space-x-3 lg:space-x-4 ${
                  selectedUser === user.id 
                    ? 'bg-white text-gray-800 shadow-lg scale-105' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r ${user.color} flex items-center justify-center text-white text-base lg:text-lg font-bold shadow-lg`}>
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{user.name}</div>
                  <div className={`text-sm ${selectedUser === user.id ? 'text-gray-500' : 'text-white/70'}`}>
                    Member Fundlove
                  </div>
                </div>
                {selectedUser === user.id && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={!selectedUser || isAnimating}
          className={`w-full py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold text-base lg:text-lg transition-all duration-300 ${
            selectedUser && !isAnimating
              ? 'bg-white text-blue-600 hover:bg-gray-100 shadow-xl transform hover:scale-105 active:scale-95'
              : 'bg-white/30 text-white/50 cursor-not-allowed'
          }`}
        >
          {isAnimating ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              <span>Masuk...</span>
            </div>
          ) : (
            'Mulai Nabung'
          )}
        </button>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">Versi 1.0 - Powered by Supabase</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;