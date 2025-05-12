"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

import {

  faBell,
  faTimes,
  faBarsProgress,
  faCircleInfo,
  faFileInvoiceDollar,
  faSignOut,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
// import {
//   GoogleOAuthProvider,
//   GoogleLogin,
//   googleLogout,
// } from "@react-oauth/google";
const Sidebar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);
  const [isTableMasterDropdownOpen, setIsTableMasterDropdownOpen] =
    useState(false); //1//
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false); //2//
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [isBarMenuDropdownOpen, setIsBarMenuDropdownOpen] = useState(false); //2//
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0); // State for item count
  const [isGstDropdownOpen, setIsGstDropdownOpen] = useState(false); //3//
  const [isVatDropdownOpen, setIsVatDropdownOpen] = useState(false); //3//
  const [showAll, setShowAll] = useState(false);
  const itemsToShow = showAll ? items : items.slice(0, 9); // Adjust the number 5 to the number of items you want to show initially
  const [isItemMasterDropdownOpen, setIsItemMasterDropdownOpen] =
    useState(false);
  const [isVendorMasterDropdownOpen, setIsVendorMasterDropdownOpen] =
    useState(false);
  const [hotelInfo, setHotelInfo] = useState([]); // New state for hotel information

  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isMasterDropdownOpen, setIsMasterDropdownOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [userRole, setUserRole] = useState("");

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", JSON.stringify(newSidebarState));
  
    // ✅ Force an update across components without needing reload
    window.dispatchEvent(new Event("storage"));
  };
  
  useEffect(() => {
    const storedSidebarState = localStorage.getItem("isSidebarOpen");
    if (storedSidebarState !== null) {
      setIsSidebarOpen(JSON.parse(storedSidebarState));
    }
  }, []);
  

  useEffect(() => {
    if (!isModalOpen) {
      setShowAll(false); // Reset showAll state when modal is closed
    }
  }, [isModalOpen]);

  useEffect(() => {
    // Function to handle clicks outside of the dropdown list
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Click occurred outside of the dropdown, so close it
        setIsMasterDropdownOpen(false);
      }
    };

    // Add event listener to handle clicks outside of the dropdown list
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Clean up event listener when component unmounts
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);




  const closeTableMasterDropdown = () => {
    setIsTableMasterDropdownOpen(false);
  };




  const closePurchaseDropdown = () => {
    setIsMenuDropdownOpen(false);
    setIsBarMenuDropdownOpen(false);
  };


  const closeExpensesDropdown = () => {
    setIsGstDropdownOpen(false);
    setIsVatDropdownOpen(false);
  };



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isTableMasterDropdownOpen ||
        isMenuDropdownOpen ||
        isBarMenuDropdownOpen ||
        isGstDropdownOpen ||
        isVatDropdownOpen ||
        isItemMasterDropdownOpen ||
        isVendorMasterDropdownOpen
      ) {
        const navbar = document.getElementById("navbar");
        if (navbar && !navbar.contains(event.target)) {
          closeTableMasterDropdown();
          closePurchaseDropdown();
          closeExpensesDropdown();
          setIsItemMasterDropdownOpen();
          setIsVendorMasterDropdownOpen();
        }
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [
    isTableMasterDropdownOpen,
    isMenuDropdownOpen,
    isBarMenuDropdownOpen,
    isGstDropdownOpen,
    isVatDropdownOpen,
    isItemMasterDropdownOpen,
    isVendorMasterDropdownOpen,
  ]);


  const handleLogout = async () => {
    localStorage.removeItem("@token");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    localStorage.removeItem("waiter");
    localStorage.removeItem("admin");
    localStorage.removeItem("captain");
    // googleLogout(); // Clear Google Sign-In session

    router.push("/"); // Navigate to home on confirmation
  };
  return (
    <>
      <div>
        <aside
          id="logo-sidebar"
          className={`fixed top-0  left-0 z-40 py-10    h-screen transition-transform  border-r  sm:translate-x-0 ${
            isSidebarOpen ? "w-48" : "w-10"
          }`}
          style={{ backgroundColor: process.env.NEXT_PUBLIC_FIRST_COLOR }}
          aria-label="Sidebar"
        >
          <div
            className="h-full flex flex-col  pb-4    "
            style={{ backgroundColor: process.env.NEXT_PUBLIC_FIRST_COLOR }}
          >
            <div className="relative">
              <button
                onClick={toggleSidebar}
                className="mb-4 text-[#0c0c0c]  focus:outline-none px-2  float-right lg:-mt-5 md:-mt-5 -mt-4"
              >
                <FontAwesomeIcon
                  icon={isSidebarOpen ? faTimes : faBarsProgress}
                  size="lg"
                  className=""
                />
              </button>
            </div>
            <div className={`group inline-block w-full  ${
                isSidebarOpen ? "hover:bg-white" : ""
              }   `}>
              <Link href="/order">
                <button
                  className="outline-none focus:outline-none px-3 py-1  flex items-center "
                  style={{ color: process.env.NEXT_PUBLIC_THIRD_COLOR }}
                >
                  <FontAwesomeIcon
                    icon={faBell}
                    size="lg"
                    style={{ color: process.env.NEXT_PUBLIC_THIRD_COLOR }}
                  />
                  <span className="pr-1 font-semibold flex-1 ml-4">
                    {isSidebarOpen ? "Order" : ""}
                  </span>
                </button>
              </Link>
            </div>
            <div className={`group inline-block w-full mt-4 ${
                isSidebarOpen ? "hover:bg-white" : ""
              }   `}>
              <Link href="/addTag">
                <button
                  className="outline-none focus:outline-none px-3 py-1  flex items-center "
                  style={{ color: process.env.NEXT_PUBLIC_THIRD_COLOR }}
                >
                  <FontAwesomeIcon
                    icon={faTags}
                    size="lg"
                    style={{ color: process.env.NEXT_PUBLIC_THIRD_COLOR }}
                  />
                  <span className="pr-1 font-semibold flex-1 ml-3">
                    {isSidebarOpen ? "Add Tag" : ""}
                  </span>
                </button>
              </Link>
            </div>
            <div className={`mt-4 group  ${
                isSidebarOpen ? "hover:bg-white" : ""
              }   inline-block w-full`}>
              <Link href="/adminBillOrder">
                <button
                  className="outline-none focus:outline-none px-3 py-1  flex items-center "
                  style={{ color: process.env.NEXT_PUBLIC_THIRD_COLOR }}
                >
                  <FontAwesomeIcon
                    icon={faFileInvoiceDollar}
                    size="lg"
                    style={{ color: process.env.NEXT_PUBLIC_THIRD_COLOR }}
                  />
                  <span className="pr-1 font-semibold flex-1 ml-4">
                    {isSidebarOpen ? "Billing" : ""}
                  </span>
                </button>
              </Link>
            </div>
            <div
              className={`relative group inline-block mt-4 ${
                isSidebarOpen ? "hover:bg-white" : ""
              } z-20`}
            >
              <button
                className="outline-none focus:outline-none px-3 py-1  flex items-center "
                style={{ color: process.env.NEXT_PUBLIC_THIRD_COLOR }}
              >
                <FontAwesomeIcon
                  icon={faCircleInfo}
                  size="lg"
                  style={{ color: process.env.NEXT_PUBLIC_THIRD_COLOR }}
                />

                <span className="pr-1 font-semibold flex-1 ml-3 ">
                  {isSidebarOpen ? "Reports" : ""}
                </span>
                {isSidebarOpen ? (
                  <span>
                    <svg
                      className="fill-current h-4 w-4  absolute right-5 top-2 transform group-hover:-rotate-180 transition duration-150 ease-in-out"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </span>
                ) : (
                  ""
                )}
              </button>
              {isSidebarOpen && (
                <ul
                  className="border border-gray-400 rounded-md transform scale-0 group-hover:scale-100 absolute transition duration-150 ease-in-out origin-top min-w-32 "
                  style={{
                    backgroundColor: process.env.NEXT_PUBLIC_FIRST_COLOR,
                  }}
                >
                  <li className=" px-1 py-1 whitespace-nowrap  hover:bg-[#a3dfcb] ">
                    <Link href="/cancelKot">
                      <button className="outline-none  focus:outline-none px-3 py-1  flex items-center text-black ">
                        <span className="pr-1 flex-1 text-black font-semibold">
                          Cancel Report
                        </span>
                      </button>
                    </Link>
                  </li>
                  <li className=" px-1 py-1 hover:bg-[#a3dfcb] whitespace-nowrap">
                    <Link href="/dailyMenuReport">
                      <button className="outline-none focus:outline-none px-3 py-1  flex items-center text-black border-t">
                        <span className="pr-1 flex-1  text-black font-semibold">
                          Daily Menu Report
                        </span>
                      </button>
                    </Link>
                  </li>
                  <li className=" px-1 py-1 hover:bg-[#a3dfcb] whitespace-nowrap">
                    <Link href="/dailyGstReport">
                      <button className="outline-none focus:outline-none px-3 py-1  flex items-center text-black border-t">
                        <span className="pr-1 flex-1  text-black font-semibold">
                          Daily GST Report
                        </span>
                      </button>
                    </Link>
                  </li>
                  {/* <li className=" px-1 py-1 hover:bg-[#a3dfcb] whitespace-nowrap">
                    <Link href="/setting">
                      <button className="outline-none focus:outline-none px-3 py-1  flex items-center text-black border-t">
                        <span className="pr-1 flex-1  text-black font-semibold">
                          Setting
                        </span>
                      </button>
                    </Link>
                  </li>
                  <li className=" px-1 py-1 hover:bg-[#a3dfcb] whitespace-nowrap">
                    <Link href="/settingIp">
                      <button className="outline-none focus:outline-none px-3 py-1  flex items-center text-black border-t">
                        <span className="pr-1 flex-1  text-black font-semibold">
                          Setting IP
                        </span>
                      </button>
                    </Link>
                  </li> */}
                </ul>
              )}
            </div>

            {/* <div
              className={`mt-2 group inline-block w-full  ${
                isSidebarOpen ? "hover:bg-white" : ""
              } relative z-10`}
            >
              <button
                className="outline-none focus:outline-none px-3 py-1  flex items-center  "
                style={{ color: process.env.NEXT_PUBLIC_THIRD_COLOR }}
              >
                <FontAwesomeIcon
                  icon={faPaste}
                  size="lg"
                  style={{ color: process.env.NEXT_PUBLIC_THIRD_COLOR }}
                />

                <span className="pr-1 font-semibold flex-1 ml-3 ">
                  {isSidebarOpen ? "Material Entry" : ""}
                </span>
                {isSidebarOpen ? (
                  <span>
                    <svg
                      className="fill-current h-4 w-4  absolute right-5 top-2 transform group-hover:-rotate-180 transition duration-150 ease-in-out"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </span>
                ) : (
                  ""
                )}
              </button>
              {isSidebarOpen && (
                <ul
                  className=" border border-gray-400 w-48 rounded-md transform scale-0 group-hover:scale-100 absolute transition duration-150 ease-in-out origin-top min-w-32"
                  style={{
                    backgroundColor: process.env.NEXT_PUBLIC_FIRST_COLOR,
                  }}
                >
                  <li className=" px-3 py-1 hover:bg-[#a3dfcb]">
                    <Link href="/purchase">
                      <button className="outline-none focus:outline-none px-1 py-1  flex items-center text-black border-t">
                        <span className="pr-1 flex-1 text-black font-semibold whitespace-nowrap">
                          Purchase (Resto)
                        </span>
                      </button>
                    </Link>
                  </li>

                  {userRole === "adminBar" && (
                    <li className=" px-3 py-1 hover:bg-[#a3dfcb]">
                      <Link href="/barPurchase">
                        <button className="outline-none focus:outline-none px-1 py-1  flex items-center text-black border-t">
                          <span className="pr-1 flex-1 text-black font-semibold">
                            Purchase (Bar)
                          </span>
                        </button>
                      </Link>
                    </li>
                  )}

                  <li className=" relative px-3 py-1 hover:bg-[#a3dfcb]">
                    <Link href="/stockOut">
                      <button className="outline-none focus:outline-none px-1 py-1  flex items-center text-black border-t">
                        <span className="pr-1 flex-1 text-black font-semibold whitespace-nowrap">
                          Stockoutward (Resto)
                        </span>
                      </button>
                    </Link>
                  </li>
                </ul>
              )}
            </div> */}
            <div className={`mt-2 group  ${
                isSidebarOpen ? "hover:bg-white" : ""
              }   inline-block w-full bottom-3 absolute`}
              onClick={handleLogout}
              
              >
                <button
                  className="outline-none focus:outline-none px-3 py-1  flex items-center "
                  style={{ color: process.env.NEXT_PUBLIC_THIRD_COLOR }}
                >
                  <FontAwesomeIcon
                    icon={faSignOut}
                    size="lg"
                    style={{ color: process.env.NEXT_PUBLIC_THIRD_COLOR }}
                  />
                  <span className="pr-1 font-semibold flex-1 ml-3">
                    {isSidebarOpen ? "Logout" : ""}
                  </span>
                </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;