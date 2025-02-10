'use client';

import React, { useState, useEffect } from 'react';
import { Pin, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import { Input } from "@/components/ui/input";
import HomeHeader from "@/components/Quiz/HHeader";

const categoryColors = {
  'Physician': '#FF6B6B',
  'Dentist': '#4ECDC4',
  'Nursing': '#45B7D1',
  'Pharmacist': '#96CEB4',
  'Lab specialist': '#FFEEAD',
  'Family-Medicine': '#D4A5A5'
};

const getExamStyle = (name) => ({
  letter: name?.charAt(0)?.toUpperCase() || 'E',
  color: categoryColors[name] || '#2463EB'
});

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-[#EEF5FF] h-32 rounded-lg"></div>
      </div>
    ))}
  </div>
);

const SearchBar = ({ searchTerm, setSearchTerm, isFixed }) => (
  <div className={`bg-white w-full z-40 transition-all duration-300 ${
    isFixed ? 'fixed top-16 left-0 right-0 shadow-md py-4' : 'py-8'
  }`}>
    <div className="max-w-3xl mx-auto px-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search exams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 text-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const router = useRouter();
  const supabase = createClient();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pinnedExams, setPinnedExams] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data, error } = await supabase
          .from('exams')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedExams = data.map(exam => ({
          id: exam.id,
          name: exam.initials,
          description: exam.description || `Medical licensing exam for ${exam.name}`,
          category: exam.name,
          letter: getExamStyle(exam.name).letter,
          color: getExamStyle(exam.name).color,
          slug: exam.id
        }));

        setExams(formattedExams);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [supabase]);

  const filteredExams = exams.filter(exam =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedExams = [...filteredExams].sort((a, b) => {
    if (pinnedExams.has(a.id) && !pinnedExams.has(b.id)) return -1;
    if (!pinnedExams.has(a.id) && pinnedExams.has(b.id)) return 1;
    return 0;
  });

  const togglePin = (examId, e) => {
    e.stopPropagation();
    setPinnedExams(prev => {
      const newPinned = new Set(prev);
      if (newPinned.has(examId)) {
        newPinned.delete(examId);
      } else {
        newPinned.add(examId);
      }
      return newPinned;
    });
  };

  const navigateToExam = (slug) => {
    router.push(`/exams/${slug}`);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error loading exams</h2>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <HomeHeader />
      <br />
      <br />
      <br />
      <br />
      <div className="bg-white px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 bg-black rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">🥇</span>
          </div>
          <h1 className="text-[#1F3546] text-3xl font-bold mb-3">Medical Board Exams</h1>
          <p className="text-[#697785] text-lg mb-8">Prepare for your medical licensing exams</p>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} isFixed={isScrolled} />
        </div>
      </div>

      <div className={`max-w-3xl mx-auto px-4 pb-12 ${isScrolled ? 'mt-24' : ''}`}>
        {loading ? (
          <LoadingSkeleton />
        ) : sortedExams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#697785]">No exams found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedExams.map((exam) => (
              <div 
                key={exam.id}
                onClick={() => navigateToExam(exam.slug)}
                className="bg-[#f5f9ff] rounded-lg border-2 border-blue-100 hover:bg-blue-100/50 hover:border-blue-200 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center p-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-semibold text-lg shrink-0 shadow-sm"
                    style={{ backgroundColor: exam.color }}
                  >
                    {exam.letter}
                  </div>

                  <div className="flex-1 min-w-0 ml-4 mr-4">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h2 className="text-sm font-semibold text-[#1b2a6f] truncate max-w-[calc(100%-80px)]">
                        {exam.name}
                      </h2>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-[#697785] whitespace-nowrap">
                        {exam.category}
                      </span>
                    </div>
                    <p className="text-sm text-[#697785] mt-1 line-clamp-2">
                      {exam.description}
                    </p>
                  </div>

                  <button 
                    onClick={(e) => togglePin(exam.id, e)}
                    className="shrink-0 ml-auto p-2 hover:bg-white/50 rounded-full"
                  >
                    <Pin 
                      className={`w-5 h-5 ${
                        pinnedExams.has(exam.id) 
                          ? 'text-red-500 fill-current' 
                          : 'text-[#697785] hover:text-[#4b5563]'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;