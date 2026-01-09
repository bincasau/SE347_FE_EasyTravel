// src/pages/Admin/AdminTourUpsert.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTourFullById, saveTourUpsert, deleteTour } from "@/apis/Tour";

const S3_TOUR_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/tour";

function buildEmptyForm() {
  return {
    title: "",
    linkVideo: "",
    description: "",
    priceAdult: 0,
    priceChild: 0,
    percentDiscount: 0,
    durationDays: 1,
    startDate: "",
    endDate: "",
    departureLocation: "",
    destination: "",
    availableSeats: 0,
    limitSeats: 0,
    mainImage: "",
    status: "Pending", // backend: Pending | Passed | Activated
  };
}

function normalizeDate(d) {
  if (!d) return "";
  if (typeof d === "string") return d.slice(0, 10);
  return "";
}

function mapTourToForm(tour) {
  if (!tour) return buildEmptyForm();
  return {
    title: tour.title ?? "",
    linkVideo: tour.linkVideo ?? "",
    description: tour.description ?? "",
    priceAdult: tour.priceAdult ?? 0,
    priceChild: tour.priceChild ?? 0,
    percentDiscount: tour.percentDiscount ?? 0,
    durationDays: tour.durationDays ?? 1,
    startDate: normalizeDate(tour.startDate),
    endDate: normalizeDate(tour.endDate),
    departureLocation: tour.departureLocation ?? "",
    destination: tour.destination ?? "",
    availableSeats: tour.availableSeats ?? 0,
    limitSeats: tour.limitSeats ?? 0,
    mainImage: tour.mainImage ?? "",
    status: tour.status ?? "Pending",
  };
}

function toNumberSafe(v, fallback = 0) {
  if (v === "" || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
}

function isDateBefore(a, b) {
  if (!a || !b) return false;
  return new Date(a) < new Date(b);
}

function validateForm(next) {
  const e = {};

  if (!next.title?.trim()) e.title = "Vui lòng nhập tiêu đề.";
  if (!next.linkVideo?.trim()) e.linkVideo = "Vui lòng nhập link video.";
  if (!next.departureLocation?.trim())
    e.departureLocation = "Vui lòng nhập nơi xuất phát.";
  if (!next.destination?.trim()) e.destination = "Vui lòng nhập điểm đến.";

  const priceAdult = toNumberSafe(next.priceAdult, 0);
  const priceChild = toNumberSafe(next.priceChild, 0);
  const percentDiscount = toNumberSafe(next.percentDiscount, 0);
  const durationDays = toNumberSafe(next.durationDays, 1);
  const availableSeats = toNumberSafe(next.availableSeats, 0);
  const limitSeats = toNumberSafe(next.limitSeats, 0);

  if (priceAdult < 0) e.priceAdult = "Giá người lớn không được âm.";
  if (priceChild < 0) e.priceChild = "Giá trẻ em không được âm.";
  if (percentDiscount < 0) e.percentDiscount = "Giảm giá không được âm.";
  if (percentDiscount > 100)
    e.percentDiscount = "Giảm giá không được quá 100%.";
  if (durationDays < 1) e.durationDays = "Số ngày phải >= 1.";
  if (availableSeats < 0) e.availableSeats = "Ghế còn không được âm.";
  if (limitSeats < 0) e.limitSeats = "Tổng ghế không được âm.";
  if (availableSeats > limitSeats)
    e.availableSeats = "Ghế còn không được lớn hơn tổng ghế.";

  if (!next.startDate) e.startDate = "Vui lòng chọn ngày bắt đầu.";
  if (!next.endDate) e.endDate = "Vui lòng chọn ngày kết thúc.";
  if (
    next.startDate &&
    next.endDate &&
    isDateBefore(next.endDate, next.startDate)
  ) {
    e.endDate = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.";
  }

  const allowedStatus = ["Pending", "Passed", "Activated"];
  if (!allowedStatus.includes(next.status))
    e.status = "Trạng thái không hợp lệ.";

  return e;
}

function FieldError({ msg, show }) {
  if (!show || !msg) return null;
  return <div className="mt-1 text-sm text-red-600">{msg}</div>;
}

export default function AdminTourUpsert() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [err, setErr] = useState("");

  const [form, setForm] = useState(buildEmptyForm());
  const [fieldErrors, setFieldErrors] = useState(() =>
    validateForm(buildEmptyForm())
  );

  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [itineraries, setItineraries] = useState([]);
  const [images, setImages] = useState([]);

  const [pickedFile, setPickedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // modal success khi tạo mới
  const [openSuccess, setOpenSuccess] = useState(false);

  const currentMainImageUrl = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (!form.mainImage) return "";
    return form.mainImage.startsWith("http")
      ? form.mainImage
      : `${S3_TOUR_BASE}/${form.mainImage}`;
  }, [previewUrl, form.mainImage]);

  const finalPriceAdult = useMemo(() => {
    const p = toNumberSafe(form.priceAdult, 0);
    const d = toNumberSafe(form.percentDiscount, 0);
    return p - (p * d) / 100;
  }, [form.priceAdult, form.percentDiscount]);

  const canSubmit = useMemo(() => {
    if (saving || deleting || loading) return false;
    return Object.keys(fieldErrors).length === 0;
  }, [fieldErrors, saving, deleting, loading]);

  function resetForm() {
    const empty = buildEmptyForm();
    setForm(empty);
    setFieldErrors(validateForm(empty));
    setTouched({});
    setSubmitted(false);

    setItineraries([]);
    setImages([]);
    setPickedFile(null);
    setPreviewUrl("");
    setErr("");
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    let alive = true;

    if (!isEdit) {
      resetForm();
      return;
    }

    setLoading(true);
    setErr("");

    getTourFullById(id)
      .then((data) => {
        if (!alive || !data) return;

        const mapped = mapTourToForm(data.tour);
        setForm(mapped);
        setFieldErrors(validateForm(mapped));
        setTouched({});
        setSubmitted(false);

        setItineraries(data.itineraries ?? []);
        setImages(data.images ?? []);
        setPickedFile(null);
        setPreviewUrl("");
      })
      .catch((e) => alive && setErr(e?.message || "Tải dữ liệu thất bại."))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  function applyForm(next) {
    setForm(next);
    setFieldErrors(validateForm(next));
  }

  function markTouched(name) {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function onBlur(e) {
    markTouched(e.target.name);
  }

  function onChange(e) {
    const { name, value, type } = e.target;
    setErr("");

    if (type === "number") {
      const nextVal = value === "" ? "" : value;
      const next = { ...form, [name]: nextVal };

      // limitSeats giảm xuống < availableSeats => kéo availableSeats xuống
      if (name === "limitSeats") {
        const lim = nextVal === "" ? 0 : Number(nextVal);
        const av = next.availableSeats === "" ? 0 : Number(next.availableSeats);
        if (!Number.isNaN(lim) && !Number.isNaN(av) && av > lim) {
          next.availableSeats = lim;
        }
      }

      applyForm(next);
      return;
    }

    if (type === "date") {
      const next = { ...form, [name]: value };

      // startDate đổi => endDate không được < startDate
      if (
        name === "startDate" &&
        next.endDate &&
        isDateBefore(next.endDate, value)
      ) {
        next.endDate = value;
      }

      // endDate đổi => không được < startDate
      if (
        name === "endDate" &&
        next.startDate &&
        isDateBefore(value, next.startDate)
      ) {
        next.endDate = next.startDate;
      }

      applyForm(next);
      return;
    }

    applyForm({ ...form, [name]: value });
  }

  function onPickMainImage(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    setPickedFile(f);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(f);
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setSubmitted(true);

    const payload = isEdit ? { ...form, tourId: Number(id) } : { ...form };

    payload.priceAdult = toNumberSafe(payload.priceAdult, 0);
    payload.priceChild = toNumberSafe(payload.priceChild, 0);
    payload.percentDiscount = toNumberSafe(payload.percentDiscount, 0);
    payload.durationDays = toNumberSafe(payload.durationDays, 1);
    payload.availableSeats = toNumberSafe(payload.availableSeats, 0);
    payload.limitSeats = toNumberSafe(payload.limitSeats, 0);

    if (!payload.status) payload.status = "Pending";
    if (!["Pending", "Passed", "Activated"].includes(payload.status)) {
      setErr("Trạng thái không hợp lệ.");
      setTouched((prev) => ({ ...prev, status: true }));
      return;
    }

    delete payload.createdAt;

    const finalErrors = validateForm(payload);
    setFieldErrors(finalErrors);

    if (Object.keys(finalErrors).length > 0) {
      setTouched({
        title: true,
        linkVideo: true,
        departureLocation: true,
        destination: true,
        priceAdult: true,
        priceChild: true,
        percentDiscount: true,
        durationDays: true,
        startDate: true,
        endDate: true,
        availableSeats: true,
        limitSeats: true,
        status: true,
      });
      return;
    }

    setSaving(true);

    try {
      const saved = await saveTourUpsert(payload, pickedFile);
      const savedId =
        saved?.tourId ?? saved?.id ?? (isEdit ? Number(id) : null);

      // EDIT: lưu xong quay lại trang edit (đúng route bạn dùng)
      if (isEdit) {
        if (savedId) navigate(`/admin/tours/edit/${savedId}`);
        else navigate("/admin/tours");
        return;
      }

      // CREATE: mở modal success để chọn
      setOpenSuccess(true);
    } catch (e2) {
      setErr(e2?.message || "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!isEdit) return;

    const ok = window.confirm("Bạn có chắc chắn muốn xóa tour này không?");
    if (!ok) return;

    setDeleting(true);
    setErr("");

    try {
      await deleteTour(Number(id));
      navigate("/admin/tours");
    } catch (e) {
      setErr(e?.message || "Xóa thất bại.");
    } finally {
      setDeleting(false);
    }
  }

  const statusLabel =
    form.status === "Passed"
      ? "Đã duyệt"
      : form.status === "Activated"
      ? "Đã kích hoạt"
      : "Chờ duyệt";

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* success modal (chỉ khi tạo mới thành công) */}
      {openSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenSuccess(false)}
          />
          <div
            className="relative w-[92%] max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xl font-semibold">Thêm tour thành công</div>
            <div className="mt-2 text-sm text-gray-600">
              Bạn muốn quay về danh sách tour hay tiếp tục tạo mới?
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-xl border border-gray-200 py-2.5 hover:bg-gray-50"
                onClick={() => {
                  setOpenSuccess(false);
                  navigate("/admin/tours");
                }}
              >
                Về trang tour
              </button>

              <button
                type="button"
                className="flex-1 rounded-xl bg-black text-white py-2.5"
                onClick={() => {
                  setOpenSuccess(false);
                  resetForm();
                }}
              >
                Tiếp tục tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">
            {isEdit ? "Cập nhật tour" : "Thêm tour mới"}
          </h1>
          <div className="text-sm text-gray-500">
            {isEdit ? `Mã tour: ${id}` : "Tạo tour mới"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEdit ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting || saving}
              className="px-4 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 disabled:opacity-60"
            >
              {deleting ? "Đang xóa..." : "Xóa tour"}
            </button>
          ) : null}

          {/* back: đi thẳng về list, không dùng -1 để khỏi phải bấm 2 lần */}
          <button
            type="button"
            onClick={() => navigate("/admin/tours")}
            disabled={saving || deleting}
            className="px-4 py-2 rounded-xl border bg-white disabled:opacity-60"
          >
            Quay lại
          </button>
        </div>
      </div>

      {/* error */}
      {err ? (
        <div className="mb-5 p-3 rounded-xl bg-red-50 text-red-700 border border-red-100">
          {err}
        </div>
      ) : null}

      {loading ? (
        <div className="p-4 rounded-xl border bg-white">
          Đang tải dữ liệu...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* form */}
          <form
            onSubmit={onSubmit}
            className="lg:col-span-2 p-5 rounded-2xl border bg-white space-y-5"
          >
            <div>
              <div className="text-sm font-medium mb-1">Tiêu đề tour</div>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                onBlur={onBlur}
                className="w-full border rounded-xl p-3"
                placeholder="Nhập tiêu đề tour"
              />
              <FieldError
                msg={fieldErrors.title}
                show={submitted || touched.title}
              />
            </div>

            <div>
              <div className="text-sm font-medium mb-1">Link video</div>
              <input
                name="linkVideo"
                value={form.linkVideo}
                onChange={onChange}
                onBlur={onBlur}
                className="w-full border rounded-xl p-3"
                placeholder="Dán link video"
              />
              <FieldError
                msg={fieldErrors.linkVideo}
                show={submitted || touched.linkVideo}
              />
            </div>

            <div>
              <div className="text-sm font-medium mb-1">Mô tả</div>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                onBlur={onBlur}
                className="w-full border rounded-xl p-3"
                rows={7}
                placeholder="Nhập mô tả tour"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Giá người lớn</div>
                <input
                  name="priceAdult"
                  type="number"
                  value={form.priceAdult}
                  onChange={onChange}
                  onBlur={onBlur}
                  className="w-full border rounded-xl p-3"
                  min={0}
                />
                <FieldError
                  msg={fieldErrors.priceAdult}
                  show={submitted || touched.priceAdult}
                />
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Giá trẻ em</div>
                <input
                  name="priceChild"
                  type="number"
                  value={form.priceChild}
                  onChange={onChange}
                  onBlur={onBlur}
                  className="w-full border rounded-xl p-3"
                  min={0}
                />
                <FieldError
                  msg={fieldErrors.priceChild}
                  show={submitted || touched.priceChild}
                />
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Giảm giá (%)</div>
                <input
                  name="percentDiscount"
                  type="number"
                  value={form.percentDiscount}
                  onChange={onChange}
                  onBlur={onBlur}
                  className="w-full border rounded-xl p-3"
                  min={0}
                  max={100}
                />
                <FieldError
                  msg={fieldErrors.percentDiscount}
                  show={submitted || touched.percentDiscount}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Số ngày</div>
                <input
                  name="durationDays"
                  type="number"
                  value={form.durationDays}
                  onChange={onChange}
                  onBlur={onBlur}
                  className="w-full border rounded-xl p-3"
                  min={1}
                />
                <FieldError
                  msg={fieldErrors.durationDays}
                  show={submitted || touched.durationDays}
                />
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Ngày bắt đầu</div>
                <input
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={onChange}
                  onBlur={onBlur}
                  className="w-full border rounded-xl p-3"
                  max={form.endDate || undefined}
                />
                <FieldError
                  msg={fieldErrors.startDate}
                  show={submitted || touched.startDate}
                />
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Ngày kết thúc</div>
                <input
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={onChange}
                  onBlur={onBlur}
                  className="w-full border rounded-xl p-3"
                  min={form.startDate || undefined}
                />
                <FieldError
                  msg={fieldErrors.endDate}
                  show={submitted || touched.endDate}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Nơi xuất phát</div>
                <input
                  name="departureLocation"
                  value={form.departureLocation}
                  onChange={onChange}
                  onBlur={onBlur}
                  className="w-full border rounded-xl p-3"
                  placeholder="Ví dụ: Hà Nội"
                />
                <FieldError
                  msg={fieldErrors.departureLocation}
                  show={submitted || touched.departureLocation}
                />
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Điểm đến</div>
                <input
                  name="destination"
                  value={form.destination}
                  onChange={onChange}
                  onBlur={onBlur}
                  className="w-full border rounded-xl p-3"
                  placeholder="Ví dụ: Hạ Long"
                />
                <FieldError
                  msg={fieldErrors.destination}
                  show={submitted || touched.destination}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Ghế còn</div>
                <input
                  name="availableSeats"
                  type="number"
                  value={form.availableSeats}
                  onChange={onChange}
                  onBlur={onBlur}
                  className="w-full border rounded-xl p-3"
                  min={0}
                  max={form.limitSeats === "" ? undefined : form.limitSeats}
                />
                <FieldError
                  msg={fieldErrors.availableSeats}
                  show={submitted || touched.availableSeats}
                />
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Tổng ghế</div>
                <input
                  name="limitSeats"
                  type="number"
                  value={form.limitSeats}
                  onChange={onChange}
                  onBlur={onBlur}
                  className="w-full border rounded-xl p-3"
                  min={0}
                />
                <FieldError
                  msg={fieldErrors.limitSeats}
                  show={submitted || touched.limitSeats}
                />
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-1">Trạng thái</div>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                onBlur={onBlur}
                className="w-full border rounded-xl p-3 bg-white"
              >
                <option value="Pending">Chờ duyệt</option>
                <option value="Passed">Đã duyệt</option>
                <option value="Activated">Đã kích hoạt</option>
              </select>
              <FieldError
                msg={fieldErrors.status}
                show={submitted || touched.status}
              />
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Ảnh đại diện</div>
              <input type="file" accept="image/*" onChange={onPickMainImage} />

              {currentMainImageUrl ? (
                <img
                  src={currentMainImageUrl}
                  alt="Ảnh đại diện"
                  className="mt-3 w-full h-56 object-cover rounded-2xl bg-gray-100 border"
                />
              ) : (
                <div className="mt-3 w-full h-56 rounded-2xl bg-gray-50 border flex items-center justify-center text-gray-400">
                  Chưa có ảnh đại diện
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="px-5 py-3 rounded-xl bg-black text-white disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>

          {/* right side */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-5 rounded-2xl border bg-white">
              <div className="font-semibold mb-3">Thông tin hiện tại</div>

              <div className="text-sm text-gray-700 space-y-3">
                <div>
                  <div className="text-gray-500">Trạng thái</div>
                  <div className="font-medium">{statusLabel}</div>
                </div>

                <div>
                  <div className="text-gray-500">Giá người lớn sau giảm</div>
                  <div className="font-medium">{finalPriceAdult}</div>
                </div>

                <div>
                  <div className="text-gray-500">Tên ảnh đại diện</div>
                  <div className="font-medium break-words">
                    {form.mainImage || "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border bg-white">
              <div className="font-semibold mb-3">
                Lịch trình ({itineraries.length})
              </div>

              {itineraries.length === 0 ? (
                <div className="text-sm text-gray-500">Chưa có dữ liệu</div>
              ) : (
                <div className="space-y-3">
                  {itineraries
                    .slice()
                    .sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0))
                    .map((it) => (
                      <div
                        key={it.itineraryId ?? `${it.dayNumber}-${it.title}`}
                        className="border rounded-xl p-3"
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          Ngày {it.dayNumber}
                        </div>
                        <div className="font-medium leading-snug">
                          {it.title}
                        </div>
                        <div className="text-sm text-gray-600 mt-2 line-clamp-4">
                          {it.activities}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl border bg-white">
              <div className="font-semibold mb-3">
                Ảnh tour ({images.length})
              </div>

              {images.length === 0 ? (
                <div className="text-sm text-gray-500">Chưa có dữ liệu</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {images.map((img) => {
                    const src = img.url?.startsWith("http")
                      ? img.url
                      : `${S3_TOUR_BASE}/${img.url}`;
                    return (
                      <div
                        key={img.imageId ?? img.url}
                        className="border rounded-xl overflow-hidden"
                      >
                        <img
                          src={src}
                          alt={img.altText || img.title || "Ảnh tour"}
                          className="w-full h-24 object-cover bg-gray-100"
                        />
                        <div className="p-2">
                          <div className="text-xs font-medium line-clamp-1">
                            {img.title || "Ảnh"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
