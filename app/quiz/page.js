"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { toast, Toaster } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import CreateQuiz from "../createQuiz/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faUser,
  faEnvelope,
  faHome,
  faPlus,
  faArrowLeft,
  faList,
  faEye as faPreview,
  faTrash,
  faEdit,
  faInfo,
  faInfoCircle,
  faCheckCircle,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
// import dynamic from "next/dynamic";

// const CreateQuiz = dynamic(() => import("../createQuiz/page"), { ssr: false });

// Create a wrapper component with Suspense
function QuizWithSuspense({ quizId, selectedQuestion, currentQuestionId }) {
  const searchParams = useSearchParams();
  return (
    <QuizContent
      quizId={quizId || searchParams.get("id")}
      selectedQuestion={selectedQuestion}
      currentQuestionId={currentQuestionId}
    />
  );
}

export default function Quiz() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8474]"></div>
        </div>
      }
    >
      <QuizWithSuspense />
    </Suspense>
  );
}

// Your original component (now nested inside the wrapper)
function QuizContent({ quizId, selectedQuestion, currentQuestionId }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [message, setMessage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionsPreview, setQuestionsPreview] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentQuestionIdInternal, setCurrentQuestionIdInternal] = useState(
    currentQuestionId || null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showModalSubmit, setShowModalSubmit] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [selectedQuestionInternal, setSelectedQuestionInternal] = useState(
    selectedQuestion || null
  );
  const [showPreview, setShowPreview] = useState(false);

  const fetchAllQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("Question")
        .select("*")
        .eq("quiz_id", quizId); // filter by quizId

      if (error) throw error;
      setQuestionsPreview(data || []);
      console.log("Fetched quiz-specific questions:", data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    if (!quizId) return; // Only run if quizId exists
    fetchAllQuestions(); // This should only fetch quiz-specific questions ideally
  }, [quizId]);

  const handlePreviewClick = () => {
    setShowPreview(true);
    setShowAddQuestion(false);
    setShowQuiz(false);
    setShowList(false);
    setSelectedQuestionInternal(null);
    setCurrentQuestionIdInternal(null);
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;
      const { data, error } = await supabase
        .from("Quiz")
        .select("*")
        .eq("id", quizId)
        .single();
      if (error) {
        console.error("Error fetching quiz:", error);
      } else {
        setQuiz(data);
        setName(data.name); // <- Set form fields
        setCategory(data.category);
        setTags(data.tags);
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("Category").select("*");
      if (error) {
        toast.error("Failed to load categories");
        return;
      }
      setCategories(data);
    };

    fetchCategories();
  }, []);

  const [filter, setFilter] = useState({
    course: "",
    type: "",
    difficulty: "",
    search: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
  });
  const [fetchingQuestions, setFetchingQuestions] = useState(false);
  const router = useRouter();

  const handleQuestionSelect = async (questionId) => {
    try {
      const { data, error } = await supabase
        .from("Question")
        .select("*")
        .eq("id", questionId)
        .single();

      if (error) throw error;

      setSelectedQuestionInternal(data);
      setCurrentQuestionIdInternal(questionId);
      setShowAddQuestion(true);
      setShowQuiz(false);
      setShowList(false);
      setShowPreview(false);

      // No need to manually set the type here as it will be set by the CreateQuiz component
    } catch (error) {
      toast.error(`Error loading question: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setFetchingQuestions(true);
        if (!quizId) return;

        const { data: questionsData, error: questionError } = await supabase
          .from("Question")
          .select("id, question") // or whatever your question field is
          .eq("quiz_id", quizId);

        if (questionError) throw questionError;

        setQuestions(questionsData || []); // not grouped anymore
        console.log("Fetched questions:", questionsData);
      } catch (error) {
        toast.error(`Error loading questions: ${error.message}`);
      } finally {
        setFetchingQuestions(false);
      }
    };

    fetchQuestions();
  }, [quizId]);
  const refreshQuestions = async () => {
    try {
      setFetchingQuestions(true);
      if (!quizId) return;

      const { data: questionsData, error: questionError } = await supabase
        .from("Question")
        .select("id, question")
        .eq("quiz_id", quizId);

      if (questionError) throw questionError;

      setQuestions(questionsData || []);
    } catch (error) {
      toast.error(`Error loading questions: ${error.message}`);
    } finally {
      setFetchingQuestions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let data, error;

      if (quizId) {
        // Update existing quiz
        ({ data, error } = await supabase
          .from("Quiz")
          .update({ name, category, tags })
          .eq("id", quizId)
          .select());
      } else {
        // Create new quiz
        ({ data, error } = await supabase
          .from("Quiz")
          .insert([{ name, category, tags }])
          .select());
      }

      if (error) throw error;

      toast.success(
        quizId ? "Quiz updated successfully!" : "Quiz created successfully!"
      );
      setMessage({ type: "success", text: "Quiz saved successfully!" });

      if (!quizId) {
        setName("");
        setCategory("");
        setTags("");
      }
    } catch (error) {
      toast.error(`Error saving quiz: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setSelectedQuestionInternal(null);
    setShowAddQuestion(!showAddQuestion);
    setShowQuiz(false);
    setShowList(false);
    setShowPreview(false);
    setCurrentQuestionIdInternal(null);
  };

  const handleBackToQuizForm = () => {
    setShowAddQuestion(false);
    setShowQuiz(false);
    setShowList(true); // Show the form
    setShowPreview(false);
    setSelectedQuestionInternal(null);
  };

  const handleBackToQuestions = () => {
    setShowAddQuestion(false);
    setShowQuiz(true);
    setShowList(false);
  };

  const handleEdit = (question) => {
    setCurrentQuestionIdInternal(question.id);
    setShowAddQuestion(true);
    setShowQuiz(false);
    setShowList(false);
  };

  const handleBackToQuizList = () => {
    router.push("/quizList");
  };

  const handleFinalSubmit = async () => {
    if (!quizId) {
      toast.error("Quiz ID is missing");
      return;
    }

    try {
      // Fetch quiz data first
      const { data, error } = await supabase
        .from("Quiz")
        .select("is_submit")
        .eq("id", quizId)
        .single();

      if (error) throw error;

      if (data.is_submit) {
        // Quiz already submitted, show modal to confirm unsubmit
        setShowModal(true);
      } else {
        // Proceed to submit
        const { error: updateError } = await supabase
          .from("Quiz")
          .update({ is_submit: true })
          .eq("id", quizId);

        if (updateError) throw updateError;
        setShowModalSubmit(true);
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleUnsubmit = async () => {
    const { error } = await supabase
      .from("Quiz")
      .update({ is_submit: false })
      .eq("id", quizId);

    if (error) {
      toast.error("Failed to unsubmit quiz");
      return;
    }

    setShowModal(false);
  };

  const handleQuestionSaved = () => {
    refreshQuestions();
    fetchAllQuestions();
    setShowAddQuestion(false);
    // setShowQuiz(true);
  };

  const filteredQuestions = useMemo(() => {
    return questionsPreview.filter((question) =>
      question.question.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [questionsPreview, searchTerm]);
  const handleDelete = async (id) => {
    const { error } = await supabase.from("Question").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error.message);
      alert("Failed to delete question.");
    } else {
      setQuestionsPreview((prev) => prev.filter((q) => q.id !== id));
    }
  };
  const totalPoints = useMemo(() => {
    return filteredQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
  }, [filteredQuestions]);

  return (
    <>
      <div className="ml-2">
        <FontAwesomeIcon
          icon={faHome}
          onClick={handleBackToQuizList}
          className="text-xl mb-4 fixed  text-white   z-10 top-2 cursor-pointer  flex items-center justify-center px-4 py-2.5 rounded-lg transition-all bg-[#583D72]  border border-[#9F5F80] hover:bg-[#4A3265]"
        />
      </div>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f9fa] -z-10">
        {/* Sidebar - Fixed width and sticky */}
        <div className="w-64 bg-[#583D72] text-white p-2 shadow-lg md:fixed md:h-screen md:overflow-y-auto">
          <div className="flex flex-col h-full">
            {quiz ? (
              <div className=" flex items-center justify-center   ">
                <h1 className="w-50 ml-15 flex items-center justify-center px-4 py-2 rounded-lg transition-all bg-[#583D72] text-white  border border-[#9F5F80]">
                  {quiz.name}
                </h1>
              </div>
            ) : (
              <div className="mb-1 flex items-center justify-center   ">
                <h1 className="w-50 ml-15 flex items-center justify-center px-4 py-2 rounded-lg transition-all bg-[#583D72] text-white  border border-[#9F5F80]">
                  Create New Quiz
                </h1>
              </div>
            )}
            <button
              onClick={handleBackToQuizForm}
              className="w-full mt-1 flex items-center justify-center px-4 py-3 rounded-lg transition-all bg-[#583D72] text-white hover:bg-[#4A3265] border border-[#9F5F80] cursor-pointer"
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-3" />
              Quiz Info
            </button>

            {quiz ? (
              <h3 className="text-[#FFC996] font-medium mb-2 text-center mt-5">
                {questions.length === 0
                  ? "No questions added yet"
                  : `${questions.length} Questions added`}{" "}
              </h3>
            ) : (
              <h3 className="text-[#FFC996] font-medium mb-2"></h3>
            )}
            <div className="flex-1 overflow-y-auto mb-4 max-h-75 custom-scrollbar">
              {fetchingQuestions ? (
                <div className="flex justify-center py-3 ">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#FF8474] border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-2  ">
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => handleQuestionSelect(q.id)}
                      className={`w-full text-left cursor-pointer px-4 py-2.5 rounded-lg transition-all text-white hover:bg-[#9F5F80] ${
                        selectedQuestionInternal?.id === q.id
                          ? "bg-[#9F5F80] border-l-4 border-[#FF8474]"
                          : "bg-[#583D72] "
                      }`}
                    >
                      {`Question ${index + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3  absolute bottom-3  w-60 border-t border-[#9F5F80] pt-4">
              <button
                onClick={handleAddQuestion}
                className="w-full cursor-pointer flex items-center justify-center px-4 py-3 rounded-lg transition-all bg-[#FF8474] text-white hover:bg-[#FF6B5B]"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-3" />
                Add Question
              </button>
              <button
                onClick={handlePreviewClick}
                className="w-full flex items-center cursor-pointer justify-center px-4 py-3 rounded-lg transition-all bg-[#9F5F80] text-white hover:bg-[#8E4E75]"
              >
                <FontAwesomeIcon icon={faPreview} className="mr-3" />
                Preview
              </button>
              <button
                onClick={handleFinalSubmit}
                className="w-full flex  items-center cursor-pointer justify-center px-4 py-3 rounded-lg transition-all bg-[#9F5F80] text-white hover:bg-[#8E4E75]"
              >
                <FontAwesomeIcon icon={faCircleCheck} className="mr-3" />
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Offset for fixed sidebar */}
        <main className="flex-1 md:ml-64 ">
          {showPreview && (
            <div className="bg-white rounded-xl shadow-md p-6 w-full mx-auto">
              <div className="bg-white mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left: Title */}
                  <h2 className="text-2xl font-bold text-[#583D72]">
                    Quiz Preview
                  </h2>

                  {/* Middle: Search */}
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search question..."
                      className="w-full p-3 border border-[#FFC996] rounded-lg focus:ring-2 focus:ring-[#FF8474] placeholder:text-gray-400"
                    />
                  </div>

                  {/* Right: Question Count & Total Points */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                    <span className="bg-[#FFC996] text-[#583D72] px-4 py-1 rounded-full font-medium whitespace-nowrap">
                      {questions.length} Questions.
                    </span>
                    <span className="bg-[#FFF5F0] text-[#FF8474] px-4 py-1 rounded-full font-semibold whitespace-nowrap">
                      Total Mark: {totalPoints}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[33rem]">
                {filteredQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-6 bg-white rounded-lg border border-[#FFC996] shadow-sm"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <span className="text-lg font-semibold text-[#FF8474] bg-[#FFF5F0] rounded-full w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-lg text-gray-800 font-medium">
                          {question.question}
                        </p>
                        <p className="text-sm text-[#9F5F80] mt-1">
                          {question.type} • {question.difficulty || "Medium"}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowModalDelete(true)}
                        className=" font-semibold text-[#FF8474] bg-[#FFF5F0] rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-200 hover:text-red-400 cursor-pointer"
                        title="Delete this question"
                      >
                        <FontAwesomeIcon icon={faTrash} size={15} />
                      </button>
                    </div>

                    {/* Conditional rendering based on question type */}
                    {question.type === "Fill in the Blank" && (
                      <div className="mt-4 pl-12">
                        <label className="block text-gray-700 mb-2">
                          Your Answer:
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your answer"
                          className="w-full p-3 border border-[#FFC996] rounded-lg focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474]"
                        />
                      </div>
                    )}

                    {question.type === "Matching" && question.pairs && (
                      <div className="mt-4 pl-12">
                        <label className="block text-gray-700 mb-2">
                          Match the following:
                        </label>
                        <ul className="space-y-4 mt-2">
                          {JSON.parse(question.pairs).map((pair, index) => (
                            <li key={index} className="flex items-center gap-4">
                              <span className="text-gray-700 w-32">
                                {pair.left}
                              </span>
                              <select className="flex-1 p-3 border border-[#FFC996] rounded-lg focus:ring-2 focus:ring-[#FF8474]">
                                <option value="">Select</option>
                                <option value={pair.right}>{pair.right}</option>
                              </select>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {question.type === "Multiple Choice" &&
                      question.options && (
                        <div className="mt-4 pl-12">
                          <label className="block text-gray-700 mb-2">
                            Select your answer:
                          </label>
                          <div className="space-y-3 mt-2">
                            {question.options.map((option, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3"
                              >
                                <input
                                  type="radio"
                                  id={`option${index}`}
                                  name={`question${question.id}`}
                                  value={option}
                                  className="h-5 w-5 text-[#FF8474] focus:ring-[#FF8474]"
                                />
                                <label
                                  htmlFor={`option${index}`}
                                  className="text-gray-700"
                                >
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {question.type === "True/False" && (
                      <div className="mt-4 pl-12">
                        <label className="block text-gray-700 mb-2">
                          Select your answer:
                        </label>
                        <div className="flex items-center gap-6 mt-2">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              id={`true${question.id}`}
                              name={`question${question.id}`}
                              value="True"
                              className="h-5 w-5 text-[#FF8474] focus:ring-[#FF8474]"
                            />
                            <label
                              htmlFor={`true${question.id}`}
                              className="text-gray-700"
                            >
                              True
                            </label>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              id={`false${question.id}`}
                              name={`question${question.id}`}
                              value="False"
                              className="h-5 w-5 text-[#FF8474] focus:ring-[#FF8474]"
                            />
                            <label
                              htmlFor={`false${question.id}`}
                              className="text-gray-700"
                            >
                              False
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {question.type === "Short Answer" && (
                      <div className="mt-4 pl-12">
                        <label className="block text-gray-700 mb-2">
                          Your Answer:
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your short answer"
                          className="w-full p-3 border border-[#FFC996] rounded-lg focus:ring-2 focus:ring-[#FF8474]"
                        />
                      </div>
                    )}

                    {question.type === "Essay" && (
                      <div className="mt-4 pl-12">
                        <label className="block text-gray-700 mb-2">
                          Your Answer:
                        </label>
                        <textarea
                          placeholder="Write your essay here"
                          className="w-full p-3 border border-[#FFC996] rounded-lg focus:ring-2 focus:ring-[#FF8474] h-36"
                        ></textarea>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showList && !showPreview && (
            <div className="max-w-3xl mt-12 mx-auto bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-[#583D72]">
                      {quizId ? "Edit Quiz Info" : "Quiz Info"}
                    </h1>
                    <p className="text-[#9F5F80] mt-1">
                      Setup your quiz details
                    </p>
                  </div>
                  <div className="bg-[#FFF5F0] p-3 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-[#FF8474]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#583D72]">
                      Quiz Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-[#FFC996] rounded-lg focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Enter quiz name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#583D72]">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-[#FFC996] rounded-lg focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#583D72]">
                      Tags
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-[#FFC996] rounded-lg focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Comma separated tags"
                    />
                    <p className="mt-1 text-xs text-[#9F5F80]">
                      Help users find your quiz with relevant tags
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto flex justify-center items-center py-2 px-6 bg-[#FF8474] hover:bg-[#FF6B5B] text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-70"
                    >
                      {quizId ? "Update" : "Save"}
                    </button>
                  </div>

                  {message && (
                    <div
                      className={`p-4 rounded-lg ${
                        message.type === "success"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      <div className="flex items-center">
                        {message.type === "success" ? (
                          <svg
                            className="h-5 w-5 mr-2 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5 mr-2 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        {message.text}
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
          {showModal && (
            <div className="fixed inset-0 z-50 bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
                <h2 className="text-lg font-semibold mb-4 text-center">
                  Quiz Already Submitted !
                </h2>
                <p className="mb-4 text-center">
                  Do you want to unsubmit{" "}
                  <span className="text-[#9F5F80] font-bold">
                    {" "}
                    {quiz.name}{" "}
                  </span>
                  ?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleUnsubmit}
                    className="bg-[#9F5F80] text-white px-5 py-2 rounded hover:bg-[#8E4E75]"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 px-5 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {showModalSubmit && (
            <div className="fixed inset-0 z-50 bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
                <h2 className="text-lg  mb-4 text-center">
                  <span className="text-[#9F5F80] font-bold">
                    {" "}
                    {quiz.name}{" "}
                  </span>{" "}
                  Submitted Successfully!
                </h2>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowModalSubmit(false)}
                    className="bg-[#9F5F80] px-5 py-2 rounded hover:bg-[#8E4E75] text-white"
                  >
                    Ok
                  </button>
                </div>
              </div>
            </div>
          )}
          {showModalDelete && (
            <div className="fixed inset-0 z-50 bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
                <h2 className="text-lg  mb-4 text-center">
                  Are you sure you want to delete this Question ?
                </h2>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="bg-[#9F5F80] px-5 py-2 rounded hover:bg-[#8E4E75] text-white"
                  >
                    Ok
                  </button>
                  <button
                    onClick={() => setShowModalDelete(false)}
                    className="bg-gray-300 px-5 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {showAddQuestion && (
            <div className="bg-white overflow-hidden">
              <div className="pt-5">
                <CreateQuiz
                  questionId={currentQuestionIdInternal}
                  quizId={quizId}
                  selectedQuestion={selectedQuestionInternal}
                  onQuestionSaved={handleQuestionSaved} // Pass the callback
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
