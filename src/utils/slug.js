// src/utils/slug.js

// ✅ Slugify tiếng Việt (không cần thư viện)
export function slugifyVi(input = "") {
  return String(input)
    .normalize("NFD") // tách dấu
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // bỏ ký tự lạ
    .replace(/\s+/g, "-") // space -> -
    .replace(/-+/g, "-"); // gộp --- thành -
}

export function buildTourSlug(id, title) {
  const slug = slugifyVi(title || "tour");
  return `${slug}-${id}`;
}

// ✅ lấy id từ "slug-id"
export function extractIdFromSlug(slugId = "") {
  const parts = String(slugId).split("-");
  const last = parts[parts.length - 1];
  const id = Number(last);
  return Number.isFinite(id) ? id : null;
}
