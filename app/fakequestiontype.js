"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';

export default function QuestionType() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const courseParam = searchParams.get('course');
    if (courseParam) {
      setCourse(decodeURIComponent(courseParam));
    }
  }, [searchParams]);

  const quizTypes = [
    {
      title: 'Multiple Choice',
      description: 'Select the correct answer from several options.',
      icon: '🔘',
      color: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600'
    },
    {
      title: 'True/False',
      description: 'Decide whether a statement is true or false.',
      icon: '✅',
      color: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600'
    },
    {
      title: 'Fill in the Blank',
      description: 'Complete the sentence by filling missing words.',
      icon: '📝',
      color: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-600'
    },
    {
      title: 'Matching',
      description: 'Connect items from two columns correctly.',
      icon: '🔗',
      color: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600'
    },
    {
      title: 'Short Answer',
      description: 'Write brief responses to open-ended questions.',
      icon: '✏️',
      color: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600'
    },
    {
      title: 'Essay',
      description: 'Compose detailed, structured written responses.',
      icon: '📄',
      color: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-600'
    },
    {
      title: 'Ordering',
      description: 'Arrange items in the correct sequence.',
      icon: '🔢',
      color: 'bg-pink-50',
      border: 'border-pink-200',
      text: 'text-pink-600'
    },
    {
      title: 'Hotspot',
      description: 'Click on specific areas of an image to answer.',
      icon: '📍',
      color: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Question Types</h1>
          <p className="mt-2 text-gray-600">
            Select a question type for your <span className="font-semibold text-blue-600">{course || 'selected course'}</span>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
        {/* Course Info Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10 border border-gray-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                <span className="text-blue-600 text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-800">Selected Course</h2>
                <p className="text-gray-600">{course || 'No course selected'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Question Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quizTypes.map((type) => (
            <div
              key={type.title}
              className={`group relative ${type.color} rounded-xl shadow-md overflow-hidden border ${type.border} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{type.icon}</span>
                  <h3 className={`text-lg font-bold ${type.text}`}>{type.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6 flex-grow">{type.description}</p>
                <button
                  onClick={() => router.push(`/createQuiz?course=${encodeURIComponent(course)}&type=${encodeURIComponent(type.title)}`)}
                  className={`w-full cursor-pointer py-2 px-4 ${type.text} font-medium rounded-lg bg-white border ${type.border} transition-all duration-300 hover:bg-opacity-80 hover:shadow-inner`}
                >
                  Select This Type
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

   
    </div>
  );
}