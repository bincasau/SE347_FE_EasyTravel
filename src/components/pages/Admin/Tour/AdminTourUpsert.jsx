// src/pages/Admin/AdminTourUpsert.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTourFullById, saveTourUpsert } from "@/apis/Tour";
import { getUsers } from "@/apis/User";

import TourCurrentInfoCard from "@/components/pages/admin/Tour/TourCurrentInfoCard";
import TourItineraryEditor from "@/components/pages/admin/Tour/TourItineraryEditor";
import ExtraImagesManager from "@/components/pages/admin/Common/ExtraImagesManager";
import TourParticipantsCard from "@/components/pages/admin/Tour/TourParticipantsCard";
import AdminTourForm from "@/components/pages/admin/Tour/AdminTourForm";
import { adminCancelTourSideEffects } from "@/apis/Tour";

const S3_TOUR_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/tour";

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
  );
}

function buildEmptyForm() {
  return {
    title: "",
    linkVideo: "",
    description: "",
    priceAdult: 0,
    priceChild: 0,
    percentDiscount: 0,
    durationDays: 0,
    startDate: "",
    endDate: "",
    departureLocation: "",
    destination: "",
    availableSeats: 0,
    limitSeats: 0,
    mainImage: "",
    status: "Activated",
    tourGuideId: "",
  };
}

function normalizeDate(d) {
  if (!d) return "";
  if (typeof d === "string") return d.slice(0, 10);
  return "";
}

function mapTourToForm(tour, tourGuides) {
  if (!tour) return buildEmptyForm();

  const firstGuideId =
    Array.isArray(tourGuides) && tourGuides.length > 0
      ? tourGuides[0]?.userId ?? tourGuides[0]?.id ?? ""
      : "";

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
    status: tour.status ?? "Activated",
    tourGuideId: firstGuideId || (tour.tourGuideId ?? ""),
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

function calcDurationDays(start, end) {
  if (!start || !end) return 1;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 1;

  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);

  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : 1;
}

function validateForm(next) {
  const e = {};

  if (!next.title?.trim()) e.title = "Vui lòng nhập tiêu đề.";
  if (!next.linkVideo?.trim()) e.linkVideo = "Vui lòng nhập link video.";
  if (!next.departureLocation?.trim())
    e.departureLocation = "Vui lòng nhập nơi xuất phát.";
  if (!next.destination?.trim()) e.destination = "Vui lòng nhập điểm đến.";

  if (
    next.tourGuideId === "" ||
    next.tourGuideId === null ||
    next.tourGuideId === undefined
  ) {
    e.tourGuideId = "Vui lòng chọn hướng dẫn viên.";
  }

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

  const allowedStatus = ["Canceled", "Passed", "Activated"];
  if (!allowedStatus.includes(next.status))
    e.status = "Trạng thái không hợp lệ.";

  return e;
}

export default function AdminTourUpsert() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState(buildEmptyForm());
  const [fieldErrors, setFieldErrors] = useState(() =>
    validateForm(buildEmptyForm())
  );
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [pickedFile, setPickedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [openSuccess, setOpenSuccess] = useState(false);

  const [guides, setGuides] = useState([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [originalStatus, setOriginalStatus] = useState("");

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
    if (saving || canceling || loading) return false;
    return Object.keys(fieldErrors).length === 0;
  }, [fieldErrors, saving, canceling, loading]);

  function resetForm() {
    const empty = buildEmptyForm();
    setForm(empty);
    setFieldErrors(validateForm(empty));
    setTouched({});
    setSubmitted(false);

    setPickedFile(null);
    setPreviewUrl("");
    setErr("");

    setOriginalStatus("");
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingGuides(true);

        const data = await getUsers({
          page: 1,
          size: 9999,
          role: "TOUR_GUIDE",
          status: "Activated",
        });

        const embedded = data?._embedded;
        let list = [];
        if (embedded && typeof embedded === "object") {
          const firstKey = Object.keys(embedded)[0];
          list = embedded[firstKey] ?? [];
        }

        setGuides(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Load tour guides failed:", e);
        setGuides([]);
      } finally {
        setLoadingGuides(false);
      }
    })();
  }, []);

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

        const mapped0 = mapTourToForm(data.tour, data.tourGuides);
        const mapped = {
          ...mapped0,
          durationDays: calcDurationDays(mapped0.startDate, mapped0.endDate),
        };

        setForm(mapped);
        setFieldErrors(validateForm(mapped));
        setTouched({});
        setSubmitted(false);

        setPickedFile(null);
        setPreviewUrl("");

        setOriginalStatus(mapped.status || "");
      })
      .catch((e) => alive && setErr(e?.message || "Tải dữ liệu thất bại."))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
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

      if (
        name === "startDate" &&
        next.endDate &&
        isDateBefore(next.endDate, value)
      ) {
        next.endDate = value;
      }

      if (
        name === "endDate" &&
        next.startDate &&
        isDateBefore(value, next.startDate)
      ) {
        next.endDate = next.startDate;
      }

      next.durationDays = calcDurationDays(next.startDate, next.endDate);
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
    payload.availableSeats = toNumberSafe(payload.availableSeats, 0);
    payload.limitSeats = toNumberSafe(payload.limitSeats, 0);

    const guideId = toNumberSafe(payload.tourGuideId, 0);
    payload.tourGuideId = guideId;

    payload.durationDays = calcDurationDays(payload.startDate, payload.endDate);

    if (!payload.status) payload.status = "Activated";
    if (!["Canceled", "Passed", "Activated"].includes(payload.status)) {
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
        tourGuideId: true,
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
      const saved = await saveTourUpsert(payload, pickedFile, guideId);
      const savedId = saved?.tourId ?? saved?.id ?? (isEdit ? Number(id) : null);

      if (
        isEdit &&
        payload.status === "Canceled" &&
        originalStatus !== "Canceled"
      ) {
        try {
          await adminCancelTourSideEffects(savedId);
        } catch (e3) {
          console.error("Cancel side effects failed:", e3);
          setErr("Đã lưu trạng thái Hủy tour, nhưng gửi thông báo/hoàn tiền bị lỗi.");
        }
      }

      if (isEdit) setOriginalStatus(payload.status || "");

      if (isEdit) {
        if (savedId) navigate(`/admin/tours/edit/${savedId}`);
        else navigate("/admin/tours");
        return;
      }

      setOpenSuccess(true);
    } catch (e2) {
      setErr(e2?.message || "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function onCancelTour() {
    if (!isEdit) return;

    const ok = window.confirm("Bạn có chắc chắn muốn hủy tour này không?");
    if (!ok) return;

    setCanceling(true);
    setErr("");

    const next = { ...form, status: "Canceled" };
    applyForm(next);

    try {
      await onSubmit({ preventDefault() {} });
    } finally {
      setCanceling(false);
    }
  }

  const statusLabel =
    form.status === "Passed"
      ? "Đã duyệt"
      : form.status === "Activated"
      ? "Đã kích hoạt"
      : form.status === "Canceled"
      ? "Đã hủy"
      : "Chờ duyệt";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Success modal responsive */}
      {openSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenSuccess(false)}
          />
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xl font-semibold">Thêm tour thành công</div>
            <div className="mt-2 text-sm text-gray-600">
              Bạn muốn quay về danh sách tour hay tiếp tục tạo mới?
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                className="w-full sm:flex-1 rounded-xl border border-gray-200 py-2.5 hover:bg-gray-50"
                onClick={() => {
                  setOpenSuccess(false);
                  navigate("/admin/tours");
                }}
              >
                Về trang tour
              </button>

              <button
                type="button"
                className="w-full sm:flex-1 rounded-xl bg-black text-white py-2.5"
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

      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold truncate">
            {isEdit ? "Cập nhật tour" : "Thêm tour mới"}
          </h1>
          <div className="text-sm text-gray-500">
            {isEdit ? `Mã tour: ${id}` : "Tạo tour mới"}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {isEdit ? (
            <button
              type="button"
              onClick={onCancelTour}
              disabled={canceling || saving || loading}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 disabled:opacity-60"
            >
              {canceling ? "Đang hủy..." : "Hủy tour"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => navigate("/admin/tours")}
            disabled={saving || canceling}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border bg-white disabled:opacity-60"
          >
            Quay lại
          </button>
        </div>
      </div>

      {err ? (
        <div className="mb-5 p-3 rounded-xl bg-red-50 text-red-700 border border-red-100">
          {err}
        </div>
      ) : null}

      {loading ? (
        <div className="p-4 rounded-xl border bg-white flex items-center gap-3 text-gray-600">
          <Spinner />
          Đang tải dữ liệu...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AdminTourForm
              form={form}
              fieldErrors={fieldErrors}
              touched={touched}
              submitted={submitted}
              guides={guides}
              loadingGuides={loadingGuides}
              onChange={onChange}
              onBlur={onBlur}
              onPickMainImage={onPickMainImage}
              currentMainImageUrl={currentMainImageUrl}
              canSubmit={canSubmit}
              saving={saving}
              onSubmit={onSubmit}
            />

            {isEdit ? <TourParticipantsCard tourId={id} /> : null}
          </div>

          {/* Right column: sticky on desktop */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 h-fit">
            <TourCurrentInfoCard
              title={form.title}
              imageUrl={currentMainImageUrl}
              finalPriceAdult={finalPriceAdult}
              startDate={form.startDate}
              endDate={form.endDate}
              durationDays={toNumberSafe(form.durationDays, 1)}
              availableSeats={toNumberSafe(form.availableSeats, 0)}
              limitSeats={toNumberSafe(form.limitSeats, 0)}
              statusLabel={statusLabel}
            />

            {/* Chỉ render editor/images khi đã có tourId (edit) */}
            {isEdit ? <TourItineraryEditor tourId={id} /> : null}

            {isEdit ? (
              <ExtraImagesManager
                type="tour"
                ownerId={id}
                baseUrl={S3_TOUR_BASE}
                readOnly={!isEdit}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
