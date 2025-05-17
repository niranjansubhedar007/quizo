// "use client";

// import React, { useEffect, useState } from "react";
// import { supabase } from "../lib/supabase";
// import { useRouter } from "next/navigation";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faEye,
//   faPlus,
//   faArrowLeft,
//   faList,
//   faFileAlt,
//   faPlusCircle,
//   faSearch,
//   faCog,
//   faTrash,
//   faArrowRight,
// } from "@fortawesome/free-solid-svg-icons";
// import Navbar from "../navbar/page";

// const QuizList = () => {
//   const [quizzes, setQuizzes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showList, setShowList] = useState(true); // ✅ toggle state
//   const router = useRouter();
//   const [currentPage, setCurrentPage] = useState(1);
//   const quizzesPerPage = 5; // you can adjust this number
//   const [showModalDelete, setShowModalDelete] = useState(false);
//   const [quizToDelete, setQuizToDelete] = useState(null);

//   const [activeTab, setActiveTab] = useState("list"); // 'list' | 'reports' | others
//   const [categories, setCategories] = useState([]);

//   useEffect(() => {
//     const fetchQuizzes = async () => {
//       const { data, error } = await supabase.from("Quiz").select("*");
//       if (error) {
//         console.error("Error fetching quizzes:", error);
//       } else {
//         setQuizzes(data);
//       }
//       setLoading(false);
//     };
//     fetchQuizzes();
//   }, []);
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);

//       const [quizRes, catRes] = await Promise.all([
//         supabase.from("Quiz").select("*"),
//         supabase.from("Category").select("id, category_name"),
//       ]);

//       if (quizRes.error || catRes.error) {
//         console.error("Error fetching data", quizRes.error || catRes.error);
//       } else {
//         setQuizzes(quizRes.data);
//         setCategories(catRes.data);
//       }

//       setLoading(false);
//     };

//     fetchData();
//   }, []);
//   const getCategoryName = (categoryId) => {
//     const category = categories.find((c) => c.id === categoryId);
//     return category ? category.category_name : "Unknown";
//   };

//   const toggleQuizForm = () => {
//     router.push("/quiz");
//   };

//   const handleQuizSelect = (quiz) => {
//     router.push(`/quiz?id=${quiz.id}`);
//   };

//   const filteredQuizzes = quizzes.filter((quiz) =>
//     quiz.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//   const handleDeleteQuiz = async (quizId) => {
//     const { error } = await supabase.from("Quiz").delete().eq("id", quizId);
// setShowModalDelete(false)
//     if (error) {
//       console.error("Error deleting quiz:", error);
//       alert("Failed to delete quiz.");
//     } else {
//       setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
//       // alert("Quiz deleted successfully.");
//     }
//   };
//   const indexOfLastQuiz = currentPage * quizzesPerPage;
//   const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
//   const currentQuizzes = filteredQuizzes.slice(
//     indexOfFirstQuiz,
//     indexOfLastQuiz
//   );
//   const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage((prev) => prev - 1);
//   };

//   // return (
//   //   <>
//   //     <div className="min-h-screen bg-gradient-to-br from-[#583D72] to-[#583D72]">
//   //       <div className="w-52 bg-[#583D72] border-r-1  border-[#FF8474] text-white p-4 shadow-lg md:fixed md:h-screen md:overflow-y-auto">
//   //         <div className="flex flex-col h-full pt-5 pl-2">
//   //           <div className="space-y-4 text-lg">
//   //             <div
//   //               className={`flex items-center gap-7 cursor-pointer transition ${
//   //                 activeTab === "list"
//   //                   ? "text-[#FF8474] "
//   //                   : "text-white hover:text-[#FF8474]"
//   //               }`}
//   //               onClick={() => {
//   //                 setShowList(true);
//   //                 setActiveTab("list");
//   //               }}
//   //             >
//   //               <FontAwesomeIcon icon={faList} />
//   //               <span>Quiz List</span>
//   //             </div>

//   //             {/* <div
//   //               className={`flex items-center gap-7  ml-1 cursor-pointer transition ${
//   //                 activeTab === "reports"
//   //                   ? "text-[#FF8474] "
//   //                   : "text-white hover:text-[#FF8474]"
//   //               }`}

//   //             >
//   //               <FontAwesomeIcon icon={faFileAlt} />
//   //               <span>Reports</span>
//   //             </div> */}
//   //           </div>

//   //           <div className="mt-auto text-center text-sm text-[#ddd] pt-10">
//   //             © 2025 Quiz App
//   //           </div>
//   //         </div>
//   //       </div>

//   //       <div className="ml-68 max-w-5xl space-y-0 justify-center align-middle  pt-15 pb-10 px-4">
//   //         <div className="flex justify-between items-center mb-8">
//   //           <h1 className="text-3xl font-bold text-white">Quiz List</h1>
//   //           <div>
//   //             <input
//   //               type="text"
//   //               placeholder="Search quizzes..."
//   //               value={searchTerm}
//   //               onChange={(e) => setSearchTerm(e.target.value)}
//   //               className="w-48 mr-5 p-3 rounded-lg border border-white/30 bg-white/20 placeholder-white text-white focus:outline-none"
//   //             />
//   //             <button
//   //               className="px-6 py-3 bg-[#FF8474] text-white rounded-lg hover:bg-[#FFC996]"
//   //               onClick={toggleQuizForm}
//   //             >
//   //               Create New Quiz
//   //             </button>
//   //           </div>
//   //         </div>

//   //         {loading ? (
//   //           <div className="flex justify-center items-center h-64">
//   //             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFC996]"></div>
//   //           </div>
//   //         ) : currentQuizzes.length === 0 ? (
//   //           <div className="text-center py-20 mt-20 text-white">
//   //             <h3 className="text-lg font-medium">No quizzes found</h3>
//   //             <p className="text-[#FFC996]">Try a different search or add new quiz.</p>
//   //           </div>
//   //         ) : showList ? (
//   //           // ✅ List view
//   //           <>
//   //             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20 ">
//   //               <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
//   //                 <table className="w-full text-left text-white">
//   //                   <thead className="text-white/80 border-b border-white/20">
//   //                     <tr>
//   //                       <th className="p-3">SR</th>
//   //                       <th className="p-3">Name</th>
//   //                       <th className="p-3">Category</th>
//   //                       <th className="p-3">Tags</th>
//   //                       <th className="p-3">Action</th>
//   //                     </tr>
//   //                   </thead>
//   //                   <tbody>
//   //                     {currentQuizzes.map((quiz, index) => (
//   //                       <tr
//   //                         key={quiz.id}
//   //                         className="border-b border-white/10 hover:bg-white/10"
//   //                       >
//   //                         <td className="p-3">
//   //                           {indexOfFirstQuiz + index + 1}
//   //                         </td>
//   //                         <td className="p-3">{quiz.name}</td>
//   //                         <td className="p-3">
//   //                           {getCategoryName(quiz.category)}
//   //                         </td>

//   //                         <td className="p-3">{quiz.tags}</td>
//   //                         <td className="p-3">
//   //                           <button
//   //                             onClick={() => handleQuizSelect(quiz)}
//   //                             className="text-sm px-3 py-2 bg-white/10 backdrop-blur-smtext-[#fff] rounded-lg   hover:bg-[#583D72] cursor-pointer"
//   //                           >
//   //                             <FontAwesomeIcon icon={faEye} />
//   //                           </button>
//   //                           <button
//   //                             onClick={() => handleDeleteQuiz(quiz.id)}
//   //                             className="text-sm px-3 py-2 ml-2 bg-white/10 backdrop-blur-sm text-[#fff] rounded-lg hover:bg-[#583D72] cursor-pointer"
//   //                           >
//   //                             <FontAwesomeIcon icon={faTrash} />
//   //                           </button>
//   //                         </td>
//   //                       </tr>
//   //                     ))}
//   //                   </tbody>
//   //                 </table>
//   //               </div>
//   //             </div>
//   //             <div className="flex justify-between mt-4 space-x-4">
//   //               <button
//   //                 onClick={handlePrevPage}
//   //                 disabled={currentPage === 1}
//   //                 className="px-4 py-2 bg-white/20 text-white rounded hover:bg-white/30 disabled:opacity-50"
//   //               >
//   //                 <FontAwesomeIcon icon={faArrowLeft} />
//   //               </button>
//   //               <span className="text-white px-2 py-2">
//   //                 Page {currentPage} of {totalPages}
//   //               </span>
//   //               <button
//   //                 onClick={handleNextPage}
//   //                 disabled={currentPage === totalPages}
//   //                 className="px-4 py-2 bg-white/20 text-white rounded hover:bg-white/30 disabled:opacity-50"
//   //               >
//   //                 <FontAwesomeIcon icon={faArrowRight} />
//   //               </button>
//   //             </div>
//   //           </>
//   //         ) : (
//   //           // Default card view
//   //           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"></div>
//   //         )}
//   //       </div>
//   //     </div>
//   //   </>
//   // );
//   return (
//     <>
//     <Navbar/>
//     <div className=" flex mt-15 min-h-screen">
//       {/* Sidebar */}
//       <div className="w-64 bg-[#583D72] border-r border-[#FF8474] text-white p-4 shadow-lg overflow-y-auto">
//         <div className="flex flex-col h-full pt-5">
//           <div className="space-y-6">
//             <div
//               className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition ${
//                 activeTab === "list"
//                   ? "bg-white/10 text-[#FF8474]"
//                   : "text-white hover:bg-white/10 hover:text-[#FF8474]"
//               }`}
//               onClick={() => {
//                 setShowList(true);
//                 setActiveTab("list");
//               }}
//             >
//               <FontAwesomeIcon icon={faList} className="w-5 h-5" />
//               <span className="font-medium">Quiz List</span>
//             </div>
//           </div>

//           <div className="mt-auto text-center text-sm text-white/70 pt-10 pb-4">
//             © 2025 Quiz App
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1   p-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//             <h1 className="text-3xl font-bold text-white">Quiz List</h1>

//             <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
//               <input
//                 type="text"
//                 placeholder="Search quizzes..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="flex-1 min-w-[200px] p-3 rounded-lg border border-white/30 bg-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-[#FF8474]"
//               />
//               <button
//                 className="px-6 py-3 bg-[#FF8474] text-white rounded-lg hover:bg-[#e67363] transition-colors font-medium whitespace-nowrap"
//                 onClick={toggleQuizForm}
//               >
//                 Create New Quiz
//               </button>
//             </div>
//           </div>

//           {/* Content */}
//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFC996]"></div>
//             </div>
//           ) : currentQuizzes.length === 0 ? (
//             <div className="text-center py-20 text-white bg-white/10 rounded-xl">
//               <h3 className="text-xl font-medium mb-2">No quizzes found</h3>
//               <p className="text-[#FFC996]">
//                 Try a different search or add a new quiz.
//               </p>
//             </div>
//           ) : showList ? (
//             <>
//               {/* Table View */}
//               <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-white/20">
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-left">
//                     <thead className="bg-white/10">
//                       <tr>
//                         <th className="p-4 font-medium text-white/80">SR</th>
//                         <th className="p-4 font-medium text-white/80">Name</th>
//                         <th className="p-4 w-[20%] font-medium text-white/80">
//                           Category
//                         </th>
//                         <th className="p-4 font-medium text-white/80">Tags</th>
//                         <th className="p-4 font-medium text-white/80 text-right">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {currentQuizzes.map((quiz, index) => (
//                         <tr
//                           key={quiz.id}
//                           className="border-t border-white/10 hover:bg-white/10 transition-colors"
//                         >
//                           <td className="p-4 text-white">
//                             {indexOfFirstQuiz + index + 1}
//                           </td>
//                           <td className="p-4 text-white">
//                             {quiz.name}
//                           </td>
//                           <td className="p-4 text-white">
//                             {getCategoryName(quiz.category)}
//                           </td>
//                           <td className="p-4 text-white">
//                             <div className="flex flex-wrap gap-1">
//                               {quiz.tags.split(",").map((tag, i) => (
//                                 <span
//                                   key={i}
//                                   className=""
//                                 >
//                                   {tag.trim()}
//                                 </span>
//                               ))}
//                             </div>
//                           </td>
//                           <td className="p-4 text-right">
//                             <div className="flex justify-end gap-3">
//                               <button
//                                 onClick={() => handleQuizSelect(quiz)}
//                                 className="p-2 bg-white/10 text-white rounded-lg hover:bg-[#8E4E75]   transition-colors"
//                                 title="View"
//                               >
//                                 <FontAwesomeIcon
//                                   icon={faEye}
//                                   className="w-4 h-4"
//                                 />
//                               </button>
//                               <button
//                                 onClick={() => {
//                                   setQuizToDelete(quiz);
//                                   setShowModalDelete(true);
//                                 }}
//                                 className="p-2 bg-white/10 text-white rounded-lg hover:bg-[#8E4E75] transition-colors"
//                                 title="Delete"
//                               >
//                                 <FontAwesomeIcon
//                                   icon={faTrash}
//                                   className="w-4 h-4"
//                                 />
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//               {showModalDelete && (
//                 <div className="fixed inset-0 z-50 bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
//                   <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
//                     <h2 className="text-lg mb-4 text-center">
//                       Are you sure you want to delete the quiz{" "}
//                       <span className="font-semibold text-[#FF8474]">
//                         {quizToDelete?.name}
//                       </span>
//                       ?
//                     </h2>

//                     <div className="flex justify-center gap-4">
//                       <button
//                         onClick={() => handleDeleteQuiz(quizToDelete.id)}
//                         className="bg-[#9F5F80] px-5 py-2 rounded hover:bg-[#8E4E75] text-white"
//                       >
//                         Ok
//                       </button>
//                       <button
//                         onClick={() => setShowModalDelete(false)}
//                         className="bg-gray-300 px-5 py-2 rounded hover:bg-gray-400"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="flex justify-between items-center mt-6">
//                 <button
//                   onClick={handlePrevPage}
//                   disabled={currentPage === 1}
//                   className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
//                     currentPage === 1
//                       ? "bg-white/10 text-white/50 cursor-not-allowed"
//                       : "bg-white/20 text-white hover:bg-white/30"
//                   }`}
//                 >
//                   <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
//                 </button>

//                 <span className="text-white/80">
//                   Page {currentPage} of {totalPages}
//                 </span>

//                 <button
//                   onClick={handleNextPage}
//                   disabled={currentPage === totalPages}
//                   className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
//                     currentPage === totalPages
//                       ? "bg-white/10 text-white/50 cursor-not-allowed"
//                       : "bg-white/20 text-white hover:bg-white/30"
//                   }`}
//                 >
//                   <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
//                 </button>
//               </div>
//             </>
//           ) : (
//             // Default card view (if needed)
//             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"></div>
//           )}
//         </div>
//       </div>
//     </div>
//     </>
//   );
// };

// export default QuizList;

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
  faPencilAlt,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import Navbar from "../navbar/page";

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showList, setShowList] = useState(true);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const quizzesPerPage = 5;
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [categories, setCategories] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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
      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.category_name : "Uncategorized";
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
    try {
      const { error } = await supabase.from("Quiz").delete().eq("id", quizId);
      if (error) throw error;
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (error) {
      console.error("Error deleting quiz:", error);
    } finally {
      setShowModalDelete(false);
    }
  };

  // Pagination logic
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className=" mt-15 bg-gradient-to-b from-[#2D1B42] to-[#1E1030] text-white">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#3A2258] border-r border-[#FF8474]/20 hidden md:block min-h-[calc(100vh-65px)]">
          <div className="p-6 h-full flex flex-col">
            <div className="space-y-2">
              <button
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  activeTab === "list"
                    ? "bg-[#FF8474] text-white shadow-md"
                    : "text-[#D1C4E9] hover:bg-[#4A2D73]"
                }`}
                onClick={() => setActiveTab("list")}
              >
                <FontAwesomeIcon icon={faList} className="w-5 h-5" />
                <span className="font-medium">Quiz List</span>
              </button>
            </div>

            <div className="mt-auto pt-8">
              <div className="text-xs text-[#D1C4E9]/50 text-center">
                © 2025 QuizMaster Pro
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Quiz Dashboard
                </h1>
                <p className="text-[#D1C4E9]/80 mt-1">
                  {filteredQuizzes.length} quizzes available
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-1 min-w-[200px]">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#D1C4E9]/50"
                  />
                  <input
                    type="text"
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#4A2D73] bg-[#3A2258] placeholder-[#D1C4E9]/50 text-white focus:outline-none focus:ring-2 focus:ring-[#FF8474]"
                  />
                </div>
                <button
                  className="px-6 py-3 bg-gradient-to-r bg-[#FF8474] text-white  hover:bg-[#FF8474] rounded-lg hover:opacity-90 transition-all font-medium whitespace-nowrap flex items-center gap-2 justify-center"
                  onClick={toggleQuizForm}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Create Quiz</span>
                </button>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFC996]"></div>
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="text-center py-16 bg-[#3A2258]/50 rounded-xl border border-dashed border-[#4A2D73]">
                <div className="mx-auto w-16 h-16 bg-[#4A2D73] rounded-full flex items-center justify-center mb-4">
                  <FontAwesomeIcon
                    icon={faFileAlt}
                    className="text-2xl text-[#FF8474]"
                  />
                </div>
                <h3 className="text-xl font-medium mb-2">No quizzes found</h3>
                <p className="text-[#D1C4E9]/70 mb-4">
                  {searchTerm
                    ? "Try a different search"
                    : "Create your first quiz"}
                </p>
            
              </div>
            ) : (
              <>
                {/* Table View */}
                <div className="bg-[#3A2258]/50 backdrop-blur-sm rounded-xl overflow-hidden border border-[#4A2D73] shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#4A2D73]">
                        <tr>
                          <th className="p-4 font-medium text-left">#</th>
                          <th className="p-4 font-medium text-left">
                            Quiz Name
                          </th>
                          <th className="p-4 font-medium text-left">
                            Category
                          </th>
                          <th className="p-4 font-medium text-left">Tags</th>
                          <th className="p-4 font-medium text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentQuizzes.map((quiz, index) => (
                          <tr
                            key={quiz.id}
                            className="border-t border-[#4A2D73]/50 hover:bg-[#4A2D73]/30 transition-colors"
                          >
                            <td className="p-4 text-[#D1C4E9]">
                              {indexOfFirstQuiz + index + 1}
                            </td>
                            <td className="p-4 font-medium">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="font-medium">{quiz.name}</div>
                                  <div className="text-xs text-[#D1C4E9]/60">
                                    Created:{" "}
                                    {new Date(
                                      quiz.created_at
                                    ).toLocaleDateString("en-GB")}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-3 py-1.5 bg-[#FF8474]/10 text-[#FF8474] rounded-full text-sm">
                                {getCategoryName(quiz.category)}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-2">
                                {quiz.tags?.split(",").map((tag, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1.5 bg-[#4A2D73] text-[#D1C4E9] rounded-full text-xs"
                                  >
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleQuizSelect(quiz)}
                                  className="p-2 text-[#D1C4E9] hover:text-white hover:bg-[#FF8474]/20 rounded-lg transition-colors"
                                  title="View"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>
                                <button
                                  onClick={() => {
                                    setQuizToDelete(quiz);
                                    setShowModalDelete(true);
                                  }}
                                  className="p-2 text-[#D1C4E9] hover:text-white hover:bg-[#FF8474]/20 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                  <div className="text-sm text-[#D1C4E9]/70">
                    Showing {indexOfFirstQuiz + 1} to{" "}
                    {Math.min(indexOfLastQuiz, filteredQuizzes.length)} of{" "}
                    {filteredQuizzes.length} quizzes
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${
                        currentPage === 1
                          ? "text-[#4A2D73] cursor-not-allowed"
                          : "text-[#D1C4E9] hover:bg-[#4A2D73]"
                      }`}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>

                    <div className="flex gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                currentPage === pageNum
                                  ? "bg-[#FF8474] text-white"
                                  : "text-[#D1C4E9] hover:bg-[#4A2D73]"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${
                        currentPage === totalPages
                          ? "text-[#4A2D73] cursor-not-allowed"
                          : "text-[#D1C4E9] hover:bg-[#4A2D73]"
                      }`}
                    >
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModalDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#3A2258] rounded-xl shadow-2xl border border-[#4A2D73] max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#FF8474]/10 mb-4">
                <FontAwesomeIcon icon={faTrash} className="text-[#FF8474]" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                Delete "{quizToDelete?.name}"?
              </h3>
              <p className="text-[#D1C4E9]/70 mb-6">
                This action cannot be undone. All questions in this quiz will be
                permanently removed.
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowModalDelete(false)}
                  className="px-6 py-2 border border-[#4A2D73] text-[#D1C4E9] rounded-lg hover:bg-[#4A2D73] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteQuiz(quizToDelete.id)}
                  className="px-6 py-2 bg-[#FF8474] text-white rounded-lg hover:bg-[#E67363] transition-colors"
                >
                  Delete Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizList;
