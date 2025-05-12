"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Courses() {
  const router = useRouter();

  const courses = [
    {
      title: "Web Development",
      description: "Learn HTML, CSS, JavaScript, and build dynamic websites.",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
    },
    {
      title: "Data Science",
      description: "Explore data analysis, machine learning, and Python programming.",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-600",
    },
    {
      title: "Artificial Intelligence",
      description: "Understand AI concepts, algorithms, and applications.",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-600",
    },
    {
      title: "Mobile App Development",
      description: "Develop mobile applications using React Native.",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-600",
    },
    {
      title: "Cloud Computing",
      description: "Learn about cloud technologies and infrastructure management.",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-600",
    },
    {
      title: "Cybersecurity",
      description: "Protect systems and data through various cybersecurity practices.",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-600",
    },
    {
      title: "Blockchain Development",
      description: "Explore blockchain technology and develop decentralized applications.",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-600",
    },
    {
      title: "UI/UX Design",
      description: "Learn design principles for creating user-friendly interfaces.",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      textColor: "text-pink-600",
    },
    {
      title: "Digital Marketing",
      description: "Master SEO, content marketing, and social media strategies.",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
      textColor: "text-teal-600",
    },
    {
      title: "Game Development",
      description: "Learn how to design and develop interactive games.",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-600",
    },
  ];

  const handleEnroll = (courseTitle) => {
    router.push(`/questionType?course=${encodeURIComponent(courseTitle)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Our Courses</h1>
          <p className="mt-2 text-gray-600">
            Choose from our wide range of professional courses
          </p>
        </div>
      </header>

      {/* Courses Section */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {courses.map((course) => (
            <div
              key={course.title}
              className={`group relative ${course.bgColor} rounded-xl shadow-md overflow-hidden border ${course.borderColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              <div className="p-6 h-full flex flex-col">
                <h3 className={`text-xl font-bold ${course.textColor} mb-3`}>
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 flex-grow">
                  {course.description}
                </p>
                <button
                  onClick={() => handleEnroll(course.title)}
                  className={`w-full cursor-pointer py-3 px-4 ${course.textColor} font-medium rounded-lg bg-white border ${course.borderColor} transition-all duration-300 group-hover:bg-opacity-90 group-hover:shadow-inner`}
                >
                  Create Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>


    </div>
  );
}