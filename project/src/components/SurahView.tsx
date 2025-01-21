import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookOpen, Edit, Volume2 } from "lucide-react";
import type { Ayah } from "../types";
import { Button } from "@/components/ui/button";

export function SurahView() {
  const { number } = useParams();
  const navigate = useNavigate();
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchAyahs = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${number}`);
        const arabicData = await response.json();
        setAyahs(arabicData.data.ayahs);
      } catch (error) {
        console.error("Error fetching surah:", error);
      }
      setLoading(false);
    };

    fetchAyahs();
  }, [number]);

  const playRecitation = async (ayahNumber: number) => {
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/ayah/${number}:${ayahNumber}/ar.alafasy`
      );
      const data = await response.json();
      if (data.code === 200 && data.data.audio) {
        if (audio) {
          audio.pause();
        }
        const newAudio = new Audio(data.data.audio);
        setAudio(newAudio);
        newAudio.play();
      } else {
        console.error("Recitation not available for this Ayah");
      }
    } catch (error) {
      console.error("Error fetching recitation:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={() => navigate("/surahs")}
          >
            <BookOpen size={20} />
            Back to All Surahs
          </Button>
        </div>

        {/* Next/Previous Surah Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={() => navigate(`/surah/${Number(number) - 1}`)}
            disabled={Number(number) <= 1}
          >
            <ChevronLeft size={20} />
            Previous Surah
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={() => navigate(`/surah/${Number(number) + 1}`)}
            disabled={Number(number) >= 114}
          >
            Next Surah
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* Surah Content */}
        <div className="space-y-8">
          {ayahs.map((ayah) => (
            <div key={ayah.number} className="relative">
              {/* Edit and Play Icons */}
              <div className="absolute top-0 right-0 flex gap-2">
                <button
                  onClick={() =>
                    navigate(`/ayah/${number}/${ayah.numberInSurah}`)
                  }
                  className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-800"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => playRecitation(ayah.numberInSurah)}
                  className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-800"
                >
                  <Volume2 size={20} />
                </button>
              </div>

              <div className="py-4">
                {/* Ayah Number */}
                <span className="block text-gray-800 font-bold mb-2">
                  {ayah.numberInSurah}
                </span>

                {/* Arabic Text */}
                <p className="text-2xl text-right mb-2 font-arabic text-gray-800">
                  {ayah.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}