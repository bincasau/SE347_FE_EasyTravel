import * as XLSX from "xlsx";
import { getUsers } from "@/apis/User";

function mapUserToExcelRow(u) {
  return {
    ID: u?.userId ?? "",
    Name: u?.name ?? "",
    Username: u?.username ?? "",
    Email: u?.email ?? "",
    PhoneNumber: u?.phoneNumber ?? "",
    Address: u?.address ?? "",
    DOB: u?.dob ? String(u.dob).slice(0, 10) : "",
    Gender: u?.gender ?? "",
    Role: u?.role ?? "",
    Status: u?.status ?? "",
  };
}


export async function exportUsersExcel({
  role = "ALL",
  status = "ALL",
  fileName,
  pageSize = 200,
} = {}) {
  const all = [];
  let page = 1;
  let total = 1;

  do {
    const data = await getUsers({
      page,
      size: pageSize,
      role,
      status,
    });

    all.push(...(data?._embedded?.users ?? []));
    total = data?.page?.totalPages ?? 1;
    page += 1;
  } while (page <= total);

  if (all.length === 0) throw new Error("No users to export");

  const rows = all.map(mapUserToExcelRow);

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");

  const roleName = role === "ALL" ? "ALL" : role;
  const statusName =
    status === "ALL" ? "ALL" : String(status).replace(/\s+/g, "_");
  const finalName = fileName || `users_${roleName}_${statusName}.xlsx`;

  XLSX.writeFile(wb, finalName);
}
