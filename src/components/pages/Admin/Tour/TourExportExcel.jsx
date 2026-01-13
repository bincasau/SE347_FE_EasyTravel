import * as XLSX from "xlsx";

function mapTourToExcelRow(t) {
  return {
    TourId: t?.tourId ?? "",
    Title: t?.title ?? "",
    LinkVideo: t?.linkVideo ?? "",
    Description: t?.description ?? "",

    PriceAdult: t?.priceAdult ?? "",
    PriceChild: t?.priceChild ?? "",
    DiscountPercent: t?.percentDiscount ?? "",

    DurationDays: t?.durationDays ?? "",

    StartDate: t?.startDate ? String(t.startDate).slice(0, 10) : "",
    EndDate: t?.endDate ? String(t.endDate).slice(0, 10) : "",

    DepartureLocation: t?.departureLocation ?? "",
    Destination: t?.destination ?? "",

    AvailableSeats: t?.availableSeats ?? "",
    LimitSeats: t?.limitSeats ?? "",

    MainImage: t?.mainImage ?? "",
    Status: t?.status ?? "",

    CreatedAt: t?.createdAt ? String(t.createdAt).slice(0, 10) : "",
  };
}

export function exportToursExcel(tours, fileName = "tours.xlsx") {
  const rows = (tours ?? []).map(mapTourToExcelRow);

  if (rows.length === 0) {
    throw new Error("No tours to export");
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tours");

  XLSX.writeFile(wb, fileName);
}
