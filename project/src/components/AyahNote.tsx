import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { ChevronLeft, ChevronRight, Save, AlertCircle, Volume2, Bookmark } from "lucide-react";
import type { Ayah } from "../types";
import { Button } from "@/components/ui/button";

export function AyahNote() {
  const { surahNumber, ayahNumber } = useParams();
  const navigate = useNavigate();
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [note, setNote] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [totalAyahs, setTotalAyahs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

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
    const fetchAyah = async () => {
      try {
        setLoading(true);

        const [arabicResponse, surahResponse] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}`),
          fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`),
        ]);

        const arabicData = await arabicResponse.json();
        const surahData = await surahResponse.json();

        setAyah(arabicData.data);
        setTotalAyahs(surahData.data.numberOfAyahs);

        const user = await fetchUserSession();
        if (user) {
          // Fetch Note
          const { data: noteData, error: noteError } = await supabase
            .from("notes")
            .select("content")
            .eq("user_id", user.id)
            .eq("surah_number", Number(surahNumber))
            .eq("ayah_number", Number(ayahNumber));

          if (noteError) {
            console.error("Error fetching note:", noteError.message);
          } else if (noteData && noteData.length > 0) {
            setNote(noteData[0].content || ""); // Handle multiple rows safely
          } else {
            setNote(""); // No note found
          }

          // Fetch Bookmark
          const { data: bookmarkData, error: bookmarkError } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", user.id)
            .eq("surah_number", Number(surahNumber))
            .eq("ayah_number", Number(ayahNumber));

          if (bookmarkError) {
            console.error("Error fetching bookmark:", bookmarkError.message);
          } else if (bookmarkData && bookmarkData.length > 0) {
            setIsBookmarked(true);
          } else {
            setIsBookmarked(false); // No bookmark found
          }
        } else {
          navigate("/login");
        }
      } catch (err: any) {
        console.error("Error fetching ayah:", err.message);
        setError("Failed to load Ayah details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAyah();
  }, [surahNumber, ayahNumber, navigate]);

  const saveNote = async () => {
    setSaving(true);
    setError(null);

    try {
      const user = await fetchUserSession();
      if (!user) return;

      const { error } = await supabase
        .from("notes")
        .upsert({
          user_id: user.id,
          surah_number: Number(surahNumber),
          ayah_number: Number(ayahNumber),
          content: note,
        }, { onConflict: ["user_id", "surah_number", "ayah_number"] });

      if (error) {
        console.error("Error saving note:", error.message);
        throw error;
      }

      console.log("Note saved successfully");
    } catch (err: any) {
      console.error("Error saving note:", err.message);
      setError("Failed to save the note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleBookmark = async () => {
    const user = await fetchUserSession();
    if (!user) return;

    try {
      if (isBookmarked) {
        // Remove Bookmark
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("surah_number", Number(surahNumber))
          .eq("ayah_number", Number(ayahNumber));

        if (error) {
          console.error("Error removing bookmark:", error.message);
          throw error;
        }

        setIsBookmarked(false);
      } else {
        // Add Bookmark
        const { error } = await supabase.from("bookmarks").insert({
          user_id: user.id,
          surah_number: Number(surahNumber),
          ayah_number: Number(ayahNumber),
        });

        if (error) {
          console.error("Error adding bookmark:", error.message);
          throw error;
        }

        setIsBookmarked(true);
      }
    } catch (err: any) {
      console.error("Error toggling bookmark:", err.message);
    }
  };

  const playRecitation = async () => {
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.alafasy`
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

  const navigateToAyah = (direction: "prev" | "next") => {
    const currentAyah = Number(ayahNumber);
    const currentSurah = Number(surahNumber);

    if (direction === "prev") {
      if (currentAyah > 1) {
        navigate(`/ayah/${currentSurah}/${currentAyah - 1}`);
      } else if (currentSurah > 1) {
        fetch(`https://api.alquran.cloud/v1/surah/${currentSurah - 1}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.code === 200) {
              navigate(`/ayah/${currentSurah - 1}/${data.data.numberOfAyahs}`);
            }
          })
          .catch((error) => console.error("Error fetching previous surah:", error));
      }
    } else {
      if (currentAyah < totalAyahs) {
        navigate(`/ayah/${currentSurah}/${currentAyah + 1}`);
      } else if (currentSurah < 114) {
        navigate(`/ayah/${currentSurah + 1}/1`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 w-fit"
            onClick={() => navigate(`/surah/${surahNumber}`)}
          >
            <ChevronLeft size={20} className="mr-2" />
            Back to Surah
          </Button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mt-6">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Ayah</h2>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 mb-8">
          <Button
            variant="ghost"
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 w-fit"
            onClick={() => navigate(`/surah/${surahNumber}`)}
          >
            <ChevronLeft size={20} className="mr-2" />
            Back to Surah
          </Button>
          <div className="flex justify-between w-full">
            <Button
              variant="ghost"
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
              onClick={() => navigateToAyah("prev")}
              disabled={Number(surahNumber) === 1 && Number(ayahNumber) === 1}
            >
              <ChevronLeft size={20} className="mr-2" />
              Previous Ayah
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
              onClick={() => navigateToAyah("next")}
              disabled={Number(surahNumber) === 114 && Number(ayahNumber) === totalAyahs}
            >
              Next Ayah
              <ChevronRight size={20} className="ml-2" />
            </Button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-gray-800 font-bold">{ayah.numberInSurah}</span>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-full ${
                  isBookmarked
                    ? "bg-yellow-300 text-gray-800"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                <Bookmark size={20} />
              </button>
              <button
                onClick={playRecitation}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-800"
              >
                <Volume2 size={20} />
              </button>
            </div>
          </div>
          <p className="text-2xl text-right mb-4 font-arabic text-gray-800">{ayah.text}</p>
        </div>
        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Notes</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            placeholder="Write your notes here..."
          />
          <Button
            variant="ghost"
            onClick={saveNote}
            disabled={saving}
            className="mt-4 flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            <Save size={20} className="mr-2" />
            {saving ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </div>
    </div>
  );
}