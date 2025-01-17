import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Ayah } from '../types';

export function SurahView() {
  const { number } = useParams();
  const navigate = useNavigate();
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAyahs = async () => {
      setLoading(true);
      try {
        const [arabicResponse, translationResponse] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${number}`),
          fetch(`https://api.alquran.cloud/v1/surah/${number}/en.asad`)
        ]);

        const arabicData = await arabicResponse.json();
        const translationData = await translationResponse.json();

        const combinedAyahs = arabicData.data.ayahs.map((ayah: any, index: number) => ({
          ...ayah,
          translation: translationData.data.ayahs[index].text
        }));

        setAyahs(combinedAyahs);
      } catch (error) {
        console.error('Error fetching surah:', error);
      }
      setLoading(false);
    };

    fetchAyahs();
  }, [number]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(`/surah/${Number(number) - 1}`)}
            disabled={Number(number) <= 1}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            <ChevronLeft size={20} className="mr-2" />
            Previous Surah
          </button>
          <button
            onClick={() => navigate(`/surah/${Number(number) + 1}`)}
            disabled={Number(number) >= 114}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Next Surah
            <ChevronRight size={20} className="ml-2" />
          </button>
        </div>

        <div className="space-y-6">
          {ayahs.map((ayah) => (
            <Link
              key={ayah.number}
              to={`/ayah/${number}/${ayah.numberInSurah}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="mb-4">
                  <span className="text-blue-600 font-bold">
                    {ayah.numberInSurah}
                  </span>
                </div>
                <p className="text-2xl text-right mb-4 font-arabic">
                  {ayah.text}
                </p>
                <p className="text-blue-800">{ayah.translation}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}