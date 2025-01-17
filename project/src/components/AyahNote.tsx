import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { ChevronLeft, Save } from 'lucide-react';
import type { Ayah, Note } from '../types';

export function AyahNote() {
  const { surahNumber, ayahNumber } = useParams();
  const navigate = useNavigate();
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAyah = async () => {
      try {
        const [arabicResponse, translationResponse] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}`),
          fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/en.asad`)
        ]);

        const arabicData = await arabicResponse.json();
        const translationData = await translationResponse.json();

        setAyah({
          ...arabicData.data,
          translation: translationData.data.text
        });

        // Fetch existing note
        const { data: user } = await supabase.auth.getUser();
        if (user) {
          const { data: noteData } = await supabase
            .from('notes')
            .select('content')
            .eq('user_id', user.user.id)
            .eq('surah_number', surahNumber)
            .eq('ayah_number', ayahNumber)
            .single();

          if (noteData) {
            setNote(noteData.content);
          }
        }
      } catch (error) {
        console.error('Error fetching ayah:', error);
      }
      setLoading(false);
    };

    fetchAyah();
  }, [surahNumber, ayahNumber]);

  const saveNote = async () => {
    setSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('notes')
        .upsert({
          user_id: user.user.id,
          surah_number: Number(surahNumber),
          ayah_number: Number(ayahNumber),
          content: note
        })
        .select();

      if (error) throw error;
    } catch (error) {
      console.error('Error saving note:', error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ayah) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(`/surah/${surahNumber}`)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg mb-8"
        >
          <ChevronLeft size={20} className="mr-2" />
          Back to Surah
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="mb-4">
              <span className="text-blue-600 font-bold">
                {ayah.numberInSurah}
              </span>
            </div>
            <p className="text-2xl text-right mb-4 font-arabic">{ayah.text}</p>
            <p className="text-blue-800">{ayah.translation}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Your Notes</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-64 p-4 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write your notes here..."
            />
            <button
              onClick={saveNote}
              disabled={saving}
              className="mt-4 flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              <Save size={20} className="mr-2" />
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}