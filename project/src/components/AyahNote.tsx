import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import type { Ayah, Note } from '../types';

export function AyahNote() {
  const { surahNumber, ayahNumber } = useParams();
  const navigate = useNavigate();
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [totalAyahs, setTotalAyahs] = useState(0);

  useEffect(() => {
    const fetchAyah = async () => {
      try {
        const [arabicResponse, translationResponse, surahResponse] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}`),
          fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/en.asad`),
          fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`)
        ]);

        const arabicData = await arabicResponse.json();
        const translationData = await translationResponse.json();
        const surahData = await surahResponse.json();

        setAyah({
          ...arabicData.data,
          translation: translationData.data.text
        });
        setTotalAyahs(surahData.data.numberOfAyahs);

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
          } else {
            setNote('');
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

  const navigateToAyah = (direction: 'prev' | 'next') => {
    const currentAyah = Number(ayahNumber);
    const currentSurah = Number(surahNumber);

    if (direction === 'prev') {
      if (currentAyah > 1) {
        navigate(`/ayah/${currentSurah}/${currentAyah - 1}`);
      } else if (currentSurah > 1) {
        // Navigate to the last ayah of the previous surah
        fetch(`https://api.alquran.cloud/v1/surah/${currentSurah - 1}`)
          .then(res => res.json())
          .then(data => {
            navigate(`/ayah/${currentSurah - 1}/${data.data.numberOfAyahs}`);
          });
      }
    } else {
      if (currentAyah < totalAyahs) {
        navigate(`/ayah/${currentSurah}/${currentAyah + 1}`);
      } else if (currentSurah < 114) {
        // Navigate to the first ayah of the next surah
        navigate(`/ayah/${currentSurah + 1}/1`);
      }
    }
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
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => navigate(`/surah/${surahNumber}`)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft size={20} className="mr-2" />
            Back to Surah
          </button>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigateToAyah('prev')}
              disabled={Number(surahNumber) === 1 && Number(ayahNumber) === 1}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} className="mr-2" />
              Previous Ayah
            </button>
            <button
              onClick={() => navigateToAyah('next')}
              disabled={Number(surahNumber) === 114 && Number(ayahNumber) === totalAyahs}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Ayah
              <ChevronRight size={20} className="ml-2" />
            </button>
          </div>
        </div>

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