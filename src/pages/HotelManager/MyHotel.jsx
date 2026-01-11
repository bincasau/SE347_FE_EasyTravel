import React, { useMemo, useEffect, useState } from "react";

const HOTEL_IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/hotel";
const HOTEL_EXTRA_IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/image";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80&auto=format&fit=crop";

const API_MY_HOTEL = "http://localhost:8080/hotel_manager/my-hotel";
const API_UPDATE_HOTEL_MANAGER =
  "http://localhost:8080/hotel_manager/update-hotel";

// upload: POST /image/auth/upload?type=hotel&id=7
const API_UPLOAD_EXTRA = "http://localhost:8080/image/auth/upload";

// list: GET /hotels/7/images
const API_HOTEL_IMAGES = (hotelId) =>
  `http://localhost:8080/hotels/${hotelId}/images`;

// delete: DELETE /image/auth/{imageId}
const API_DELETE_IMAGE = (imageId) =>
  `http://localhost:8080/image/auth/${imageId}`;

export default function MyHotel() {
  const [hotel, setHotel] = useState(null);
  const [draft, setDraft] = useState(null);

  const [images, setImages] = useState([]); // [{imageId, url, ...}]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // upload modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  // delete confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // image object

  // cache bust for S3 images
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  const token =
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

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
    };
  };

  const toBackendHotelPayload = (h) => {
    if (!h) return {};
    return {
      id: h.hotel_id,
      hotelId: h.hotel_id,
      name: h.name ?? "",
      address: h.address ?? "",
      phoneNumber: h.phone_number ?? "",
      email: h.email ?? "",
      description: h.description ?? "",
      minPrice:
        h.min_price === "" || h.min_price === null || h.min_price === undefined
          ? null
          : Number(h.min_price),
      mainImage: h.main_image ?? "",
    };
  };

  const fetchMyHotel = async () => {
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
    return n;
  };

  /**
   * ✅ fetch images từ endpoint bạn đang mở trên browser
   * GET /hotels/{id}/images
   *
   * Response có thể là HAL:
   * { _embedded: { images: [...] } }
   * hoặc list luôn: [...]
   */
  const fetchHotelImages = async (hotelId) => {
    const res = await fetch(API_HOTEL_IMAGES(hotelId), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      let msg = `Fetch images failed: ${res.status}`;
      try {
        const e = await res.json();
        msg = e?.message || e?.error || msg;
      } catch {}
      throw new Error(msg);
    }

    const data = await res.json();

    // HAL format or raw array
    let list = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (data?._embedded) {
      // guess key name
      const embeddedKey =
        Object.keys(data._embedded)[0] || "images";
      list = data._embedded?.[embeddedKey] || [];
    } else {
      list = [];
    }

    // normalize item
    const normalized = list
      .map((it) => ({
        imageId: it.imageId ?? it.id,
        url: it.url ?? it.key ?? "",
        title: it.title ?? null,
        altText: it.altText ?? null,
        createdAt: it.createdAt ?? null,
        _links: it._links ?? null,
      }))
      .filter((x) => x.imageId && x.url);

    // sort mới nhất lên đầu (nếu có createdAt)
    normalized.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    setImages(normalized);
    return normalized;
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const h = await fetchMyHotel();
        if (h?.hotel_id) {
          await fetchHotelImages(h.hotel_id);
        }
      } catch (e) {
        setError(e?.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (d) => {
    if (!d) return "--";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleString("vi-VN");
  };

  const priceText = useMemo(() => {
    const v = hotel?.min_price;
    if (v === null || v === undefined || v === "") return "--";
    const num = Number(v);
    if (Number.isNaN(num)) return String(v);
    return `${num.toLocaleString("vi-VN")}₫ / đêm`;
  }, [hotel]);

  const mainImageUrl = hotel?.main_image
    ? `${HOTEL_IMAGE_BASE}/${hotel.main_image}?t=${cacheBuster}`
    : FALLBACK_IMAGE;

  const gallery = useMemo(() => {
    // convert url key -> full S3 url
    return images.map((img) => ({
      ...img,
      src: `${HOTEL_EXTRA_IMAGE_BASE}/${img.url}?t=${cacheBuster}`,
    }));
  }, [images, cacheBuster]);

  const updateHotelByManager = async () => {
    const fd = new FormData();
    const payload = toBackendHotelPayload(draft);

    fd.append(
      "hotel",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );

    const res = await fetch(API_UPDATE_HOTEL_MANAGER, {
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

    const next = normalizeHotel(data) || draft;
    setHotel(next);
    setDraft(next);
  };

  /**
   * ✅ POST /image/auth/upload?type=hotel&id=7
   * body: form-data file
   */
  const uploadExtraImage = async (file) => {
    const id = hotel?.hotel_id;
    if (!id) throw new Error("Missing hotel_id");
    if (!file) throw new Error("Bạn chưa chọn file ảnh.");

    const fd = new FormData();
    fd.append("file", file);

    const qs = new URLSearchParams({
      type: "hotel",
      id: String(id),
    });

    const res = await fetch(`${API_UPLOAD_EXTRA}?${qs.toString()}`, {
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

    // optional json
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  /**
   * ✅ DELETE /image/auth/{imageId}
   */
  const deleteImage = async (imageId) => {
    const res = await fetch(API_DELETE_IMAGE(imageId), {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      let msg = `Delete failed: ${res.status}`;
      try {
        const e = await res.json();
        msg = e?.message || e?.error || msg;
      } catch {}
      throw new Error(msg);
    }

    return true;
  };

  const onClickEdit = () => {
    setIsEditing(true);
    setError("");
    showToast("Edit mode");
  };

  const onCancel = () => {
    setDraft(hotel);
    setIsEditing(false);
    setError("");
    showToast("Cancelled");
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError("");
      await updateHotelByManager();
      setIsEditing(false);
      showToast("✅ Saved");
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
      setUploading(true);
      setError("");

      await uploadExtraImage(uploadFile);

      setUploadOpen(false);
      setUploadFile(null);
      showToast("✅ Uploaded");

      // ✅ reload gallery thật từ BE
      await fetchHotelImages(hotel.hotel_id);

      // ✅ bust cache để S3 show ảnh mới
      setCacheBuster(Date.now());
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onAskDelete = (img) => {
    setConfirmTarget(img);
    setConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!confirmTarget?.imageId) return;
    const id = confirmTarget.imageId;

    try {
      setDeletingId(id);
      setError("");

      await deleteImage(id);

      setConfirmOpen(false);
      setConfirmTarget(null);
      showToast("✅ Deleted");

      await fetchHotelImages(hotel.hotel_id);
      setCacheBuster(Date.now());
    } catch (e) {
      setError(e?.message || "Delete failed");
    } finally {
      setDeletingId(null);
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
      {toast ? (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow">
          {toast}
        </div>
      ) : null}

      {/* HEADER */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-2xl font-semibold text-gray-900">My Hotel</h1>
            <p className="text-sm text-gray-500 mt-1">Hotel Information</p>
          </div>

          {!isEditing ? (
            <button
              onClick={onClickEdit}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:opacity-90"
            >
              Edit
            </button>
          ) : (
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
              Editing...
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
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

          {/* GALLERY */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-900">Gallery</div>

              <button
                type="button"
                onClick={onOpenUpload}
                className="px-3 py-2 rounded-xl border bg-gray-50 text-gray-900 text-sm hover:bg-gray-100"
              >
                + Add photo
              </button>
            </div>

            {/* ✅ hiển thị đúng ảnh đã upload */}
            {gallery.length === 0 ? (
              <div className="text-sm text-gray-500">
                Chưa có ảnh gallery. Bấm “Add photo” để thêm.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {gallery.map((img) => (
                  <div
                    key={img.imageId}
                    className="rounded-xl overflow-hidden border bg-gray-50 relative group"
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(img.src)}
                      className="block w-full"
                      title="Xem ảnh"
                    >
                      <img
                        src={img.src}
                        alt={img.altText || `Image ${img.imageId}`}
                        className="w-full h-24 object-cover"
                        onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                      />
                    </button>

                    {/* ✅ nút delete (hover mới hiện) */}
                    <button
                      type="button"
                      onClick={() => onAskDelete(img)}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white text-lg leading-none hidden group-hover:flex items-center justify-center"
                      title="Xoá ảnh"
                      disabled={deletingId === img.imageId}
                    >
                      {deletingId === img.imageId ? "…" : "−"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QUICK INFO */}
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
                  onChange={(v) => setDraft((p) => ({ ...p, email: v }))}
                />
                <Field
                  label="Phone"
                  value={draft.phone_number}
                  onChange={(v) =>
                    setDraft((p) => ({ ...p, phone_number: v }))
                  }
                />
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 space-y-6">
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
                  onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
                />
                <Field
                  label="Min price"
                  type="number"
                  value={draft.min_price ?? ""}
                  onChange={(v) => setDraft((p) => ({ ...p, min_price: v }))}
                  placeholder="VD: 500000"
                />
                <Field
                  label="Address"
                  value={draft.address}
                  onChange={(v) => setDraft((p) => ({ ...p, address: v }))}
                  className="md:col-span-2"
                />
              </div>
            )}
          </div>

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
                onChange={(e) =>
                  setDraft((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full min-h-[140px] border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Nhập mô tả..."
              />
            )}
          </div>

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

          {error ? (
            <div className="bg-white border rounded-2xl p-4 shadow-sm">
              <div className="text-sm text-red-600 break-words">{error}</div>
            </div>
          ) : null}

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

      {/* UPLOAD MODAL */}
      {uploadOpen ? (
        <Modal title="Upload ảnh Gallery" onClose={() => setUploadOpen(false)}>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Upload vào: <b>/image/auth/upload</b> với query{" "}
              <b>?type=hotel&id={hotel.hotel_id}</b>
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
                disabled={uploading}
                className="px-4 py-2 rounded-xl border bg-white text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                Close
              </button>
              <button
                onClick={onDoUpload}
                disabled={uploading || !uploadFile}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:opacity-90 disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* DELETE CONFIRM */}
      {confirmOpen ? (
        <Modal title="Xoá ảnh?" onClose={() => setConfirmOpen(false)}>
          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              Bạn muốn xoá ảnh <b>#{confirmTarget?.imageId}</b> không?
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={deletingId != null}
                className="px-4 py-2 rounded-xl border bg-white text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmDelete}
                disabled={deletingId != null}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm hover:opacity-90 disabled:opacity-60"
              >
                {deletingId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* PREVIEW */}
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
