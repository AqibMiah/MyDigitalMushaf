import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button"; // ShadCN Button component
import { Card, CardContent } from "@/components/ui/card"; // ShadCN Card component
import { Input } from "@/components/ui/input"; // ShadCN Input component
import { Alert } from "@/components/ui/alert"; // ShadCN Alert component

// Full Surah List (add all Surahs here)
const SURAH_LIST = [
  { number: 1, name: "Al-Fatihah" },
  { number: 2, name: "Al-Baqarah" },
  { number: 3, name: "Aal-E-Imran" },
  { number: 4, name: "An-Nisa" },
  { number: 5, name: "Al-Maidah" },
  { number: 6, name: "Al-An'am" },
  { number: 7, name: "Al-A'raf" },
  { number: 8, name: "Al-Anfal" },
  { number: 9, name: "At-Tawbah" },
  { number: 10, name: "Yunus" },
  { number: 11, name: "Hud" },
  { number: 12, name: "Yusuf" },
  { number: 13, name: "Ar-Ra'd" },
  { number: 14, name: "Ibrahim" },
  { number: 15, name: "Al-Hijr" },
  { number: 16, name: "An-Nahl" },
  { number: 17, name: "Al-Isra" },
  { number: 18, name: "Al-Kahf" },
  { number: 19, name: "Maryam" },
  { number: 20, name: "Ta-Ha" },
  { number: 21, name: "Al-Anbiya" },
  { number: 22, name: "Al-Hajj" },
  { number: 23, name: "Al-Mu'minun" },
  { number: 24, name: "An-Nur" },
  { number: 25, name: "Al-Furqan" },
  { number: 26, name: "Ash-Shu'ara" },
  { number: 27, name: "An-Naml" },
  { number: 28, name: "Al-Qasas" },
  { number: 29, name: "Al-Ankabut" },
  { number: 30, name: "Ar-Rum" },
  { number: 31, name: "Luqman" },
  { number: 32, name: "As-Sajda" },
  { number: 33, name: "Al-Ahzab" },
  { number: 34, name: "Saba" },
  { number: 35, name: "Fatir" },
  { number: 36, name: "Ya-Sin" },
  { number: 37, name: "As-Saffat" },
  { number: 38, name: "Sad" },
  { number: 39, name: "Az-Zumar" },
  { number: 40, name: "Ghafir" },
  { number: 41, name: "Fussilat" },
  { number: 42, name: "Ash-Shura" },
  { number: 43, name: "Az-Zukhruf" },
  { number: 44, name: "Ad-Dukhan" },
  { number: 45, name: "Al-Jathiya" },
  { number: 46, name: "Al-Ahqaf" },
  { number: 47, name: "Muhammad" },
  { number: 48, name: "Al-Fath" },
  { number: 49, name: "Al-Hujurat" },
  { number: 50, name: "Qaf" },
  { number: 51, name: "Adh-Dhariyat" },
  { number: 52, name: "At-Tur" },
  { number: 53, name: "An-Najm" },
  { number: 54, name: "Al-Qamar" },
  { number: 55, name: "Ar-Rahman" },
  { number: 56, name: "Al-Waqia" },
  { number: 57, name: "Al-Hadid" },
  { number: 58, name: "Al-Mujadila" },
  { number: 59, name: "Al-Hashr" },
  { number: 60, name: "Al-Mumtahina" },
  { number: 61, name: "As-Saff" },
  { number: 62, name: "Al-Jumu'a" },
  { number: 63, name: "Al-Munafiqun" },
  { number: 64, name: "At-Taghabun" },
  { number: 65, name: "At-Talaq" },
  { number: 66, name: "At-Tahrim" },
  { number: 67, name: "Al-Mulk" },
  { number: 68, name: "Al-Qalam" },
  { number: 69, name: "Al-Haqqa" },
  { number: 70, name: "Al-Ma'arij" },
  { number: 71, name: "Nuh" },
  { number: 72, name: "Al-Jinn" },
  { number: 73, name: "Al-Muzzammil" },
  { number: 74, name: "Al-Muddaththir" },
  { number: 75, name: "Al-Qiyama" },
  { number: 76, name: "Al-Insan" },
  { number: 77, name: "Al-Mursalat" },
  { number: 78, name: "An-Naba" },
  { number: 79, name: "An-Nazi'at" },
  { number: 80, name: "Abasa" },
  { number: 81, name: "At-Takwir" },
  { number: 82, name: "Al-Infitar" },
  { number: 83, name: "Al-Mutaffifin" },
  { number: 84, name: "Al-Inshiqaq" },
  { number: 85, name: "Al-Buruj" },
  { number: 86, name: "At-Tariq" },
  { number: 87, name: "Al-Ala" },
  { number: 88, name: "Al-Ghashiya" },
  { number: 89, name: "Al-Fajr" },
  { number: 90, name: "Al-Balad" },
  { number: 91, name: "Ash-Shams" },
  { number: 92, name: "Al-Lail" },
  { number: 93, name: "Ad-Duhaa" },
  { number: 94, name: "Ash-Sharh" },
  { number: 95, name: "At-Tin" },
  { number: 96, name: "Al-Alaq" },
  { number: 97, name: "Al-Qadr" },
  { number: 98, name: "Al-Bayyina" },
  { number: 99, name: "Az-Zalzala" },
  { number: 100, name: "Al-Adiyat" },
  { number: 101, name: "Al-Qari'a" },
  { number: 102, name: "At-Takathur" },
  { number: 103, name: "Al-Asr" },
  { number: 104, name: "Al-Humaza" },
  { number: 105, name: "Al-Fil" },
  { number: 106, name: "Quraysh" },
  { number: 107, name: "Al-Ma'un" },
  { number: 108, name: "Al-Kawthar" },
  { number: 109, name: "Al-Kafiroon" },
  { number: 110, name: "An-Nasr" },
  { number: 111, name: "Al-Masad" },
  { number: 112, name: "Al-Ikhlas" },
  { number: 113, name: "Al-Falaq" },
  { number: 114, name: "An-Nas" },
];

const SURAH_START_PAGES = {
  1: 1,   // Al-Fatihah
  2: 2,   // Al-Baqarah
  3: 50,  // Aal-E-Imran
  4: 77,  // An-Nisa
  5: 106, // Al-Maidah
  6: 128, // Al-An'am
  7: 151, // Al-A'raf
  8: 177, // Al-Anfal
  9: 187, // At-Tawbah
  10: 208, // Yunus
  11: 221, // Hud
  12: 235, // Yusuf
  13: 249, // Ar-Ra'd
  14: 255, // Ibrahim
  15: 262, // Al-Hijr
  16: 267, // An-Nahl
  17: 282, // Al-Isra
  18: 293, // Al-Kahf
  19: 305, // Maryam
  20: 312, // Ta-Ha
  21: 322, // Al-Anbiya
  22: 332, // Al-Hajj
  23: 342, // Al-Mu'minun
  24: 350, // An-Nur
  25: 359, // Al-Furqan
  26: 367, // Ash-Shu'ara
  27: 377, // An-Naml
  28: 385, // Al-Qasas
  29: 396, // Al-Ankabut
  30: 404, // Ar-Rum
  31: 411, // Luqman
  32: 415, // As-Sajda
  33: 418, // Al-Ahzab
  34: 428, // Saba
  35: 434, // Fatir
  36: 440, // Ya-Sin
  37: 446, // As-Saffat
  38: 452, // Sad
  39: 458, // Az-Zumar
  40: 467, // Ghafir
  41: 477, // Fussilat
  42: 483, // Ash-Shura
  43: 489, // Az-Zukhruf
  44: 496, // Ad-Dukhan
  45: 499, // Al-Jathiya
  46: 502, // Al-Ahqaf
  47: 507, // Muhammad
  48: 511, // Al-Fath
  49: 515, // Al-Hujurat
  50: 518, // Qaf
  51: 520, // Adh-Dhariyat
  52: 523, // At-Tur
  53: 526, // An-Najm
  54: 528, // Al-Qamar
  55: 531, // Ar-Rahman
  56: 534, // Al-Waqia
  57: 537, // Al-Hadid
  58: 541, // Al-Mujadila
  59: 544, // Al-Hashr
  60: 547, // Al-Mumtahina
  61: 549, // As-Saff
  62: 551, // Al-Jumu'a
  63: 553, // Al-Munafiqun
  64: 554, // At-Taghabun
  65: 556, // At-Talaq
  66: 558, // At-Tahrim
  67: 560, // Al-Mulk
  68: 562, // Al-Qalam
  69: 564, // Al-Haqqa
  70: 566, // Al-Ma'arij
  71: 568, // Nuh
  72: 570, // Al-Jinn
  73: 572, // Al-Muzzammil
  74: 574, // Al-Muddaththir
  75: 576, // Al-Qiyama
  76: 578, // Al-Insan
  77: 580, // Al-Mursalat
  78: 582, // An-Naba
  79: 583, // An-Nazi'at
  80: 585, // Abasa
  81: 586, // At-Takwir
  82: 587, // Al-Infitar
  83: 587, // Al-Mutaffifin
  84: 589, // Al-Inshiqaq
  85: 590, // Al-Buruj
  86: 591, // At-Tariq
  87: 591, // Al-Ala
  88: 592, // Al-Ghashiya
  89: 593, // Al-Fajr
  90: 594, // Al-Balad
  91: 595, // Ash-Shams
  92: 595, // Al-Lail
  93: 596, // Ad-Duhaa
  94: 596, // Ash-Sharh
  95: 597, // At-Tin
  96: 597, // Al-Alaq
  97: 598, // Al-Qadr
  98: 598, // Al-Bayyina
  99: 599, // Az-Zalzala
  100: 599, // Al-Adiyat
  101: 600, // Al-Qari'a
  102: 600, // At-Takathur
  103: 601, // Al-Asr
  104: 601, // Al-Humaza
  105: 601, // Al-Fil
  106: 602, // Quraysh
  107: 602, // Al-Ma'un
  108: 603, // Al-Kawthar
  109: 603, // Al-Kafiroon
  110: 603, // An-Nasr
  111: 604, // Al-Masad
  112: 604, // Al-Ikhlas
  113: 604, // Al-Falaq
  114: 604, // An-Nas
};


export function QuranPageView() {
  const navigate = useNavigate();
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [pageInput, setPageInput] = useState("");
  const [surahInput, setSurahInput] = useState("");
  const [filteredSurahs, setFilteredSurahs] = useState(SURAH_LIST);
  const [isInputActive, setIsInputActive] = useState({
    page: false,
    surah: false,
    juz: false,
  });

  const fetchPage = async (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > 604) {
      setError("Invalid page number. Please enter a page between 1 and 604.");
      setLoading(false);
      return;
    }

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

  const handleSurahSearch = (input: string) => {
    setSurahInput(input);

    const filtered = SURAH_LIST.filter(
      (surah) =>
        surah.name.toLowerCase().includes(input.toLowerCase()) ||
        surah.number.toString().startsWith(input)
    );
    setFilteredSurahs(filtered);

    setIsInputActive({
      page: false,
      surah: true,
      juz: false,
    });
  };

  const handleSurahSelect = (surahNumber: number) => {
    const startPage = SURAH_START_PAGES[surahNumber];
    if (startPage) {
      setCurrentPage(startPage);
      setError(null);
    } else {
      setError("Surah start page not found.");
    }
    setSurahInput("");
    setFilteredSurahs(SURAH_LIST);
    setIsInputActive({ page: false, surah: false, juz: false });
  };

  const handleSearch = () => {
    if (pageInput) {
      const pageNumber = Number(pageInput);
      if (pageNumber < 1 || pageNumber > 604) {
        setError("Invalid page number. Please enter a page between 1 and 604.");
      } else {
        setCurrentPage(pageNumber);
        setError(null);
      }
      setPageInput("");
    } else if (surahInput) {
      const surahNumber = filteredSurahs[0]?.number;
      if (!surahNumber) {
        setError("No matching Surah found.");
      } else {
        handleSurahSelect(surahNumber);
      }
    }

    setIsInputActive({ page: false, surah: false, juz: false });
  };

  useEffect(() => {
    if (!pageInput && !surahInput) {
      setIsInputActive({ page: false, surah: false, juz: false });
    }
  }, [pageInput, surahInput]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </Alert>
        )}

        {/* Search Bars */}
        <div className="mb-6 flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Enter Page Number"
            value={pageInput}
            onChange={(e) => {
              setPageInput(e.target.value);
              setIsInputActive({ page: true, surah: false, juz: false });
            }}
            disabled={isInputActive.surah}
            style={{ appearance: "textfield" }}
          />
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter Surah Number or Name"
              value={surahInput}
              onChange={(e) => handleSurahSearch(e.target.value)}
              disabled={isInputActive.page}
              style={{ appearance: "textfield" }}
            />
            {surahInput && (
              <div className="absolute bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-10 max-h-40 overflow-y-auto w-full">
                {filteredSurahs.map((surah) => (
                  <div
                    key={surah.number}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSurahSelect(surah.number)}
                  >
                    {surah.number}. {surah.name}
                  </div>
                ))}
                {filteredSurahs.length === 0 && (
                  <div className="p-2 text-gray-500">No matches found</div>
                )}
              </div>
            )}
          </div>
          <Button onClick={handleSearch} className="mt-2">
            Search
          </Button>
        </div>

        {/* Back to Surahs Button */}
        <div className="flex justify-start mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/surahs")}
            className="gap-2"
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