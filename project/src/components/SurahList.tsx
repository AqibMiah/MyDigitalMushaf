import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import type { Surah } from '../types';

export function SurahList() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then((res) => res.json())
      .then((data) => {
        setSurahs(data.data);
        setLoading(false);
      });
  }, []);

  const filteredSurahs = surahs.filter((surah) => {
    const searchTerm = search.toLowerCase();
    return (
      surah.number.toString().includes(searchTerm) ||
      surah.englishName.toLowerCase().includes(searchTerm) ||
      surah.name.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
            <input
              type="text"
              placeholder="Search by surah number or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs.map((surah) => (
            <Link
              key={surah.number}
              to={`/surah/${surah.number}`}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-600 font-bold">{surah.number}</span>
                <span className="text-xl text-blue-900">{surah.name}</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-800">
                {surah.englishName}
              </h3>
              <p className="text-blue-600 text-sm">
                {surah.englishNameTranslation}
              </p>
              <p className="text-blue-500 text-sm mt-2">
                {surah.numberOfAyahs} verses
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}