"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPlus,
  faArrowLeft,
  faList,
  faFileAlt,
  faPlusCircle,
  faSearch,
  faCog,
  faTrash,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showList, setShowList] = useState(true); // ✅ toggle state
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const quizzesPerPage = 5; // you can adjust this number

  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'reports' | others
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const { data, error } = await supabase.from("Quiz").select("*");
      if (error) {
        console.error("Error fetching quizzes:", error);
      } else {
        setQuizzes(data);
      }
      setLoading(false);
    };
    fetchQuizzes();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [quizRes, catRes] = await Promise.all([
        supabase.from("Quiz").select("*"),
        supabase.from("Category").select("id, category_name"),
      ]);

      if (quizRes.error || catRes.error) {
        console.error("Error fetching data", quizRes.error || catRes.error);
      } else {
        setQuizzes(quizRes.data);
        setCategories(catRes.data);
      }

      setLoading(false);
    };

    fetchData();
  }, []);
  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.category_name : "Unknown";
  };

  const toggleQuizForm = () => {
    router.push("/quiz");
  };

  const handleQuizSelect = (quiz) => {
    router.push(`/quiz?id=${quiz.id}`);
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleDeleteQuiz = async (quizId) => {
    const confirmDelete = confirm("Are you sure you want to delete this quiz?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("Quiz").delete().eq("id", quizId);

    if (error) {
      console.error("Error deleting quiz:", error);
      alert("Failed to delete quiz.");
    } else {
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      // alert("Quiz deleted successfully.");
    }
  };
  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = filteredQuizzes.slice(
    indexOfFirstQuiz,
    indexOfLastQuiz
  );
  const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#583D72] to-[#583D72]">
        <div className="w-52 bg-[#583D72] border-r-1  border-[#FF8474] text-white p-4 shadow-lg md:fixed md:h-screen md:overflow-y-auto">
          <div className="flex flex-col h-full pt-5 pl-2">
            <div className="space-y-4 text-lg">
              <div
                className={`flex items-center gap-7 cursor-pointer transition ${
                  activeTab === "list"
                    ? "text-[#FF8474] "
                    : "text-white hover:text-[#FF8474]"
                }`}
                onClick={() => {
                  setShowList(true);
                  setActiveTab("list");
                }}
              >
                <FontAwesomeIcon icon={faList} />
                <span>Quiz List</span>
              </div>

              {/* <div
                className={`flex items-center gap-7  ml-1 cursor-pointer transition ${
                  activeTab === "reports"
                    ? "text-[#FF8474] "
                    : "text-white hover:text-[#FF8474]"
                }`}
               
              >
                <FontAwesomeIcon icon={faFileAlt} />
                <span>Reports</span>
              </div> */}
            </div>

            <div className="mt-auto text-center text-sm text-[#ddd] pt-10">
              © 2025 Quiz App
            </div>
          </div>
        </div>

        <div className="ml-68 max-w-5xl space-y-0 justify-center align-middle  pt-15 pb-10 px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Quiz List</h1>
            <div>
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 mr-5 p-3 rounded-lg border border-white/30 bg-white/20 placeholder-white text-white focus:outline-none"
              />
              <button
                className="px-6 py-3 bg-[#FF8474] text-white rounded-lg hover:bg-[#FFC996]"
                onClick={toggleQuizForm}
              >
                Create New Quiz
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFC996]"></div>
            </div>
          ) : currentQuizzes.length === 0 ? (
            <div className="text-center py-12 text-white">
              <h3 className="text-lg font-medium">No quizzes found</h3>
              <p className="text-[#FFC996]">Try a different search</p>
            </div>
          ) : showList ? (
            // ✅ List view
            <>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20 ">
                <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
                  <table className="w-full text-left text-white">
                    <thead className="text-white/80 border-b border-white/20">
                      <tr>
                        <th className="p-3">SR</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Tags</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentQuizzes.map((quiz, index) => (
                        <tr
                          key={quiz.id}
                          className="border-b border-white/10 hover:bg-white/10"
                        >
                          <td className="p-3">
                            {indexOfFirstQuiz + index + 1}
                          </td>
                          <td className="p-3">{quiz.name}</td>
                          <td className="p-3">
                            {getCategoryName(quiz.category)}
                          </td>

                          <td className="p-3">{quiz.tags}</td>
                          <td className="p-3">
                            <button
                              onClick={() => handleQuizSelect(quiz)}
                              className="text-sm px-3 py-2 bg-white/10 backdrop-blur-smtext-[#fff] rounded-lg   hover:bg-[#583D72] cursor-pointer"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="text-sm px-3 py-2 ml-2 bg-white/10 backdrop-blur-sm text-[#fff] rounded-lg hover:bg-[#583D72] cursor-pointer"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-between mt-4 space-x-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/20 text-white rounded hover:bg-white/30 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <span className="text-white px-2 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/20 text-white rounded hover:bg-white/30 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </>
          ) : (
            // Default card view
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"></div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuizList;
