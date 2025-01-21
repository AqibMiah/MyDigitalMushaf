import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "./components/theme-provider";
import { SurahList } from './components/SurahList';
import { SurahView } from './components/SurahView';
import { AyahNote } from './components/AyahNote';
import { AuthForm } from './components/AuthForm';
import { Navbar } from './components/Navbar';
import { Settings } from './components/Settings';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/surahs" />} />
            <Route path="/surahs" element={<SurahList />} />
            <Route path="/surah/:number" element={<SurahView />} />
            <Route path="/ayah/:surahNumber/:ayahNumber" element={<AyahNote />} />
            <Route path="/login" element={<AuthForm type="login" />} />
            <Route path="/register" element={<AuthForm type="register" />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;