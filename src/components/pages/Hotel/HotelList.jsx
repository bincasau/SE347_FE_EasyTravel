import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSearchParams } from "react-router-dom";
import {
  faMagnifyingGlass,
  faFilter,
  faSortAmountUp,
  faSortAmountDown,
} from "@fortawesome/free-solid-svg-icons";
import { useLang } from "@/contexts/LangContext";
import Pagination from "@/utils/Pagination";
import HotelCard from "@/components/pages/Hotel/HotelCard";

const HotelList = () => {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = parseInt(searchParams.get("page")) || 1;
  const [page, setPage] = useState(initialPage);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [hotelData, setHotelData] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const hotelsPerPage = 8;

  // 🔹 Fetch lần đầu: lấy tổng số trang trước tiên
  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:8080/hotels")
      .then((res) => res.json())
      .then((data) => {
        if (data._embedded?.hotels) {
          setHotelData(data._embedded.hotels);
          setTotalElements(data.page?.totalElements || 0);
          if (data._links?.next?.href) setNextPageUrl(data._links.next.href);
        }
      })
      .catch((err) => console.error("Error fetching hotels:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // 🔹 Khi đã có tổng phần tử, tính tổng trang
  const totalPages = Math.max(1, Math.ceil(totalElements / hotelsPerPage));

  // 🔹 Đồng bộ URL page sau khi có totalPages
  useEffect(() => {
    if (isLoading || totalPages === 0) return;

    const urlParam = searchParams.get("page");
    let urlPage = parseInt(urlParam);

    // Nếu không có hoặc không hợp lệ -> mặc định 1
    if (isNaN(urlPage) || urlPage < 1) urlPage = 1;

    // Nếu vượt quá tổng trang -> về trang cuối
    if (urlPage > totalPages) urlPage = totalPages;

    // Nếu khác với page hiện tại thì set lại
    if (urlPage !== page) setPage(urlPage);

    // ✅ Cập nhật lại URL cho khớp
    if (urlParam !== String(urlPage)) {
      if (urlPage === 1) {
        setSearchParams({});
      } else {
        setSearchParams({ page: urlPage });
      }
    }
  }, [searchParams, totalPages, isLoading]);

  // 🔹 Khi đổi page, fetch thêm nếu chưa đủ dữ liệu
  useEffect(() => {
    const needHotels = page * hotelsPerPage;

    if (!isLoading && hotelData.length < needHotels && nextPageUrl) {
      const loadMore = (url) => {
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            if (data._embedded?.hotels?.length) {
              setHotelData((prev) => [...prev, ...data._embedded.hotels]);
              const newLength = [...hotelData, ...data._embedded.hotels].length;
              if (data._links?.next?.href && newLength < needHotels) {
                loadMore(data._links.next.href);
              } else {
                setNextPageUrl(data._links?.next?.href || null);
              }
            }
          })
          .catch((err) => console.error("Error fetching more hotels:", err));
      };
      loadMore(nextPageUrl);
    }
  }, [page, isLoading]);

  // 🔹 Lọc theo tên hoặc địa chỉ
  const filteredHotels = hotelData.filter(
    (hotel) =>
      hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 Sắp xếp (mặc định theo hotelId)
  const sortedHotels = [...filteredHotels].sort((a, b) => {
    const fieldA = a.hotelId || 0;
    const fieldB = b.hotelId || 0;
    return sortOrder === "asc" ? fieldA - fieldB : fieldB - fieldA;
  });

  // 🔹 Cắt danh sách theo trang
  const indexOfLast = page * hotelsPerPage;
  const indexOfFirst = indexOfLast - hotelsPerPage;
  const currentHotels = sortedHotels.slice(indexOfFirst, indexOfLast);

  // 🔹 Dải số trang hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const endPage = Math.min(totalPages, page + 2);
    const startPage = Math.max(1, endPage - 3);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  // 🔹 Chuyển trang
  const handlePageChange = (newPage) => {
    const safePage = Math.min(Math.max(newPage, 1), totalPages);
    setPage(safePage);
    if (safePage === 1) setSearchParams({});
    else setSearchParams({ page: safePage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔹 Đảo chiều sắp xếp
  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  // ------------------ JSX ------------------
  return (
    <div className="w-full px-6 md:px-12 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">{t("hotelPage.title")}</h2>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder={t("hotelPage.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          {/* Sort */}
          <button
            onClick={toggleSortOrder}
            className="border rounded-full p-2 hover:bg-gray-100 flex items-center justify-center"
            title={
              sortOrder === "asc"
                ? t("hotelPage.sortAsc")
                : t("hotelPage.sortDesc")
            }
          >
            <FontAwesomeIcon
              icon={sortOrder === "asc" ? faSortAmountUp : faSortAmountDown}
            />
          </button>

          {/* Filter */}
          <button className="border rounded-full p-2 hover:bg-gray-100">
            <FontAwesomeIcon icon={faFilter} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <p className="text-center text-gray-400 mt-10">
          {t("hotelPage.loading") || "Đang tải..."}
        </p>
      ) : currentHotels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {currentHotels.map((hotel) => (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            visiblePages={getPageNumbers()}
          />
        </div>
      )}
    </div>
  );
};

export default HotelList;
