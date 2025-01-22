import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookOpen, Edit, Volume2, Bookmark } from "lucide-react";
import type { Ayah } from "../types";
import { Button } from "@/components/ui/button";
import { supabase } from "../supabase";

export function SurahView() {
  const { number } = useParams();
  const navigate = useNavigate();
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  // Fetch User Session
  const fetchUserSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.warn("No session found. Redirecting to login...");
        return null;
      }
      return session.user;
    } catch (err: any) {
      console.error("Unexpected error fetching session:", err.message);
      return null;
    }
  };

  useEffect(() => {
    const fetchAyahs = async () => {
      setLoading(true);
      try {
        // Fetch Surah Ayahs
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${number}`);
        const arabicData = await response.json();
        setAyahs(arabicData.data.ayahs);

        // Fetch Bookmarks
        const user = await fetchUserSession();
        if (user) {
          const { data: userBookmarks, error } = await supabase
            .from("bookmarks")
            .select("ayah_number")
            .eq("user_id", user.id)
            .eq("surah_number", Number(number));
          if (error) {
            console.error("Error fetching bookmarks:", error.message);
          } else {
            setBookmarks(userBookmarks.map((b) => b.ayah_number));
          }
        }
      } catch (error) {
        console.error("Error fetching surah or bookmarks:", error);
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

  const toggleBookmark = async (ayahNumber: number) => {
    const user = await fetchUserSession();
    if (!user) return;

    try {
      const { data: existingBookmark, error: fetchError } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .eq("surah_number", Number(number))
        .eq("ayah_number", ayahNumber)
        .limit(1);

      if (fetchError) {
        console.error("Error checking bookmark:", fetchError.message);
        return;
      }

      if (existingBookmark && existingBookmark.length > 0) {
        // Bookmark exists: remove it
        const { error: deleteError } = await supabase
          .from("bookmarks")
          .delete()
          .eq("id", existingBookmark[0].id);
        if (deleteError) {
          console.error("Error deleting bookmark:", deleteError.message);
        } else {
          setBookmarks((prev) => prev.filter((b) => b !== ayahNumber));
          console.log("Bookmark removed.");
        }
      } else {
        // Bookmark does not exist: add it
        const { error: insertError } = await supabase.from("bookmarks").insert({
          user_id: user.id,
          surah_number: Number(number),
          ayah_number: ayahNumber,
        });
        if (insertError) {
          console.error("Error inserting bookmark:", insertError.message);
        } else {
          setBookmarks((prev) => [...prev, ayahNumber]);
          console.log("Bookmark added.");
        }
      }
    } catch (err) {
      console.error("Unexpected error toggling bookmark:", err.message);
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
              {/* Bookmark, Edit, and Play Icons */}
              <div className="absolute top-0 right-0 flex gap-2">
                <button
                  onClick={() => toggleBookmark(ayah.numberInSurah)}
                  className={`p-2 rounded-full ${
                    bookmarks.includes(ayah.numberInSurah)
                      ? "bg-yellow-300 text-gray-800"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  <Bookmark size={20} />
                </button>
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