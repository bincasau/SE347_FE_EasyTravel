import React, { useEffect, useRef, useState } from "react";
import {
  FaFilter,
  FaSearch,
  FaSortAmountDownAlt,
  FaSortAmountUpAlt,
} from "react-icons/fa";

import { useSearchParams } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";

import HotelCard from "@/components/pages/Hotel/HotelCard";
import Pagination from "@/utils/Pagination";

import {
  getHotels,
  getHotelProvinces,
  searchHotelsByNameOrAddress,
  searchHotelsByProvince,
} from "@/apis/Hotel";

// Skeleton
const HotelSkeleton = () => (
  <div className="w-full animate-pulse">
    <div className="h-56 bg-gray-300 rounded-2xl mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-10 bg-gray-300 rounded-lg"></div>
  </div>
);

export default function HotelList() {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();

  const hotelsPerPage = 8;

  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortOrder, setSortOrder] = useState(null); // null | "asc" | "desc"
  const [province, setProvince] = useState("");
  const [provinces, setProvinces] = useState([]);

  const [hotels, setHotels] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);

  // desktop dropdown
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // ✅ mobile fullscreen panel
  const [mobilePanel, setMobilePanel] = useState(null); // "filter" | "sort" | null

  // click outside (desktop dropdown)
  useEffect(() => {
    const handleClickOutside = (e) => {
      const inFilter = filterRef.current && filterRef.current.contains(e.target);
      const inSort = sortRef.current && sortRef.current.contains(e.target);
      if (!inFilter && !inSort) {
        setShowFilter(false);
        setShowSort(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // lock scroll on mobile panel
  useEffect(() => {
    document.body.style.overflow = mobilePanel ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobilePanel]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== searchTerm) {
        setDebouncedSearch(searchTerm);
        setPage(1);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sync page from URL when back
  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page")) || 1;
    if (urlPage !== page) setPage(urlPage);
  }, [searchParams]);

  // Load provinces
  useEffect(() => {
    getHotelProvinces().then((data) => setProvinces(data || []));
  }, []);

  // Fetch hotels
  useEffect(() => {
    setIsLoading(true);

    const fetchSort = sortOrder ? `minPrice,${sortOrder}` : undefined;

    const load = async () => {
      let data;

      if (debouncedSearch.trim() !== "") {
        data = await searchHotelsByNameOrAddress(
          debouncedSearch,
          page - 1,
          hotelsPerPage,
          fetchSort
        );
      } else if (province.trim() !== "") {
        data = await searchHotelsByProvince(
          province,
          page - 1,
          hotelsPerPage,
          fetchSort
        );
      } else {
        data = await getHotels({
          page: page - 1,
          size: hotelsPerPage,
          sort: fetchSort,
        });
      }

      setHotels(data._embedded?.hotels || []);
      setTotalPages(data.page?.totalPages || 1);
    };

    load().finally(() => setIsLoading(false));
  }, [page, debouncedSearch, sortOrder, province]);

  // Sync URL
  useEffect(() => {
    if (page === 1) setSearchParams({});
    else setSearchParams({ page });
  }, [page]);

  const onPageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getVisiblePages = () => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const clearAll = () => {
    setProvince("");
    setSortOrder(null);
    setSearchTerm("");
    setDebouncedSearch("");
    setPage(1);
    setShowFilter(false);
    setShowSort(false);
    setMobilePanel(null);
  };

  const activeCount = (province ? 1 : 0) + (sortOrder ? 1 : 0);

  return (
    <div className="bg-gray-50 py-10 sm:py-12 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-30">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-800">
            {t("hotelPage.title")}
          </h2>

          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="hidden sm:inline-flex px-3 py-2 rounded-full bg-orange-100 text-orange-700 text-sm hover:bg-orange-200"
            >
              Clear ({activeCount})
            </button>
          )}
        </div>

        {/* SEARCH + ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 sm:mb-10">
          {/* SEARCH */}
          <div className="flex items-center w-full sm:flex-1 bg-white border border-gray-300 rounded-full px-5 py-2 shadow-sm">
            <input
              type="text"
              placeholder={t("hotelPage.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent"
            />
            <FaSearch size={16} className="text-gray-600" />
          </div>

          {/* ✅ MOBILE: 2 nút to */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            <button
              onClick={() => setMobilePanel("filter")}
              className="bg-white border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2 relative"
            >
              <FaFilter />
              <span className="text-sm">{t("hotelPage.filterByProvince")}</span>
              {province && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-orange-500 text-white grid place-items-center">
                  1
                </span>
              )}
            </button>

            <button
              onClick={() => setMobilePanel("sort")}
              className="bg-white border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2 relative"
            >
              {sortOrder === "asc" ? <FaSortAmountUpAlt /> : <FaSortAmountDownAlt />}
              <span className="text-sm">{t("hotelPage.sortBy")}</span>
              {sortOrder && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-orange-500 text-white grid place-items-center">
                  1
                </span>
              )}
            </button>

            {(province || sortOrder) && (
              <button
                onClick={clearAll}
                className="col-span-2 bg-orange-500 text-white rounded-xl py-2 font-semibold"
              >
                Clear all
              </button>
            )}
          </div>

          {/* DESKTOP: dropdown icons */}
          <div className="hidden sm:flex items-center justify-end gap-2">
            {/* FILTER */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => {
                  setShowFilter(!showFilter);
                  setShowSort(false);
                }}
                className="bg-white border border-gray-300 rounded-xl w-10 h-10 flex justify-center items-center hover:bg-orange-50 relative"
              >
                <FaFilter size={16} />
                {province && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-orange-500 text-white grid place-items-center">
                    1
                  </span>
                )}
              </button>

              {showFilter && (
                <div className="absolute right-0 mt-2 w-72 bg-white border rounded-2xl shadow-xl p-4 z-50 max-h-72 overflow-y-auto">
                  <p className="font-semibold mb-2">
                    {t("hotelPage.filterByProvince")}
                  </p>

                  {["", ...provinces].map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        if (province !== p) {
                          setProvince(p);
                          setPage(1);
                        }
                        setShowFilter(false);
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-xl hover:bg-orange-100 ${
                        province === p ? "bg-orange-200" : ""
                      }`}
                    >
                      {p === "" ? t("hotelPage.allProvinces") : p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SORT */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => {
                  setShowSort(!showSort);
                  setShowFilter(false);
                }}
                className="bg-white border border-gray-300 rounded-xl w-10 h-10 flex justify-center items-center hover:bg-orange-50 relative"
              >
                {sortOrder === "asc" ? (
                  <FaSortAmountUpAlt size={16} />
                ) : (
                  <FaSortAmountDownAlt size={16} />
                )}
                {sortOrder && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-orange-500 text-white grid place-items-center">
                    1
                  </span>
                )}
              </button>

              {showSort && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-2xl shadow-xl p-3 z-50">
                  <p className="font-semibold mb-2">{t("hotelPage.sortBy")}</p>

                  <button
                    className={`block w-full text-left px-3 py-2 rounded-xl hover:bg-orange-100 ${
                      sortOrder === null ? "bg-orange-200" : ""
                    }`}
                    onClick={() => {
                      if (sortOrder !== null) {
                        setSortOrder(null);
                        setPage(1);
                      }
                      setShowSort(false);
                    }}
                  >
                    {t("hotelPage.defaultSort")}
                  </button>

                  <button
                    className={`block w-full text-left px-3 py-2 rounded-xl hover:bg-orange-100 ${
                      sortOrder === "asc" ? "bg-orange-200" : ""
                    }`}
                    onClick={() => {
                      if (sortOrder !== "asc") {
                        setSortOrder("asc");
                        setPage(1);
                      }
                      setShowSort(false);
                    }}
                  >
                    {t("hotelPage.sortAsc")}
                  </button>

                  <button
                    className={`block w-full text-left px-3 py-2 rounded-xl hover:bg-orange-100 ${
                      sortOrder === "desc" ? "bg-orange-200" : ""
                    }`}
                    onClick={() => {
                      if (sortOrder !== "desc") {
                        setSortOrder("desc");
                        setPage(1);
                      }
                      setShowSort(false);
                    }}
                  >
                    {t("hotelPage.sortDesc")}
                  </button>
                </div>
              )}
            </div>

            {(province || sortOrder) && (
              <button
                onClick={clearAll}
                className="px-3 py-2 rounded-full bg-orange-100 text-orange-700 text-sm hover:bg-orange-200"
              >
                Clear ({activeCount})
              </button>
            )}
          </div>
        </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-stretch">
            {Array.from({ length: 8 }).map((_, i) => (
              <HotelSkeleton key={i} />
            ))}
          </div>
        ) : hotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-stretch">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.hotelId}
                hotel_id={hotel.hotelId}
                image={hotel.mainImage}
                name={hotel.name}
                price={hotel.minPrice}
                hotline={hotel.phoneNumber}
                address={hotel.address}
                description={hotel.description}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">{t("hotelPage.noResult")}</p>
        )}

        <Pagination
          totalPages={totalPages}
          currentPage={page}
          visiblePages={getVisiblePages()}
          onPageChange={onPageChange}
        />
      </div>

      {/* ✅ MOBILE FULLSCREEN PANEL */}
      {mobilePanel && (
        <div className="fixed inset-0 z-[80] sm:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobilePanel(null)}
          />
          <div className="absolute inset-x-0 bottom-0 top-16 bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-semibold text-lg">
                {mobilePanel === "filter"
                  ? t("hotelPage.filterByProvince")
                  : t("hotelPage.sortBy")}
              </div>
              <button
                onClick={() => setMobilePanel(null)}
                className="px-3 py-1.5 rounded-full bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1">
              {/* FILTER */}
              {mobilePanel === "filter" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {["", ...provinces].map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setProvince(p);
                          setPage(1);
                        }}
                        className={`py-3 px-2 rounded-2xl border text-sm ${
                          province === p
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-white"
                        }`}
                      >
                        {p === "" ? t("hotelPage.allProvinces") : p}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => setMobilePanel(null)}
                      className="py-3 rounded-2xl bg-orange-500 text-white font-semibold"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => {
                        setProvince("");
                        setPage(1);
                        setMobilePanel(null);
                      }}
                      className="py-3 rounded-2xl bg-gray-200 font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* SORT */}
              {mobilePanel === "sort" && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSortOrder(null);
                      setPage(1);
                      setMobilePanel(null);
                    }}
                    className={`w-full text-left px-4 py-4 rounded-2xl border ${
                      sortOrder === null
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white"
                    }`}
                  >
                    {t("hotelPage.defaultSort")}
                  </button>

                  <button
                    onClick={() => {
                      setSortOrder("asc");
                      setPage(1);
                      setMobilePanel(null);
                    }}
                    className={`w-full text-left px-4 py-4 rounded-2xl border ${
                      sortOrder === "asc"
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white"
                    }`}
                  >
                    {t("hotelPage.sortAsc")}
                  </button>

                  <button
                    onClick={() => {
                      setSortOrder("desc");
                      setPage(1);
                      setMobilePanel(null);
                    }}
                    className={`w-full text-left px-4 py-4 rounded-2xl border ${
                      sortOrder === "desc"
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white"
                    }`}
                  >
                    {t("hotelPage.sortDesc")}
                  </button>

                  <button
                    onClick={clearAll}
                    className="w-full mt-2 py-3 rounded-2xl bg-gray-200 font-semibold"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
