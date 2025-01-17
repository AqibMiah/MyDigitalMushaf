import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SurahList } from './components/SurahList';
import { SurahView } from './components/SurahView';
import { AyahNote } from './components/AyahNote';
import { AuthForm } from './components/AuthForm';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/surahs" />} />
          <Route path="/surahs" element={<SurahList />} />
          <Route path="/surah/:number" element={<SurahView />} />
          <Route path="/ayah/:surahNumber/:ayahNumber" element={<AyahNote />} />
          <Route path="/login" element={<AuthForm type="login" />} />
          <Route path="/register" element={<AuthForm type="register" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;