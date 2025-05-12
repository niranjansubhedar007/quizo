"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { toast, Toaster } from "react-hot-toast";

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

  // Update the useEffect to use the selectedQuestion prop
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
    "Image/Video",
  ];

  useEffect(() => {
    const type = searchParams.get("type");
    const courseName = searchParams.get("course");

    if (type) setQuestionType(decodeURIComponent(type));
    if (courseName) setCourse(decodeURIComponent(courseName));

    setLoading(false);
  }, [searchParams]);

  const handleSelect = () => {
    setQuestionType(selectedType);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Toaster position="top-right" />
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Select Question Type
        </h1>
      </div>

      <select
        className="w-98 mx-auto justify-center flex item-center align-center p-2 border border-gray-300 rounded-lg mb-6"
        value={selectedType}
        onChange={(e) => {
          setSelectedType(e.target.value);
          setQuestionType(e.target.value); // keep questionType in sync
        }}
      >
        <option value="">-- Select Question Type --</option>
        {quizTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <div className="p-4">
        {questionType === "Multiple Choice" && (
          <MultipleChoiceForm
            questionType={questionType}
            questionId={selectedQuestion?.id || null}
            quizId={quizId}
            selectedQuestion={selectedQuestion}
            setQuestionType={setQuestionType} // Pass this down
          />
        )}

        {questionType === "True/False" && (
          <TrueFalseForm
            questionType={questionType}
            questionId={selectedQuestion?.id || null}
            quizId={quizId}
            selectedQuestion={selectedQuestion}
            setQuestionType={setQuestionType} // Pass this down
          />
        )}
        {questionType === "Essay" && (
          <EssayForm
            questionType={questionType}
            questionId={selectedQuestion?.id || null}
            quizId={quizId}
            selectedQuestion={selectedQuestion}
            setQuestionType={setQuestionType} // Pass this down
          />
        )}
        {questionType === "Short Answer" && (
          <ShortAnswerForm
            questionType={questionType}
            questionId={selectedQuestion?.id || null}
            quizId={quizId}
            selectedQuestion={selectedQuestion}
            setQuestionType={setQuestionType} // Pass this down
          />
        )}
        {questionType === "Matching" && (
          <MatchingForm
            questionType={questionType}
            questionId={selectedQuestion?.id || null}
            quizId={quizId}
            selectedQuestion={selectedQuestion}
            setQuestionType={setQuestionType} // Pass this down
          />
        )}
        {questionType === "Image/Video" && (
          <MediaUpload
            questionType={questionType}
            questionId={selectedQuestion?.id || null}
            quizId={quizId}
            selectedQuestion={selectedQuestion}
            setQuestionType={setQuestionType} // Pass this down
          />
        )}
        {questionType === "Fill in the Blank" && (
          <FillInTheBlankForm
            questionType={questionType}
            questionId={selectedQuestion?.id || null}
            quizId={quizId}
            selectedQuestion={selectedQuestion}
            setQuestionType={setQuestionType} // Pass this down
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

    // Validation code...

    try {
      const quiz_id = parseInt(quizId, 10);

      // Check if quiz exists
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
        // Update existing question
        ({ error } = await supabase
          .from("Question")
          .update({
            question: formData.question,
            options: formData.options,
            correct_answer: formData.correctAnswer,
            points: formData.points,
            difficulty: formData.difficulty,
            type: "Multiple Choice",
          })
          .eq("id", questionId));
      } else {
        // Insert new question
        ({ error } = await supabase.from("Question").insert({
          question: formData.question,
          options: formData.options,
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
      // Optionally reset form after successful submission if not editing
      if (!questionId) {
        setFormData({
          question: "",
          options: ["", "", "", ""],
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
    <form
      onSubmit={handleSubmit}
      className="space-y-6 border p-6 rounded-md bg-white shadow"
    >
      <h2 className="text-xl font-semibold text-blue-600">
        Multiple Choice Question
      </h2>

      <div>
        <label className="block font-medium">Question</label>
        <textarea
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          className="w-full border p-2 rounded"
          rows={3}
          placeholder="Enter your question..."
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Options</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span>{String.fromCharCode(65 + index)}.</span>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1 p-2 border rounded"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block font-medium">Correct Answer</label>
          <select
            value={formData.correctAnswer}
            onChange={(e) =>
              setFormData({ ...formData, correctAnswer: e.target.value })
            }
            className="w-full p-2 border rounded"
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
          <label className="block font-medium">Points</label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) =>
              setFormData({ ...formData, points: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Difficulty</label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full p-2 border rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        disabled={isSubmitting}
      >
        Save
      </button>
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

    // Validation code...

    try {
      const quiz_id = parseInt(quizId, 10);

      // Check if quiz exists
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
        // Update existing question
        ({ error } = await supabase
          .from("Question")
          .update({
            question: formData.question,
            options: formData.options,
            correct_answer: formData.correctAnswer,
            points: formData.points,
            difficulty: formData.difficulty,
            type: "True/False",
          })
          .eq("id", questionId));
      } else {
        // Insert new question
        ({ error } = await supabase.from("Question").insert({
          question: formData.question,
          options: formData.options,
          correct_answer: formData.correctAnswer,
          points: formData.points,
          difficulty: formData.difficulty,
          quiz_id,
          type: "True/False",
        }));
      }

      toast.success(
        `Question ${questionId ? "updated" : "saved"} successfully!`
      );
      setQuestionType("");
      // Optionally reset form after successful submission if not editing
      if (!questionId) {
        setFormData({
          question: "",
          options: ["", "", "", ""],
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
  // ... existing state and logic ...

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 space-y-6 border border-green-200"
    >
      <h2 className="text-xl font-semibold text-green-600">
        True/False Question
      </h2>

      {/* question */}
      <div>
        <label className="block text-sm font-semibold text-green-600 mb-2">
          question
        </label>
        <textarea
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          placeholder="Enter your true/false question..."
          className="w-full p-3 border border-green-200 rounded-lg focus:ring-green-500 focus:border-green-500"
          rows={3}
        />
      </div>

      {/* Answer, Points, Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-green-600 mb-2">
            Correct Answer
          </label>
          <select
            value={formData.answer}
            onChange={(e) =>
              setFormData({ ...formData, answer: e.target.value })
            }
            className="w-full p-2 border border-green-200 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select correct answer</option>
            <option value="True">True</option>
            <option value="False">False</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-green-600 mb-2">
            Points
          </label>
          <input
            type="number"
            min="1"
            value={formData.points}
            onChange={(e) =>
              setFormData({
                ...formData,
                points: parseInt(e.target.value) || 1,
              })
            }
            className="w-full p-2 border border-green-200 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-green-600 mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full p-2 border border-green-200 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-6 space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-5 py-2 text-sm font-medium text-white rounded-md transition-all duration-200 ${
            isSubmitting
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isSubmitting ? "Saving..." : "Save Question"}
        </button>
      </div>
    </form>
  );
}

function FillInTheBlankForm({   questionId,
  quizId,
  selectedQuestion,
  setQuestionType,
}) {
  const [formData, setFormData] = useState({
    question: selectedQuestion?.question || "",
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

    // Validation code...

    try {
      const quiz_id = parseInt(quizId, 10);

      // Check if quiz exists
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
        // Update existing question
        ({ error } = await supabase
          .from("Question")
          .update({
            question: formData.question,
            options: formData.options,
            correct_answer: formData.correctAnswer,
            points: formData.points,
            difficulty: formData.difficulty,
            type: "Fill in the Blank",
          })
          .eq("id", questionId));
      } else {
        // Insert new question
        ({ error } = await supabase.from("Question").insert({
          question: formData.question,
          options: formData.options,
          correct_answer: formData.correctAnswer,
          points: formData.points,
          difficulty: formData.difficulty,
          quiz_id,
          type: "Fill in the Blank",
        }));
      }

      toast.success(
        `Question ${questionId ? "updated" : "saved"} successfully!`
      );
      setQuestionType("");
      // Optionally reset form after successful submission if not editing
      if (!questionId) {
        setFormData({
          question: "",
          options: ["", "", "", ""],
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
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 space-y-6 border border-yellow-200"
    >
      <h2 className="text-xl font-semibold text-yellow-600">
        Fill in the Blank Question
      </h2>

      {/* question */}
      <div>
        <label className="block text-sm font-semibold text-yellow-600 mb-2">
          question (use "___" for the blank)
        </label>
        <textarea
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          placeholder="Enter question with ___ for blank"
          className="w-full p-3 border border-yellow-200 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-yellow-600 mb-2">
          Options
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="font-bold text-yellow-600">
                {String.fromCharCode(65 + index)}.
              </span>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                className="flex-1 p-2 border border-yellow-200 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Answer, Points, Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-yellow-600 mb-2">
            Correct Answer
          </label>
          <select
            value={formData.correctAnswer}
            onChange={(e) =>
              setFormData({ ...formData, correctAnswer: e.target.value })
            }
            className="w-full p-2 border border-yellow-200 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="">Select correct option</option>
            {formData.options.map((_, index) => (
              <option key={index} value={String.fromCharCode(65 + index)}>
                {String.fromCharCode(65 + index)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-yellow-600 mb-2">
            Points
          </label>
          <input
            type="number"
            min="1"
            value={formData.points}
            onChange={(e) =>
              setFormData({
                ...formData,
                points: parseInt(e.target.value) || 1,
              })
            }
            className="w-full p-2 border border-yellow-200 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-yellow-600 mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full p-2 border border-yellow-200 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-6 space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-5 py-2 text-sm font-medium text-white rounded-md transition-all duration-200 ${
            isSubmitting
              ? "bg-yellow-400 cursor-not-allowed"
              : "bg-yellow-600 hover:bg-yellow-700"
          }`}
        >
          {isSubmitting ? "Saving..." : "Save Question"}
        </button>
      </div>
    </form>
  );
}

function EssayForm({  questionId,
  quizId,
  selectedQuestion,
  setQuestionType,
}) {
  const [formData, setFormData] = useState({
    question: selectedQuestion?.question || "",
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

    // Validation code...

    try {
      const quiz_id = parseInt(quizId, 10);

      // Check if quiz exists
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
        // Update existing question
        ({ error } = await supabase
          .from("Question")
          .update({
            question: formData.question,
            options: formData.options,
            correct_answer: formData.correctAnswer,
            points: formData.points,
            difficulty: formData.difficulty,
            type: "Essay",
          })
          .eq("id", questionId));
      } else {
        // Insert new question
        ({ error } = await supabase.from("Question").insert({
          question: formData.question,
          options: formData.options,
          correct_answer: formData.correctAnswer,
          points: formData.points,
          difficulty: formData.difficulty,
          quiz_id,
          type: "Essay",
        }));
      }

      toast.success(
        `Question ${questionId ? "updated" : "saved"} successfully!`
      );
      setQuestionType("");
      // Optionally reset form after successful submission if not editing
      if (!questionId) {
        setFormData({
          question: "",
          options: ["", "", "", ""],
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
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 space-y-6 border border-indigo-200"
    >
      <h2 className="text-xl font-semibold text-indigo-600">Essay Question</h2>

      {/* Question */}
      <div>
        <label className="block text-sm font-semibold text-indigo-600 mb-2">
          Essay Question
        </label>
        <textarea
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          placeholder="Enter essay question prompt..."
          className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          rows={4}
        />
      </div>

      {/* Points and Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-indigo-600 mb-2">
            Points
          </label>
          <input
            type="number"
            min="1"
            value={formData.points}
            onChange={(e) =>
              setFormData({
                ...formData,
                points: parseInt(e.target.value) || 1,
              })
            }
            className="w-full p-2 border border-indigo-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-indigo-600 mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full p-2 border border-indigo-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Preview */}
      {/* <div className="bg-indigo-50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-indigo-600 mb-2">
          Student Response Area (Preview)
        </h3>
        <textarea
          placeholder="Student will write their essay here..."
          className="w-full p-3 border border-indigo-200 rounded-lg bg-white h-40"
          readOnly
        />
      </div> */}

      {/* Action Buttons */}
      <div className="flex justify-end pt-6 space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-5 py-2 text-sm font-medium text-white rounded-md transition-all duration-200 ${
            isSubmitting
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isSubmitting ? "Saving..." : "Save Question"}
        </button>
      </div>
    </form>
  );
}

function ShortAnswerForm({   questionId,
  quizId,
  selectedQuestion,
  setQuestionType,
}) {
  const [formData, setFormData] = useState({
    question: selectedQuestion?.question || "",
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

    // Validation code...

    try {
      const quiz_id = parseInt(quizId, 10);

      // Check if quiz exists
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
        // Update existing question
        ({ error } = await supabase
          .from("Question")
          .update({
            question: formData.question,
            options: formData.options,
            correct_answer: formData.correctAnswer,
            points: formData.points,
            difficulty: formData.difficulty,
            type: "Short Answer",
          })
          .eq("id", questionId));
      } else {
        // Insert new question
        ({ error } = await supabase.from("Question").insert({
          question: formData.question,
          options: formData.options,
          correct_answer: formData.correctAnswer,
          points: formData.points,
          difficulty: formData.difficulty,
          quiz_id,
          type: "Short Answer",
        }));
      }

      toast.success(
        `Question ${questionId ? "updated" : "saved"} successfully!`
      );
      setQuestionType("");
      // Optionally reset form after successful submission if not editing
      if (!questionId) {
        setFormData({
          question: "",
          options: ["", "", "", ""],
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
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 space-y-6 border border-red-200"
    >
      <h2 className="text-xl font-semibold text-red-600">
        Short Answer Question
      </h2>

      {/* Question */}
      <div>
        <label className="block text-sm font-semibold text-red-600 mb-2">
          Question
        </label>
        <textarea
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          placeholder="Enter your short answer question..."
          className="w-full p-3 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500"
          rows={3}
        />
      </div>

      {/* Points and Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-red-600 mb-2">
            Points
          </label>
          <input
            type="number"
            min="1"
            value={formData.points}
            onChange={(e) =>
              setFormData({
                ...formData,
                points: parseInt(e.target.value) || 1,
              })
            }
            className="w-full p-2 border border-red-200 rounded-md focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-red-600 mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full p-2 border border-red-200 rounded-md focus:ring-red-500 focus:border-red-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Preview */}
      {/* <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-red-600 mb-2">
          Student Response Area (Preview)
        </h3>
        <textarea
          placeholder="Student will write their short answer here..."
          className="w-full p-3 border border-red-200 rounded-lg bg-white h-32"
          readOnly
        />
      </div> */}

      {/* Action Buttons */}
      <div className="flex justify-end pt-6 space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-5 py-2 text-sm font-medium text-white rounded-md transition-all duration-200 ${
            isSubmitting
              ? "bg-red-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isSubmitting ? "Saving..." : "Save Question"}
        </button>
      </div>
    </form>
  );
}

function MatchingForm({   questionId,
  quizId,
  selectedQuestion,
  setQuestionType,
}) {
  const [formData, setFormData] = useState({
    question: selectedQuestion?.question || "",
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

    // Validation code...

    try {
      const quiz_id = parseInt(quizId, 10);

      // Check if quiz exists
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
        // Update existing question
        ({ error } = await supabase
          .from("Question")
          .update({
            question: formData.question,
            options: formData.options,
            correct_answer: formData.correctAnswer,
            points: formData.points,
            difficulty: formData.difficulty,
          
            type: "Matching Choice",
          })
          .eq("id", questionId));
      } else {
        // Insert new question
        ({ error } = await supabase.from("Question").insert({
          question: formData.question,
          options: formData.options,
          correct_answer: formData.correctAnswer,
          points: formData.points,
          difficulty: formData.difficulty,
          quiz_id,
          type: "Matching Choice",
        }));
      }

      toast.success(
        `Question ${questionId ? "updated" : "saved"} successfully!`
      );
      setQuestionType("");
      // Optionally reset form after successful submission if not editing
      if (!questionId) {
        setFormData({
          question: "",
          options: ["", "", "", ""],
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
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 space-y-6 border border-purple-200"
    >
      <h2 className="text-xl font-semibold text-purple-600">
        Matching Question
      </h2>

      {/* Question */}
      <div>
        <label className="block text-sm font-semibold text-purple-600 mb-2">
          Question/Prompt
        </label>
        <textarea
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          placeholder="Enter matching question prompt..."
          className="w-full p-3 border border-purple-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          rows={2}
        />
      </div>

      {/* Pairs */}
      <div>
        <label className="block text-sm font-semibold text-purple-600 mb-2">
          Matching Pairs
        </label>
        <div className="space-y-3">
          {formData.pairs.map((pair, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={pair.left}
                onChange={(e) =>
                  handlePairChange(index, "left", e.target.value)
                }
                placeholder={`Left item ${index + 1}`}
                className="flex-1 p-2 border border-purple-200 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
              <span className="text-purple-600">matches with</span>
              <input
                type="text"
                value={pair.right}
                onChange={(e) =>
                  handlePairChange(index, "right", e.target.value)
                }
                placeholder={`Right item ${index + 1}`}
                className="flex-1 p-2 border border-purple-200 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => removePair(index)}
                disabled={formData.pairs.length <= 1}
                className={`p-2 text-purple-600 rounded-full hover:bg-purple-50 ${
                  formData.pairs.length <= 1
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addPair}
          className="mt-2 inline-flex items-center px-3 py-1 border border-purple-200 shadow-sm text-sm leading-4 font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Pair
        </button>
      </div>

      {/* Points and Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-purple-600 mb-2">
            Points
          </label>
          <input
            type="number"
            min="1"
            value={formData.points}
            onChange={(e) =>
              setFormData({
                ...formData,
                points: parseInt(e.target.value) || 1,
              })
            }
            className="w-full p-2 border border-purple-200 rounded-md focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-600 mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full p-2 border border-purple-200 rounded-md focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-6 space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-5 py-2 text-sm font-medium text-white rounded-md transition-all duration-200 ${
            isSubmitting
              ? "bg-purple-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {isSubmitting ? "Saving..." : "Save Question"}
        </button>
      </div>
    </form>
  );
}
function MediaUpload({   questionId,
  quizId,
  selectedQuestion,
  setQuestionType,
}) {
  const [formData, setFormData] = useState({
    question: selectedQuestion?.question || "",
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

    // Validation code...

    try {
      const quiz_id = parseInt(quizId, 10);

      // Check if quiz exists
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
        // Update existing question
        ({ error } = await supabase
          .from("Question")
          .update({
            question: formData.question,
            options: formData.options,
            correct_answer: formData.correctAnswer,
            points: formData.points,
            difficulty: formData.difficulty,
            type: "Image/Video",
          })
          .eq("id", questionId));
      } else {
        // Insert new question
        ({ error } = await supabase.from("Question").insert({
          question: formData.question,
          options: formData.options,
          correct_answer: formData.correctAnswer,
          points: formData.points,
          difficulty: formData.difficulty,
          quiz_id,
          type: "Image/Video",
        }));
      }

      toast.success(
        `Question ${questionId ? "updated" : "saved"} successfully!`
      );
      setQuestionType("");
      // Optionally reset form after successful submission if not editing
      if (!questionId) {
        setFormData({
          question: "",
          options: ["", "", "", ""],
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
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 space-y-6 border border-pink-200"
    >
      <h2 className="text-xl font-semibold text-pink-600">
        {isEditing ? "Edit" : "Create"} Media Question for {course}
      </h2>

      <div className="space-y-4">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-pink-600 mb-2">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-pink-200 rounded-md focus:ring-pink-500 focus:border-pink-500"
            disabled={isUploading}
          />
          {filePreview && (
            <div className="mt-2">
              <img
                src={filePreview}
                alt="Preview"
                className="h-32 object-contain rounded-md border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Media URL Input */}
        <div>
          <label className="block text-sm font-semibold text-pink-600 mb-2">
            Media URL
          </label>
          <input
            type="url"
            value={formData.media_url}
            onChange={(e) =>
              setFormData({ ...formData, media_url: e.target.value })
            }
            placeholder="Auto-filled after upload"
            className="w-full p-2 border border-pink-200 rounded-md focus:ring-pink-500 focus:border-pink-500"
            readOnly={!!file} // Disable the input if file is uploaded
          />
          {formData.media_url && (
            <p className="text-xs text-gray-500 mt-1">
              Uploaded URL: {formData.media_url}
            </p>
          )}
        </div>

        {/* Question */}
        <div>
          <label className="block text-sm font-semibold text-pink-600 mb-2">
            Question Prompt
          </label>
          <textarea
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
            placeholder="Enter question about the media..."
            className="w-full p-3 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
            rows={3}
            required
          />
        </div>

        {/* Points and Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-pink-600 mb-2">
              Points
            </label>
            <input
              type="number"
              min="1"
              value={formData.points}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  points: parseInt(e.target.value) || 1,
                })
              }
              className="w-full p-2 border border-pink-200 rounded-md focus:ring-pink-500 focus:border-pink-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-pink-600 mb-2">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value })
              }
              className="w-full p-2 border border-pink-200 rounded-md focus:ring-pink-500 focus:border-pink-500"
              required
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4 space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 ${
            isUploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isUploading}
        >
          {isUploading ? "Saving..." : isEditing ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
}
