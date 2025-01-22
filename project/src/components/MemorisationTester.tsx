import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Book, Volume2 } from "lucide-react";

export default function MemorisationTester() {
  const [surah, setSurah] = useState<string>("");
  const [juz, setJuz] = useState<string>("");
  const [ayah, setAyah] = useState<{
    text: string;
    audio: string;
    surahName: string;
    ayahNumber: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null); // Reference to the audio object

  const fetchRandomAyah = async () => {
    if (!surah.trim() && !juz.trim()) {
      setError("Please enter either a Surah number or a Juz number.");
      return;
    }

    // Stop current audio if playing
    if (audio) {
      audio.pause();
      setAudio(null);
    }

    setError(null);
    setLoading(true);
    setAyah(null);

    try {
      let response;
      let ayahs;
      let surahName = "";

      if (surah.trim()) {
        // Fetch data for the specified Surah
        response = await fetch(`https://api.alquran.cloud/v1/surah/${surah}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data. Please check your input.");
        }
        const data = await response.json();
        if (data.status !== "OK") {
          throw new Error("Invalid input. Please try again.");
        }
        ayahs = data.data.ayahs;
        surahName = data.data.englishName;
      } else if (juz.trim()) {
        // Fetch data for the specified Juz
        response = await fetch(`https://api.alquran.cloud/v1/juz/${juz}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data. Please check your input.");
        }
        const data = await response.json();
        if (data.status !== "OK") {
          throw new Error("Invalid input. Please try again.");
        }
        ayahs = data.data.ayahs;
        // Extract Surah name from the Ayah metadata
        const randomAyah = ayahs[Math.floor(Math.random() * ayahs.length)];
        const surahResponse = await fetch(
          `https://api.alquran.cloud/v1/surah/${randomAyah.surah.number}`
        );
        const surahData = await surahResponse.json();
        if (surahData.status !== "OK") {
          throw new Error("Failed to fetch Surah details.");
        }
        surahName = surahData.data.englishName;
      }

      if (!ayahs || ayahs.length === 0) {
        throw new Error("No Ayah found. Please try again.");
      }

      // Randomize and pick one Ayah
      const randomAyah = ayahs[Math.floor(Math.random() * ayahs.length)];

      // Fetch audio data for the specific Ayah
      const audioResponse = await fetch(
        `https://api.alquran.cloud/v1/ayah/${randomAyah.number}/ar.alafasy`
      );
      const audioData = await audioResponse.json();
      if (audioData.code !== 200 || !audioData.data.audio) {
        throw new Error("Audio not available for this Ayah.");
      }

      setAyah({
        text: randomAyah.text,
        audio: audioData.data.audio, // Use the fetched audio URL
        surahName: surahName,
        ayahNumber: randomAyah.numberInSurah,
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async () => {
    if (ayah?.audio) {
      try {
        // Stop current audio if playing
        if (audio) {
          audio.pause();
        }

        const newAudio = new Audio(ayah.audio);
        setAudio(newAudio); // Save the new audio instance
        await newAudio.play().catch((error) => {
          console.error("Error playing audio:", error.message);
          setError("Failed to play the audio. Please try again.");
        });
      } catch (error: any) {
        console.error("Audio fetching error:", error.message);
        setError("An error occurred while fetching the audio.");
      }
    } else {
      setError("Audio is not available for this Ayah.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Memorisation Tester
        </h1>
        <p className="text-gray-600 mb-4 text-center">
          Enter a Surah number or Juz number below to test your memorisation.
        </p>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="relative">
            <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              value={surah}
              onChange={(e) => {
                setSurah(e.target.value);
                if (e.target.value.trim()) setJuz("");
              }}
              placeholder="Enter Surah number"
              className="pl-10"
              disabled={!!juz.trim()}
            />
          </div>
          <div className="relative">
            <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              value={juz}
              onChange={(e) => {
                setJuz(e.target.value);
                if (e.target.value.trim()) setSurah("");
              }}
              placeholder="Enter Juz number"
              className="pl-10"
              disabled={!!surah.trim()}
            />
          </div>
          <Button
            onClick={fetchRandomAyah}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Loading..." : "Fetch Random Ayah"}
          </Button>
        </div>
        {ayah && (
          <div className="bg-gray-100 p-4 rounded-lg mt-6">
            <h3 className="text-center text-gray-800 font-bold mb-2">
              {ayah.surahName} (Ayah {ayah.ayahNumber})
            </h3>
            <p className="text-gray-800 text-lg text-right" dir="rtl">
              {ayah.text}
            </p>
            <Button
              onClick={playAudio}
              className="flex items-center gap-2 mt-4"
            >
              <Volume2 className="h-5 w-5" />
              Play Audio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}