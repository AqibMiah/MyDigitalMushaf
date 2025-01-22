import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button"; // ShadCN Button component
import { Card, CardContent } from "@/components/ui/card"; // ShadCN Card component

export function QuranPageView() {
  const navigate = useNavigate();
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // Tracks the current Quran page

  const fetchPage = async (pageNumber: number) => {
    setLoading(true);
    setError(null);
    setAyahs([]);

    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 200) {
        setAyahs(data.data.ayahs);
      } else {
        throw new Error("Invalid response format or no data available.");
      }
    } catch (err) {
      setError("An error occurred while fetching the page.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(currentPage);
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < 604) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const openNotesPage = (surah: number, ayah: number) => {
    navigate(`/ayah/${surah}/${ayah}`);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back to Surahs Button */}
        <div className="flex justify-start mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/surahs")}
            className="gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            <BookOpen size={20} />
            Back to All Surahs
          </Button>
        </div>

        {/* Page Info */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="disabled:opacity-50"
          >
            Previous Page
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              Juz {ayahs[0]?.juz || "Unknown"} - Page {currentPage}
            </h2>
          </div>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === 604}
          >
            Next Page
          </Button>
        </div>

        {/* Quran Text */}
        <Card>
          <CardContent>
            <p className="text-right text-2xl font-arabic text-gray-800 leading-relaxed">
              {ayahs.map((ayah: any, index) => {
                const isNewSurah =
                  index === 0 || ayah.surah.name !== ayahs[index - 1].surah.name;

                return (
                  <React.Fragment key={ayah.number}>
                    {isNewSurah && (
                      <span className="block text-center text-lg font-semibold text-gray-600 my-4">
                        {ayah.surah.name} ({ayah.surah.englishName})
                      </span>
                    )}
                    <span
                      onClick={() => openNotesPage(ayah.surah.number, ayah.numberInSurah)}
                      className="cursor-pointer transition hover:text-gray-500"
                    >
                      {ayah.text}{" "}
                      <span className="text-sm">({ayah.numberInSurah})</span>{" "}
                    </span>
                  </React.Fragment>
                );
              })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}