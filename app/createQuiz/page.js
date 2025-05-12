"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { toast, Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function CreateQuiz({ questionId, quizId, selectedQuestion }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [questionType, setQuestionType] = useState(
    selectedQuestion?.type || ""
  );

  useEffect(() => {
    if (selectedQuestion) {
      setQuestionType(selectedQuestion.type);
      setSelectedType(selectedQuestion.type);
    }
  }, [selectedQuestion]);

  const quizTypes = [
    "Multiple Choice",
    "True/False",
    "Fill in the Blank",
    "Matching",
    "Short Answer",
    "Essay",
  ];

  useEffect(() => {
    const type = searchParams.get("type");
    const courseName = searchParams.get("course");

    if (type) setQuestionType(decodeURIComponent(type));
    if (courseName) setCourse(decodeURIComponent(courseName));

    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8474]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-fit">
      <Toaster position="top-right" />
      <div className="text-center ">
        <h1 className="text-3xl font-bold text-[#583D72] mb-4">
          {selectedQuestion ? "Edit Question" : "Create New Question"}
        </h1>
      </div>

      <div className="relative w-98 mx-auto ">
        <select
          className="w-full  px-4 py-2.5 border-2 border-[#FFC996] rounded-xl text-[#583D72] font-medium 
                    focus:outline-none focus:ring-1 focus:ring-[#FF8474] appearance-none"
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setQuestionType(e.target.value);
          }}
        >
          <option value="">-- Select Question Type --</option>
          {quizTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9F5F80]">
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
      </div>

      <div className="p-4">
        {questionType === "Multiple Choice" && (
          <MultipleChoiceForm
            questionType={questionType}
            questionId={selectedQuestion?.id || null}
            quizId={quizId}
            selectedQuestion={selectedQuestion}
            setQuestionType={setQuestionType}
          />
        )}

        {questionType === "True/False" && (
          <TrueFalseForm
            questionType={questionType}
            questionId={selectedQuestion?.id || null}
            quizId={quizId}
            selectedQuestion={selectedQuestion}
            setQuestionType={setQuestionType}
          />
        )}

        {questionType === "Fill in the Blank" && (
          <FillInTheBlankForm
            questionType={questionType}
            questionId={selectedQuestion?.id || null}
            quizId={quizId}
            selectedQuestion={selectedQuestion}
            setQuestionType={setQuestionType}
          />
        )}

        {questionType === "Matching" && (
          <MatchingForm
            questionType={questionType}
            questionId={selectedQuestion?.id || null}
            quizId={quizId}
            selectedQuestion={selectedQuestion}
            setQuestionType={setQuestionType}
          />
        )}

        {questionType === "Short Answer" && (
          <ShortAnswerForm
            questionType={questionType}
            questionId={selectedQuestion?.id || null}
            quizId={quizId}
            selectedQuestion={selectedQuestion}
            setQuestionType={setQuestionType}
          />
        )}

        {questionType === "Essay" && (
          <EssayForm
            questionType={questionType}
            questionId={selectedQuestion?.id || null}
            quizId={quizId}
            selectedQuestion={selectedQuestion}
            setQuestionType={setQuestionType}
          />
        )}
      </div>
    </div>
  );
}

function MultipleChoiceForm({
  questionId,
  quizId,
  selectedQuestion,
  setQuestionType,
}) {
  const [formData, setFormData] = useState({
    question: selectedQuestion?.question || "",
    options: selectedQuestion?.options || ["", "", "", ""],
    hint: selectedQuestion?.hint || "",
    correctAnswer: selectedQuestion?.correct_answer || "",
    points: selectedQuestion?.points || 1,
    difficulty: selectedQuestion?.difficulty || "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (questionId) {
      const fetchQuestion = async () => {
        try {
          const { data, error } = await supabase
            .from("Question")
            .select("*")
            .eq("id", questionId)
            .single();

          if (error) throw error;

          if (data) {
            setFormData({
              question: data.question || "",
              options: data.options || ["", "", "", ""],
              hint: data?.hint || "",

              correctAnswer: data.correct_answer || "",
              points: data.points || 1,
              difficulty: data.difficulty || "medium",
            });
          }
        } catch (error) {
          toast.error(`Error loading question: ${error.message}`);
        }
      };

      fetchQuestion();
    }
  }, [questionId]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.question.trim()) {
      toast.error("Question is required");
      setIsSubmitting(false);
      return;
    }

    if (formData.options.some((opt) => !opt.trim())) {
      toast.error("All options must be filled");
      setIsSubmitting(false);
      return;
    }

    if (!formData.correctAnswer) {
      toast.error("Please select the correct answer");
      setIsSubmitting(false);
      return;
    }

    try {
      const quiz_id = parseInt(quizId, 10);

      const { data: quizData, error: quizError } = await supabase
        .from("Quiz")
        .select("id")
        .eq("id", quiz_id)
        .single();

      if (quizError || !quizData) {
        toast.error("Invalid quiz_id. No matching quiz found.");
        setIsSubmitting(false);
        return;
      }

      let error;

      if (questionId) {
        ({ error } = await supabase
          .from("Question")
          .update({
            question: formData.question,
            options: formData.options,
            hint: formData.hint,

            correct_answer: formData.correctAnswer,
            points: formData.points,
            difficulty: formData.difficulty,
            type: "Multiple Choice",
          })
          .eq("id", questionId));
      } else {
        ({ error } = await supabase.from("Question").insert({
          question: formData.question,
          options: formData.options,
          hint: formData.hint,

          correct_answer: formData.correctAnswer,
          points: formData.points,
          difficulty: formData.difficulty,
          quiz_id,
          type: "Multiple Choice",
        }));
      }

      toast.success(
        `Question ${questionId ? "updated" : "saved"} successfully!`
      );
      setQuestionType("");

      if (!questionId) {
        setFormData({
          question: "",
          options: ["", "", "", ""],
          hint: "",
          correctAnswer: "",
          points: 1,
          difficulty: "medium",
        });
      }
    } catch (error) {
      toast.error(`Error saving question: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl  p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#583D72] mb-2">
          Multiple Choice Question
        </h2>
        <p className="text-[#9F5F80]">
          Create a question with multiple possible answers
        </p>
      </div>

      <div className="">
        <label className="block text-sm font-medium text-[#583D72] mb-2">
          Question
        </label>
        <textarea
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          className="w-full p-4 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          rows={3}
          placeholder="Enter your question..."
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-[#583D72] mb-2">
          Hint
        </label>
        <textarea
          value={formData.hint}
          onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
          className="w-full p-4 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          rows={3}
          placeholder="Enter your Hint..."
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#583D72] mb-3">
          Answer Options
        </label>
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center 
                              ${
                                formData.correctAnswer ===
                                String.fromCharCode(65 + index)
                                  ? "border-[#9F5F80] bg-[#9F5F80] text-white"
                                  : "border-[#FFC996]"
                              }`}
              >
                {String.fromCharCode(65 + index)}
              </div>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1 p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
                placeholder={`Option ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#583D72] mb-2">
            Correct Answer
          </label>
          <select
            value={formData.correctAnswer}
            onChange={(e) =>
              setFormData({ ...formData, correctAnswer: e.target.value })
            }
            className="w-full p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          >
            <option value="">Select</option>
            {formData.options.map((_, index) => (
              <option key={index} value={String.fromCharCode(65 + index)}>
                {String.fromCharCode(65 + index)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#583D72] mb-2">
            Points
          </label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) =>
              setFormData({ ...formData, points: Number(e.target.value) })
            }
            className="w-full p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#583D72] mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="pt-4 justify-center flex item-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-48 py-3 rounded-lg text-white transition-all ${
            isSubmitting ? "bg-[#9F5F80]/70" : "bg-[#9F5F80] hover:bg-[#583D72]"
          }`}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Question"
          )}
        </button>
      </div>
    </form>
  );
}

function TrueFalseForm({
  questionId,
  quizId,
  selectedQuestion,
  setQuestionType,
}) {
  const [formData, setFormData] = useState({
    question: selectedQuestion?.question || "",
    hint: selectedQuestion?.hint || "",
    answer: selectedQuestion?.correct_answer || "",
    points: selectedQuestion?.points || 1,
    difficulty: selectedQuestion?.difficulty || "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (questionId) {
      const fetchQuestion = async () => {
        try {
          const { data, error } = await supabase
            .from("Question")
            .select("*")
            .eq("id", questionId)
            .single();

          if (error) throw error;
          if (data) {
            setFormData({
              question: data.question || "",
              hint: data.hint || "",
              answer: data.correct_answer || "",
              points: data.points || 1,
              difficulty: data.difficulty || "medium",
            });
          }
        } catch (error) {
          toast.error(`Error loading question: ${error.message}`);
        }
      };
      fetchQuestion();
    }
  }, [questionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.question.trim()) {
      toast.error("Question is required");
      setIsSubmitting(false);
      return;
    }

    if (!formData.answer) {
      toast.error("Please select the correct answer");
      setIsSubmitting(false);
      return;
    }

    try {
      const quiz_id = parseInt(quizId, 10);
      const { data: quizData, error: quizError } = await supabase
        .from("Quiz")
        .select("id")
        .eq("id", quiz_id)
        .single();

      if (quizError || !quizData) {
        toast.error("Invalid quiz_id. No matching quiz found.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("Question").upsert({
        id: questionId || undefined,
        question: formData.question,
        hint: formData.hint,
        correct_answer: formData.answer,
        points: formData.points,
        difficulty: formData.difficulty,
        quiz_id,
        type: "True/False",
      });

      if (error) throw error;

      toast.success(
        `Question ${questionId ? "updated" : "saved"} successfully!`
      );
      setQuestionType("");
    } catch (error) {
      toast.error(`Error saving question: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl  p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#583D72] mb-2">
          True/False Question
        </h2>
        <p className="text-[#9F5F80]">Create a true or false question</p>
      </div>

      <div className="">
        <label className="block text-sm font-medium text-[#583D72] mb-2">
          Question
        </label>
        <textarea
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          className="w-full p-4 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          rows={3}
          placeholder="Enter your true/false question..."
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-[#583D72] mb-2">
          Hint
        </label>
        <textarea
          value={formData.hint}
          onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
          className="w-full p-4 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          rows={3}
          placeholder="Enter your Hint..."
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#583D72] mb-2">
          Correct Answer
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, answer: "True" })}
            className={`flex-1 p-4 border-2 rounded-lg ${
              formData.answer === "True"
                ? "border-[#9F5F80] bg-[#9F5F80] text-white"
                : "border-[#FFC996] hover:border-[#FF8474]"
            }`}
          >
            True
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, answer: "False" })}
            className={`flex-1 p-4 border-2 rounded-lg ${
              formData.answer === "False"
                ? "border-[#9F5F80] bg-[#9F5F80] text-white"
                : "border-[#FFC996] hover:border-[#FF8474]"
            }`}
          >
            False
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#583D72] mb-2">
            Points
          </label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) =>
              setFormData({ ...formData, points: Number(e.target.value) })
            }
            className="w-full p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#583D72] mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="pt-4 justify-center flex item-center ">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-48 text-center  py-3 rounded-lg text-white transition-all ${
            isSubmitting ? "bg-[#9F5F80]/70" : "bg-[#9F5F80] hover:bg-[#583D72]"
          }`}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Question"
          )}
        </button>
      </div>
    </form>
  );
}

function FillInTheBlankForm({
  questionId,
  quizId,
  selectedQuestion,
  setQuestionType,
}) {
  const [formData, setFormData] = useState({
    question: selectedQuestion?.question || "",
    hint: selectedQuestion?.hint || "",
    options: selectedQuestion?.options || ["", "", "", ""],
    correctAnswer: selectedQuestion?.correct_answer || "",
    points: selectedQuestion?.points || 1,
    difficulty: selectedQuestion?.difficulty || "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (questionId) {
      const fetchQuestion = async () => {
        try {
          const { data, error } = await supabase
            .from("Question")
            .select("*")
            .eq("id", questionId)
            .single();

          if (error) throw error;
          if (data) {
            setFormData({
              question: data.question || "",
              hint: data.hint || "",
              options: data.options || ["", "", "", ""],
              correctAnswer: data.correct_answer || "",
              points: data.points || 1,
              difficulty: data.difficulty || "medium",
            });
          }
        } catch (error) {
          toast.error(`Error loading question: ${error.message}`);
        }
      };
      fetchQuestion();
    }
  }, [questionId]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.question.trim()) {
      toast.error("Question is required");
      setIsSubmitting(false);
      return;
    }

    if (formData.options.some((opt) => !opt.trim())) {
      toast.error("All options must be filled");
      setIsSubmitting(false);
      return;
    }

    if (!formData.correctAnswer) {
      toast.error("Please select the correct answer");
      setIsSubmitting(false);
      return;
    }

    try {
      const quiz_id = parseInt(quizId, 10);
      const { data: quizData, error: quizError } = await supabase
        .from("Quiz")
        .select("id")
        .eq("id", quiz_id)
        .single();

      if (quizError || !quizData) {
        toast.error("Invalid quiz_id. No matching quiz found.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("Question").upsert({
        id: questionId || undefined,
        question: formData.question,
        options: formData.options,
        hint: formData.hint,
        correct_answer: formData.correctAnswer,
        points: formData.points,
        difficulty: formData.difficulty,
        quiz_id,
        type: "Fill in the Blank",
      });

      if (error) throw error;

      toast.success(
        `Question ${questionId ? "updated" : "saved"} successfully!`
      );
      setQuestionType("");
    } catch (error) {
      toast.error(`Error saving question: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl  p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#583D72] mb-2">
          Fill in the Blank Question
        </h2>
        <p className="text-[#9F5F80]">
          Create a question with blank spaces to fill
        </p>
      </div>

      <div className="">
        <label className="block text-sm font-medium text-[#583D72] mb-2">
          Question (use "___" for the blank)
        </label>
        <textarea
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          className="w-full p-4 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          rows={3}
          placeholder="Enter question with ___ for blank"
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-[#583D72] mb-2">
          Hint
        </label>
        <textarea
          value={formData.hint}
          onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
          className="w-full p-4 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          rows={3}
          placeholder="Enter Your Hint"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[#583D72] mb-3">
          Possible Answers
        </label>
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center 
                              ${
                                formData.correctAnswer ===
                                String.fromCharCode(65 + index)
                                  ? "border-[#9F5F80] bg-[#9F5F80] text-white"
                                  : "border-[#FFC996]"
                              }`}
              >
                {String.fromCharCode(65 + index)}
              </div>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1 p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
                placeholder={`Option ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#583D72] mb-2">
            Correct Answer
          </label>
          <select
            value={formData.correctAnswer}
            onChange={(e) =>
              setFormData({ ...formData, correctAnswer: e.target.value })
            }
            className="w-full p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          >
            <option value="">Select</option>
            {formData.options.map((_, index) => (
              <option key={index} value={String.fromCharCode(65 + index)}>
                {String.fromCharCode(65 + index)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#583D72] mb-2">
            Points
          </label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) =>
              setFormData({ ...formData, points: Number(e.target.value) })
            }
            className="w-full p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#583D72] mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="pt-4 justify-center flex item-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-48 py-3 rounded-lg text-white transition-all ${
            isSubmitting ? "bg-[#9F5F80]/70" : "bg-[#9F5F80] hover:bg-[#583D72]"
          }`}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Question"
          )}
        </button>
      </div>
    </form>
  );
}

function EssayForm({ questionId, quizId, selectedQuestion, setQuestionType }) {
  const [formData, setFormData] = useState({
    question: selectedQuestion?.question || "",
    hint: selectedQuestion?.hint || "",
    points: selectedQuestion?.points || 1,
    difficulty: selectedQuestion?.difficulty || "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (questionId) {
      const fetchQuestion = async () => {
        try {
          const { data, error } = await supabase
            .from("Question")
            .select("*")
            .eq("id", questionId)
            .single();

          if (error) throw error;
          if (data) {
            setFormData({
              question: data.question || "",
              hint: data.hint || "",
              points: data.points || 1,
              difficulty: data.difficulty || "medium",
            });
          }
        } catch (error) {
          toast.error(`Error loading question: ${error.message}`);
        }
      };
      fetchQuestion();
    }
  }, [questionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.question.trim()) {
      toast.error("Question is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const quiz_id = parseInt(quizId, 10);
      const { data: quizData, error: quizError } = await supabase
        .from("Quiz")
        .select("id")
        .eq("id", quiz_id)
        .single();

      if (quizError || !quizData) {
        toast.error("Invalid quiz_id. No matching quiz found.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("Question").upsert({
        id: questionId || undefined,
        question: formData.question,
        hint: formData.hint,
        points: formData.points,
        difficulty: formData.difficulty,
        quiz_id,
        type: "Essay",
      });

      if (error) throw error;

      toast.success(
        `Question ${questionId ? "updated" : "saved"} successfully!`
      );
      setQuestionType("");
    } catch (error) {
      toast.error(`Error saving question: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl  p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#583D72] mb-2">
          Essay Question
        </h2>
        <p className="text-[#9F5F80]">Create an open-ended essay question</p>
      </div>

      <div className="">
        <label className="block text-sm font-medium text-[#583D72] mb-2">
          Question Prompt
        </label>
        <textarea
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          className="w-full p-4 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          rows={4}
          placeholder="Enter essay question prompt..."
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-[#583D72] mb-2">
          Hint
        </label>
        <textarea
          value={formData.hint}
          onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
          className="w-full p-4 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          rows={4}
          placeholder="Enter Your Hint..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#583D72] mb-2">
            Points
          </label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) =>
              setFormData({ ...formData, points: Number(e.target.value) })
            }
            className="w-full p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#583D72] mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="pt-4 justify-center flex item-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-48 py-3 rounded-lg text-white transition-all ${
            isSubmitting ? "bg-[#9F5F80]/70" : "bg-[#9F5F80] hover:bg-[#583D72]"
          }`}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Question"
          )}
        </button>
      </div>
    </form>
  );
}

function ShortAnswerForm({
  questionId,
  quizId,
  selectedQuestion,
  setQuestionType,
}) {
  const [formData, setFormData] = useState({
    question: selectedQuestion?.question || "",
    hint: selectedQuestion?.hint || "",
    points: selectedQuestion?.points || 1,
    difficulty: selectedQuestion?.difficulty || "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (questionId) {
      const fetchQuestion = async () => {
        try {
          const { data, error } = await supabase
            .from("Question")
            .select("*")
            .eq("id", questionId)
            .single();

          if (error) throw error;
          if (data) {
            setFormData({
              question: data.question || "",
              hint: data.hint || "",
              points: data.points || 1,
              difficulty: data.difficulty || "medium",
            });
          }
        } catch (error) {
          toast.error(`Error loading question: ${error.message}`);
        }
      };
      fetchQuestion();
    }
  }, [questionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.question.trim()) {
      toast.error("Question is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const quiz_id = parseInt(quizId, 10);
      const { data: quizData, error: quizError } = await supabase
        .from("Quiz")
        .select("id")
        .eq("id", quiz_id)
        .single();

      if (quizError || !quizData) {
        toast.error("Invalid quiz_id. No matching quiz found.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("Question").upsert({
        id: questionId || undefined,
        question: formData.question,
        hint: formData.hint,
        points: formData.points,
        difficulty: formData.difficulty,
        quiz_id,
        type: "Short Answer",
      });

      if (error) throw error;

      toast.success(
        `Question ${questionId ? "updated" : "saved"} successfully!`
      );
      setQuestionType("");
    } catch (error) {
      toast.error(`Error saving question: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl  p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#583D72] mb-2">
          Short Answer Question
        </h2>
        <p className="text-[#9F5F80]">
          Create a question requiring a short written response
        </p>
      </div>

      <div className="">
        <label className="block text-sm font-medium text-[#583D72] mb-2">
          Question
        </label>
        <textarea
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          className="w-full p-4 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          rows={3}
          placeholder="Enter your short answer question..."
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-[#583D72] mb-2">
          Hint
        </label>
        <textarea
          value={formData.hint}
          onChange={(e) =>
            setFormData({ ...formData, hint: e.target.value })
          }
          className="w-full p-4 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          rows={3}
          placeholder="Enter your Hint..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#583D72] mb-2">
            Points
          </label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) =>
              setFormData({ ...formData, points: Number(e.target.value) })
            }
            className="w-full p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#583D72] mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="pt-4 justify-center flex item-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-48 py-3 rounded-lg text-white transition-all ${
            isSubmitting ? "bg-[#9F5F80]/70" : "bg-[#9F5F80] hover:bg-[#583D72]"
          }`}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Question"
          )}
        </button>
      </div>
    </form>
  );
}

function MatchingForm({
  questionId,
  quizId,
  selectedQuestion,
  setQuestionType,
}) {
  const [formData, setFormData] = useState({
    question: selectedQuestion?.question || "",
    hint: selectedQuestion?.hint || "",
    pairs: selectedQuestion?.pairs
      ? typeof selectedQuestion.pairs === "string"
        ? JSON.parse(selectedQuestion.pairs)
        : selectedQuestion.pairs
      : [{ left: "", right: "" }],
    points: selectedQuestion?.points || 1,
    difficulty: selectedQuestion?.difficulty || "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (questionId) {
      const fetchQuestion = async () => {
        try {
          const { data, error } = await supabase
            .from("Question")
            .select("*")
            .eq("id", questionId)
            .single();

          if (error) throw error;
          if (data) {
            setFormData({
              question: data.question || "",
              hint: data.hint || "",
              pairs:
                typeof data.pairs === "string"
                  ? JSON.parse(data.pairs)
                  : [{ left: "", right: "" }],
              points: data.points || 1,
              difficulty: data.difficulty || "medium",
            });
          }
        } catch (error) {
          toast.error(`Error loading question: ${error.message}`);
        }
      };
      fetchQuestion();
    }
  }, [questionId]);

  const addPair = () => {
    setFormData((prev) => ({
      ...prev,
      pairs: [...prev.pairs, { left: "", right: "" }],
    }));
  };

  const removePair = (index) => {
    if (formData.pairs.length <= 1) {
      toast.error("You must have at least one pair");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      pairs: prev.pairs.filter((_, i) => i !== index),
    }));
  };

  const handlePairChange = (index, field, value) => {
    const newPairs = [...formData.pairs];
    newPairs[index][field] = value;
    setFormData({ ...formData, pairs: newPairs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.question.trim()) {
      toast.error("Question is required");
      setIsSubmitting(false);
      return;
    }

    if (
      formData.pairs.some((pair) => !pair.left.trim() || !pair.right.trim())
    ) {
      toast.error("All pairs must be filled");
      setIsSubmitting(false);
      return;
    }

    try {
      const quiz_id = parseInt(quizId, 10);
      const { data: quizData, error: quizError } = await supabase
        .from("Quiz")
        .select("id")
        .eq("id", quiz_id)
        .single();

      if (quizError || !quizData) {
        toast.error("Invalid quiz_id. No matching quiz found.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("Question").upsert({
        id: questionId || undefined,
        question: formData.question,
        hint: formData.hint,
        pairs: JSON.stringify(formData.pairs),
        points: formData.points,
        difficulty: formData.difficulty,
        quiz_id,
        type: "Matching",
      });

      if (error) throw error;

      toast.success(
        `Question ${questionId ? "updated" : "saved"} successfully!`
      );
      setQuestionType("");
    } catch (error) {
      toast.error(`Error saving question: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl  p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#583D72] mb-2">
          Matching Question
        </h2>
        <p className="text-[#9F5F80]">Create a matching pairs question</p>
      </div>

      <div className="">
        <label className="block text-sm font-medium text-[#583D72] mb-2">
          Question/Prompt
        </label>
        <textarea
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          className="w-full p-4 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          rows={2}
          placeholder="Enter matching question prompt..."
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-[#583D72] mb-2">
          Hint
        </label>
        <textarea
          value={formData.hint}
          onChange={(e) =>
            setFormData({ ...formData, hint: e.target.value })
          }
          className="w-full p-4 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          rows={2}
          placeholder="Enter Your Hint..."
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[#583D72] mb-3">
          Matching Pairs
        </label>
        <div className="space-y-4">
          {formData.pairs.map((pair, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={pair.left}
                onChange={(e) =>
                  handlePairChange(index, "left", e.target.value)
                }
                placeholder={`Left item ${index + 1}`}
                className="flex-1 p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
              />
              <div className="text-[#9F5F80] font-medium">matches with</div>
              <input
                type="text"
                value={pair.right}
                onChange={(e) =>
                  handlePairChange(index, "right", e.target.value)
                }
                placeholder={`Right item ${index + 1}`}
                className="flex-1 p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
              />
              <button
                type="button"
                onClick={() => removePair(index)}
                className="p-2 text-[#FF8474] hover:text-[#583D72] transition-all"
                disabled={formData.pairs.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addPair}
          className="mt-3 px-4 py-2 bg-[#FFC996] text-[#583D72] rounded-lg hover:bg-[#FF8474] hover:text-white transition-all"
        >
          Add Pair
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#583D72] mb-2">
            Points
          </label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) =>
              setFormData({ ...formData, points: Number(e.target.value) })
            }
            className="w-full p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#583D72] mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full p-3 border border-[#FFC996] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8474] focus:border-[#FF8474] transition-all"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="pt-4 justify-center flex item-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-48 py-3 rounded-lg text-white transition-all ${
            isSubmitting ? "bg-[#9F5F80]/70" : "bg-[#9F5F80] hover:bg-[#583D72]"
          }`}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Question"
          )}
        </button>
      </div>
    </form>
  );
}
