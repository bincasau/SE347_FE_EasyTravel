import React, { useEffect, useState } from "react";
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

  const [sortOrder, setSortOrder] = useState(null);
  const [province, setProvince] = useState("");
  const [provinces, setProvinces] = useState([]);

  const [hotels, setHotels] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch provinces
  useEffect(() => {
    getHotelProvinces().then((data) => setProvinces(data || []));
  }, []);

  // ======================= FIXED FETCH HOTELS ======================= //
  useEffect(() => {
    setIsLoading(true);

    const fetchSort = sortOrder ? `minPrice,${sortOrder}` : undefined;

    const fetchData = async () => {
      let data;

      // Search by name/address
      if (debouncedSearch.trim() !== "") {
        data = await searchHotelsByNameOrAddress(
          debouncedSearch,
          page - 1,
          hotelsPerPage,
          fetchSort
        );
        setHotels(data._embedded?.hotels || []);
        setTotalPages(data.page?.totalPages || 1);
        return;
      }

      // Filter by province
      if (province.trim() !== "") {
        data = await searchHotelsByProvince(
          province,
          page - 1,
          hotelsPerPage,
          fetchSort
        );
        setHotels(data._embedded?.hotels || []);
        setTotalPages(data.page?.totalPages || 1);
        return;
      }

      // Default
      data = await getHotels({
        page: page - 1,
        size: hotelsPerPage,
        sort: fetchSort,
      });

      setHotels(data._embedded?.hotels || []);
      setTotalPages(data.page?.totalPages || 1);
    };

    fetchData().finally(() => setIsLoading(false));
  }, [page, debouncedSearch, sortOrder, province]);
  // ================================================================= //

  // sync url
  useEffect(() => {
    if (page === 1) setSearchParams({});
    else setSearchParams({ page });
  }, [page]);

  const toggleSortOrder = () => {
    if (!sortOrder) setSortOrder("asc");
    else setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setPage(1);
  };

  const getVisiblePages = () => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const onPageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-gray-50 py-12 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 relative z-30">
        <h2 className="text-4xl font-podcast text-gray-800 mb-6">
          {t("hotelPage.title")}
        </h2>

        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-3 mb-10">
          <div className="flex items-center flex-1 bg-white border border-gray-300 rounded-full px-5 py-2 shadow-sm">
            <input
              type="text"
              placeholder={t("hotelPage.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-sm outline-none"
            />
            <FaSearch size={16} className="text-gray-600" />
          </div>

          {/* Filter Province */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilter(!showFilter);
                setShowSort(false);
              }}
              className="bg-white border border-gray-300 rounded-lg w-10 h-10 flex justify-center items-center hover:bg-orange-50"
            >
              <FaFilter size={16} />
            </button>

            {showFilter && (
              <div className="absolute right-0 mt-2 w-60 bg-white border rounded-lg shadow-lg p-4">
                <p className="font-semibold mb-2">
                  {t("hotelPage.filterByProvince")}
                </p>

                {["", ...provinces].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setProvince(p);
                      setPage(1);
                      setShowFilter(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 rounded hover:bg-orange-100 ${
                      province === p ? "bg-orange-200" : ""
                    }`}
                  >
                    {p === "" ? t("hotelPage.allProvinces") : p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSort(!showSort);
                setShowFilter(false);
              }}
              className="bg-white border border-gray-300 rounded-lg w-10 h-10 flex justify-center items-center hover:bg-orange-50"
            >
              {sortOrder === "asc" ? (
                <FaSortAmountUpAlt size={16} />
              ) : (
                <FaSortAmountDownAlt size={16} />
              )}
            </button>

            {showSort && (
              <div className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg p-3">
                <p className="font-semibold mb-2">{t("hotelPage.sortBy")}</p>

                <button
                  className={`block w-full text-left px-3 py-1.5 rounded hover:bg-orange-100 ${
                    sortOrder === null ? "bg-orange-200" : ""
                  }`}
                  onClick={() => {
                    setSortOrder(null);
                    setPage(1);
                    setShowSort(false);
                  }}
                >
                  {t("hotelPage.defaultSort")}
                </button>

                <button
                  className={`block w-full text-left px-3 py-1.5 rounded hover:bg-orange-100 ${
                    sortOrder === "asc" ? "bg-orange-200" : ""
                  }`}
                  onClick={() => {
                    setSortOrder("asc");
                    setPage(1);
                    setShowSort(false);
                  }}
                >
                  {t("hotelPage.sortAsc")}
                </button>

                <button
                  className={`block w-full text-left px-3 py-1.5 rounded hover:bg-orange-100 ${
                    sortOrder === "desc" ? "bg-orange-200" : ""
                  }`}
                  onClick={() => {
                    setSortOrder("desc");
                    setPage(1);
                    setShowSort(false);
                  }}
                >
                  {t("hotelPage.sortDesc")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <HotelSkeleton key={i} />
            ))}
          </div>
        ) : hotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
          <p className="text-center text-gray-500 mt-10">
            {t("hotelPage.noResult")}
          </p>
        )}

        <Pagination
          totalPages={totalPages}
          currentPage={page}
          visiblePages={getVisiblePages()}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
