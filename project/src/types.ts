export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  translation: string;
}

export interface Note {
  id: string;
  user_id: string;
  surah_number: number;
  ayah_number: number;
  content: string;
  created_at: string;
}