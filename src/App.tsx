import { useState, useEffect } from 'react';
import './animate.css';
import LoginScreen from './pages/LoginScreen';
import Dashboard from './pages/Dashboard';
import { supabase } from './lib/supabase';

// Definisikan tipe data untuk user dari database
export type User = {
  id: string; // uuid dari supabase
  name: string;
  avatar?: string;
  color: string;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kunci untuk menyimpan data di localStorage (backup)
  const SESSION_KEY = 'fundlove_session_supabase';
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

  useEffect(() => {
    // Cek sesi saat aplikasi pertama kali dimuat
    const checkSession = async () => {
      try {
        // Cek localStorage dulu
        const savedSession = localStorage.getItem(SESSION_KEY);
        
        if (savedSession) {
          const { user, timestamp } = JSON.parse(savedSession);
          const timeNow = new Date().getTime();

          // Cek apakah sesi masih valid
          if (timeNow - timestamp < SESSION_TIMEOUT) {
            // Verifikasi user masih ada di database
            const { data: userData, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();

            if (!error && userData) {
              setCurrentUser(userData);
              setIsLoggedIn(true);
            } else {
              // User tidak ditemukan di database, hapus session
              localStorage.removeItem(SESSION_KEY);
            }
          } else {
            // Session expired
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (error) {
        console.error("Gagal memuat sesi:", error);
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = async (user: User | undefined) => {
    if (!user) return;
    
    try {
      // Verifikasi user di database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error verifying user:', error);
        alert('Gagal login: User tidak ditemukan');
        return;
      }

      // Buat sesi baru di localStorage
      const sessionData = {
        user: userData,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      
      setCurrentUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login error:', error);
      alert('Terjadi kesalahan saat login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

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
          <p className="text-white font-semibold text-lg">Memuat Aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoggedIn && currentUser ? (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;