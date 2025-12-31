import React, { useEffect, useState } from "react";
import AdminTourCard from "./AdminTourCard";
import Pagination from "@/utils/Pagination";
import { getAllTours } from "@/apis/Tour";

export default function TourManagement() {
  const [tours, setTours] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5;

useEffect(() => {
  getAllTours().then((list) => {
    setTours(list); 
  });
}, []);

  // paging
  const totalPages = Math.ceil(tours.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleTours = tours.slice(startIndex, startIndex + pageSize);

  return (
    <div className="max-w-5xl mx-auto py-10">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tour Management</h1>
        <button className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
          + Add tour
        </button>
      </div>

      {/* TOUR LIST */}
      <div className="space-y-8">
        {visibleTours.map((tour) => (
          <AdminTourCard
            key={tour.tourId}
            tour={tour}
            onEdit={() => console.log("Edit:", tour.tourId)}
            onRemove={() => console.log("Remove:", tour.tourId)}
          />
        ))}

        {/* SHOW EMPTY IF NO DATA */}
        {visibleTours.length === 0 && (
          <p className="text-center text-gray-500 py-10">No tours found.</p>
        )}
      </div>

      {/* PAGINATION */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        visiblePages={null}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
