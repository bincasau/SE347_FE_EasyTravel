import React, { useMemo, useEffect, useState } from "react";

const HOTEL_IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/hotel";
const HOTEL_EXTRA_IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/image";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80&auto=format&fit=crop";

const API_MY_HOTEL = "http://localhost:8080/hotel_manager/my-hotel";
const API_UPDATE_HOTEL = (id) => `http://localhost:8080/update-hotel/${id}`;

// ✅ upload extra image entity
const API_UPLOAD_EXTRA = "http://localhost:8080/auth/upload";
// delete extra (nếu bạn muốn dùng sau)
const API_DELETE_EXTRA = (id) => `http://localhost:8080/auth/${id}`;

export default function MyHotel() {
  const [hotel, setHotel] = useState(null);
  const [draft, setDraft] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // ✅ view/edit mode
  const [isEditing, setIsEditing] = useState(false);

  // preview ảnh
  const [previewUrl, setPreviewUrl] = useState("");

  // upload modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  const token =
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  const normalizeHotel = (raw) => {
    if (!raw) return null;
    return {
      hotel_id: raw.hotel_id ?? raw.hotelId ?? raw.id,
      name: raw.name ?? "",
      address: raw.address ?? "",
      phone_number: raw.phone_number ?? raw.phoneNumber ?? "",
      email: raw.email ?? "",
      description: raw.description ?? "",
      main_image: raw.main_image ?? raw.mainImage ?? "",
      min_price: raw.min_price ?? raw.minPrice ?? null,
      created_at: raw.created_at ?? raw.createdAt ?? null,
      updated_at: raw.updated_at ?? raw.updatedAt ?? null,
      images: Array.isArray(raw.images) ? raw.images : [],
    };
  };

  useEffect(() => {
    const loadHotel = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(API_MY_HOTEL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          let msg = `Request failed: ${res.status}`;
          try {
            const e = await res.json();
            msg = e?.message || e?.error || msg;
          } catch {}
          throw new Error(msg);
        }

        const data = await res.json();
        const n = normalizeHotel(data);
        setHotel(n);
        setDraft(n);
      } catch (e) {
        setError(e?.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    };

    loadHotel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (d) => {
    if (!d) return "--";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleString("vi-VN");
  };

  const priceText = useMemo(() => {
    const v = hotel?.min_price ?? hotel?.minPrice;
    if (v === null || v === undefined || v === "") return "--";
    const num = Number(v);
    if (Number.isNaN(num)) return String(v);
    return `${num.toLocaleString("vi-VN")}₫ / đêm`;
  }, [hotel]);

  const mainImageUrl = (hotel?.main_image ?? hotel?.mainImage)
    ? `${HOTEL_IMAGE_BASE}/${hotel?.main_image ?? hotel?.mainImage}`
    : FALLBACK_IMAGE;

  // Ảnh phụ vẫn hiển thị theo pattern hotel_{id}_img_1..3 (như bạn nói)
  const extraImageUrls = useMemo(() => {
    const id = hotel?.hotel_id;
    if (!id) return [];
    return [1, 2, 3].map(
      (n) => `${HOTEL_EXTRA_IMAGE_BASE}/hotel_${id}_img_${n}.jpg`
    );
  }, [hotel?.hotel_id]);

  const onDraftChange = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // ✅ Update hotel info: PUT /update-hotel/{id}, multipart (hotel json + optional file)
  const updateHotelInfo = async () => {
    const id = hotel?.hotel_id;
    if (!id) throw new Error("Missing hotel_id");

    const payload = {
      id,
      hotel_id: id,
      name: draft?.name ?? "",
      address: draft?.address ?? "",
      phone_number: draft?.phone_number ?? "",
      email: draft?.email ?? "",
      description: draft?.description ?? "",
      min_price:
        draft?.min_price === "" || draft?.min_price === null || draft?.min_price === undefined
          ? null
          : Number(draft?.min_price),
      main_image: draft?.main_image ?? "",
    };

    const fd = new FormData();
    fd.append(
      "hotel",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
    // (nếu sau này bạn cho đổi main image thì append("file", file) vào đây)

    const res = await fetch(API_UPDATE_HOTEL(id), {
      method: "PUT",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fd,
    });

    if (!res.ok) {
      let msg = `Update failed: ${res.status}`;
      try {
        const e = await res.json();
        msg = e?.message || e?.error || msg;
      } catch {}
      throw new Error(msg);
    }

    let data = null;
    try {
      data = await res.json();
    } catch {}

    const next = normalizeHotel(data) || payload;
    setHotel(next);
    setDraft(next);
  };

  // ✅ Upload extra image: POST /auth/upload?type=hotel&id=xxx (form-data file)
  const uploadExtraImage = async () => {
    const id = hotel?.hotel_id;
    if (!id) throw new Error("Missing hotel_id");
    if (!uploadFile) throw new Error("Bạn chưa chọn file ảnh.");

    const fd = new FormData();
    fd.append("file", uploadFile);

    const url = `${API_UPLOAD_EXTRA}?type=hotel&id=${encodeURIComponent(id)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fd,
    });

    if (!res.ok) {
      let msg = `Upload failed: ${res.status}`;
      try {
        const e = await res.json();
        msg = e?.message || e?.error || msg;
      } catch {}
      throw new Error(msg);
    }
  };

  const onClickEdit = () => {
    setIsEditing(true);
    setError("");
    showToast("Chế độ chỉnh sửa");
  };

  const onCancel = () => {
    setDraft(hotel);
    setIsEditing(false);
    setError("");
    showToast("Đã huỷ");
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError("");
      await updateHotelInfo();
      setIsEditing(false);
      showToast("✅ Lưu thành công");
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onOpenUpload = () => {
    setUploadFile(null);
    setUploadOpen(true);
  };

  const onDoUpload = async () => {
    try {
      setSaving(true);
      setError("");
      await uploadExtraImage();
      setUploadOpen(false);
      showToast("✅ Upload ảnh thành công");

      // refresh nhẹ để browser lấy ảnh mới (cache-bust)
      setTimeout(() => window.location.reload(), 600);
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Đang tải thông tin khách sạn...</div>
      </div>
    );
  }

  if (error && !hotel) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-white border rounded-2xl p-6">
          <div className="text-lg font-semibold text-gray-900">Lỗi</div>
          <div className="text-sm text-gray-600 mt-2 break-words">{error}</div>
          <button
            className="mt-4 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!hotel || !draft) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Không có dữ liệu khách sạn.</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* toast */}
      {toast ? (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow">
          {toast}
        </div>
      ) : null}

      {/* ===== HEADER ===== */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-2xl font-semibold text-gray-900 items-center justify-between">My Hotel</h1>
            <p className="text-sm text-gray-500 mt-1 items-center justify-between">Hotel Information</p>
          </div>

          {/* ✅ Edit button (chỉ hiện khi đang view) */}
          {!isEditing ? (
            <button
              onClick={onClickEdit}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:opacity-90"
            >
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                disabled={saving}
                className="px-4 py-2 rounded-xl border bg-white text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <img
              src={mainImageUrl}
              alt={hotel?.name || "Hotel"}
              className="w-full h-64 object-cover cursor-pointer"
              onClick={() => setPreviewUrl(mainImageUrl)}
              onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
            />

            <div className="p-5">
              <div className="text-xl font-semibold text-gray-900">
                {hotel?.name || "--"}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {hotel?.address || "--"}
              </div>
              <div className="mt-4 text-orange-600 font-bold text-xl">
                {priceText}
              </div>
            </div>
          </div>

          {/* ✅ Gallery + dấu cộng */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-900">Gallery</div>

              <button
                type="button"
                onClick={onOpenUpload}
                className="h-9 w-9 rounded-xl border bg-gray-50 text-gray-900 text-xl leading-none hover:bg-gray-100"
                title="Thêm ảnh"
              >
                +
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {extraImageUrls.map((url, idx) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setPreviewUrl(url)}
                  className="rounded-xl overflow-hidden border bg-gray-50 hover:opacity-90"
                  title={`Xem ảnh ${idx + 1}`}
                >
                  <img
                    src={url}
                    alt={`Hotel extra ${idx + 1}`}
                    className="w-full h-20 object-cover"
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                  />
                </button>
              ))}
            </div>

            
          </div>

          {/* Quick info */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="text-sm font-semibold text-gray-900 mb-3">
              Quick Info
            </div>

            {!isEditing ? (
              <>
                <Row label="Email" value={hotel?.email} />
                <Row label="Phone" value={hotel?.phone_number} />
              </>
            ) : (
              <>
                <Field
                  label="Email"
                  value={draft.email}
                  onChange={(v) => onDraftChange("email", v)}
                />
                <Field
                  label="Phone"
                  value={draft.phone_number}
                  onChange={(v) => onDraftChange("phone_number", v)}
                />
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hotel info */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Hotel Info
            </h2>

            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="Name" value={hotel?.name || "--"} />
                <InfoCard title="Min price" value={priceText} />
                <InfoCard title="Address" value={hotel?.address || "--"} />
                <InfoCard title="Email" value={hotel?.email || "--"} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Name"
                  value={draft.name}
                  onChange={(v) => onDraftChange("name", v)}
                />
                <Field
                  label="Min price"
                  type="number"
                  value={draft.min_price ?? ""}
                  onChange={(v) => onDraftChange("min_price", v)}
                  placeholder="VD: 500000"
                />
                <Field
                  label="Address"
                  value={draft.address}
                  onChange={(v) => onDraftChange("address", v)}
                  className="md:col-span-2"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Description
            </h2>

            {!isEditing ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {hotel?.description || "--"}
              </p>
            ) : (
              <textarea
                value={draft.description}
                onChange={(e) => onDraftChange("description", e.target.value)}
                className="w-full min-h-[140px] border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Nhập mô tả..."
              />
            )}
          </div>

          {/* System Info */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              System Info
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard title="Created at" value={formatDate(hotel?.created_at)} />
              <InfoCard title="Updated at" value={formatDate(hotel?.updated_at)} />
              <InfoCard title="Phone" value={hotel?.phone_number || "--"} />
              <InfoCard title="Email" value={hotel?.email || "--"} />
            </div>
          </div>

          
          {/* ✅ Save bar ở cuối đúng yêu cầu: chỉ hiện khi edit */}
          {isEditing ? (
            <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center justify-end gap-3">
              <button
                onClick={onCancel}
                disabled={saving}
                className="px-4 py-2 rounded-xl border bg-white text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* ✅ upload modal */}
      {uploadOpen ? (
        <Modal title="Upload ảnh Gallery" onClose={() => setUploadOpen(false)}>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              API: <b>/auth/upload</b> (type=hotel, id={hotel?.hotel_id})
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setUploadOpen(false)}
                disabled={saving}
                className="px-4 py-2 rounded-xl border bg-white text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                Close
              </button>
              <button
                onClick={onDoUpload}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* preview modal */}
      {previewUrl ? (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl("")}
        >
          <div
            className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="text-sm font-semibold text-gray-900">Preview</div>
              <button
                className="px-3 py-1 rounded-lg bg-gray-900 text-white text-sm"
                onClick={() => setPreviewUrl("")}
              >
                Close
              </button>
            </div>

            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-[75vh] object-contain bg-black"
              onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm text-gray-800 font-medium text-right break-all">
        {value === null || value === undefined || value === "" ? "--" : value}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className = "",
}) {
  return (
    <div className={className}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
      />
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-sm font-semibold text-gray-900 mt-1 break-words">
        {value === null || value === undefined || value === "" ? "--" : value}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="max-w-xl w-full bg-white rounded-2xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          <button
            className="px-3 py-1 rounded-lg bg-gray-900 text-white text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
