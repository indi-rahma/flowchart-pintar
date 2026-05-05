import React, { createContext, useState, useEffect } from 'react';

// 1. Export context-nya supaya bisa dipakai di useContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 2. Logic state untuk progres belajar
  const [userProgress, setUserProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('flowchart_learning_stats');
      return saved ? JSON.parse(saved) : { completedModules: [1] };
    } catch (error) {
      return { completedModules: [1] };
    }
  });

  // 3. Simpan ke localStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem('flowchart_learning_stats', JSON.stringify(userProgress));
  }, [userProgress]);

  // 4. Fungsi untuk membuka modul selanjutnya
  const unlockNextModule = (currentId) => {
    const nextId = parseInt(currentId) + 1;
    setUserProgress(prev => ({
      ...prev,
      completedModules: [...new Set([...prev.completedModules, nextId])]
    }));
  };

  return (
    <AuthContext.Provider value={{ userProgress, unlockNextModule }}>
      {children}
    </AuthContext.Provider>
  );
};

// File ini hanya bertugas mengekspor AuthContext dan AuthProvider.