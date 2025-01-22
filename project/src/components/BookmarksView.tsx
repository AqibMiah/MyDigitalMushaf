import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Volume2, Bookmark, Edit, BookOpen, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "../supabase";

interface Bookmark {
  surah_number: number;
  ayah_number: number;
  text: string;
}

interface Surah {
  number: number;
  englishName: string;
}

export function BookmarksView() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [activeBookmark, setActiveBookmark] = useState<Bookmark | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [surahNames, setSurahNames] = useState<Record<number, string>>({});

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
    const fetchSurahNames = async () => {
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah`);
        const data = await response.json();
        if (data.code === 200 && data.data) {
          const surahNameMap: Record<number, string> = {};
          data.data.forEach((surah: Surah) => {
            surahNameMap[surah.number] = surah.englishName;
          });
          setSurahNames(surahNameMap);
        } else {
          console.error("Failed to fetch Surah names");
        }
      } catch (error) {
        console.error("Error fetching Surah names:", error);
      }
    };

    const fetchBookmarks = async () => {
      setLoading(true);
      const user = await fetchUserSession();
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("bookmarks")
          .select("surah_number, ayah_number")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching bookmarks:", error.message);
        } else if (data && data.length > 0) {
          const fetchedBookmarks = await Promise.all(
            data.map(async (bookmark) => {
              const response = await fetch(
                `https://api.alquran.cloud/v1/ayah/${bookmark.surah_number}:${bookmark.ayah_number}`
              );
              const result = await response.json();
              return {
                surah_number: bookmark.surah_number,
                ayah_number: bookmark.ayah_number,
                text: result.data.text,
              };
            })
          );
          setBookmarks(fetchedBookmarks);
        }
      } catch (err) {
        console.error("Unexpected error fetching bookmarks:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSurahNames();
    fetchBookmarks();
  }, [navigate]);

  const playRecitation = async (bookmark: Bookmark) => {
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/ayah/${bookmark.surah_number}:${bookmark.ayah_number}/ar.alafasy`
      );
      const data = await response.json();
      if (data.code === 200 && data.data.audio) {
        if (audio) {
          audio.pause();
        }
        const newAudio = new Audio(data.data.audio);
        setAudio(newAudio);
        setActiveBookmark(bookmark);
        setIsPaused(false);
        newAudio.play();
        newAudio.onended = () => {
          setActiveBookmark(null);
          setIsPaused(false);
        };
      } else {
        console.error("Recitation not available for this Ayah");
      }
    } catch (error) {
      console.error("Error fetching recitation:", error);
    }
  };

  const pauseAudio = () => {
    if (audio) {
      audio.pause();
      setIsPaused(true);
    }
  };

  const resumeAudio = () => {
    if (audio) {
      audio.play();
      setIsPaused(false);
    }
  };

  const stopAudio = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setAudio(null);
      setActiveBookmark(null);
      setIsPaused(false);
    }
  };

  const removeBookmark = async (surahNumber: number, ayahNumber: number) => {
    const user = await fetchUserSession();
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("surah_number", surahNumber)
        .eq("ayah_number", ayahNumber);

      if (error) {
        console.error("Error removing bookmark:", error.message);
      } else {
        setBookmarks((prevBookmarks) =>
          prevBookmarks.filter(
            (bookmark) =>
              bookmark.surah_number !== surahNumber ||
              bookmark.ayah_number !== ayahNumber
          )
        );
      }
    } catch (err) {
      console.error("Unexpected error removing bookmark:", err.message);
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
        {/* Back Button */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-4 py-2 shadow-sm"
            onClick={() => navigate("/surahs")}
          >
            <BookOpen size={20} />
            Back to Surahs
          </Button>
        </div>

        {/* Bookmarked Ayahs */}
        <div className="space-y-8">
          {bookmarks.length > 0 ? (
            bookmarks.map((bookmark) => (
              <div
                key={`${bookmark.surah_number}-${bookmark.ayah_number}`}
                className="relative border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
              >
                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-2">
                  {/* Remove Bookmark */}
                  <button
                    onClick={() =>
                      removeBookmark(bookmark.surah_number, bookmark.ayah_number)
                    }
                    className={`p-2 rounded-full bg-yellow-300 text-gray-800 hover:bg-yellow-400`}
                  >
                    <Bookmark size={20} />
                  </button>

                  {/* View Notes */}
                  <button
                    onClick={() =>
                      navigate(`/ayah/${bookmark.surah_number}/${bookmark.ayah_number}`)
                    }
                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-800"
                  >
                    <Edit size={20} />
                  </button>

                  {/* Audio Controls */}
                  {activeBookmark &&
                  activeBookmark.surah_number === bookmark.surah_number &&
                  activeBookmark.ayah_number === bookmark.ayah_number ? (
                    <>
                      {isPaused ? (
                        <button
                          onClick={resumeAudio}
                          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-800"
                        >
                          <Play size={20} />
                        </button>
                      ) : (
                        <button
                          onClick={pauseAudio}
                          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-800"
                        >
                          <Pause size={20} />
                        </button>
                      )}
                      <button
                        onClick={stopAudio}
                        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-800"
                      >
                        <Square size={20} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => playRecitation(bookmark)}
                      className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-800"
                    >
                      <Volume2 size={20} />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="py-4">
                  {/* Surah and Ayah Number */}
                  <span className="block text-gray-800 font-bold mb-2">
                    {surahNames[bookmark.surah_number]} ({bookmark.surah_number}), Ayah {bookmark.ayah_number}
                  </span>

                  {/* Arabic Text */}
                  <p className="text-2xl text-right mb-2 font-arabic text-gray-800">
                    {bookmark.text}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-700 text-center">No bookmarks found.</p>
          )}
        </div>
      </div>
    </div>
  );
}