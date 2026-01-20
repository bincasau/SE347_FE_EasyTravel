import React from "react";

function FieldError({ msg, show }) {
  if (!show || !msg) return null;
  return <div className="mt-1 text-sm text-red-600">{msg}</div>;
}

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-3 outline-none " +
  "focus:ring-2 focus:ring-gray-200 focus:border-gray-300 " +
  "disabled:bg-gray-50 disabled:text-gray-500";

export default function AdminTourForm({
  form,
  fieldErrors,
  touched,
  submitted,
  guides,
  loadingGuides,
  onChange,
  onBlur,
  onPickMainImage,
  currentMainImageUrl,
  canSubmit,
  saving,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="lg:col-span-2 p-4 sm:p-5 rounded-2xl border border-gray-200 bg-white space-y-5"
    >
      <div>
        <div className="text-sm font-medium mb-1">Tiêu đề tour</div>
        <input
          name="title"
          value={form.title}
          onChange={onChange}
          onBlur={onBlur}
          className={inputCls}
          placeholder="Nhập tiêu đề tour"
        />
        <FieldError msg={fieldErrors.title} show={submitted || touched.title} />
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Link video</div>
        <input
          name="linkVideo"
          value={form.linkVideo}
          onChange={onChange}
          onBlur={onBlur}
          className={inputCls}
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
          className={`${inputCls} resize-none`}
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
            className={inputCls}
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
            className={inputCls}
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
            className={inputCls}
            min={0}
            max={100}
          />
          <FieldError
            msg={fieldErrors.percentDiscount}
            show={submitted || touched.percentDiscount}
          />
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Số ngày</div>
        <input
          name="durationDays"
          type="number"
          value={form.durationDays}
          readOnly
          className={`${inputCls} bg-gray-50`}
        />
        <FieldError
          msg={fieldErrors.durationDays}
          show={submitted || touched.durationDays}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium mb-1">Ngày bắt đầu</div>
          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={onChange}
            onBlur={onBlur}
            className={inputCls}
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
            className={inputCls}
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
            className={inputCls}
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
            className={inputCls}
            placeholder="Ví dụ: Hạ Long"
          />
          <FieldError
            msg={fieldErrors.destination}
            show={submitted || touched.destination}
          />
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-1">
          Hướng dẫn viên <span className="text-red-500">*</span>
        </div>

        <select
          name="tourGuideId"
          value={form.tourGuideId}
          onChange={onChange}
          onBlur={onBlur}
          disabled={loadingGuides}
          className={inputCls}
        >
          <option value="">
            {loadingGuides
              ? "Đang tải danh sách..."
              : "— Chọn hướng dẫn viên —"}
          </option>

          {guides.map((u) => {
            const gid = u.userId ?? u.id;
            const username = u.username ?? "";
            const name = u.name || u.fullName || "";
            return (
              <option key={gid} value={gid}>
                {gid} - {name}
                {username ? ` (${username})` : ""}
              </option>
            );
          })}
        </select>

        <FieldError
          msg={fieldErrors.tourGuideId}
          show={submitted || touched.tourGuideId}
        />
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
            className={inputCls}
            min={0}
          />
          <FieldError
            msg={fieldErrors.availableSeats}
            show={submitted || touched.availableSeats}
          />
        </div>

        <div>
          <div className="text-sm font-medium mb-1">Giới hạn ghế</div>
          <input
            name="limitSeats"
            type="number"
            value={form.limitSeats}
            onChange={onChange}
            onBlur={onBlur}
            className={inputCls}
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
          className={inputCls}
        >
          <option value="Canceled">Đã hủy</option>
          <option value="Passed">Đã hoạt động</option>
          <option value="Activated">Đã kích hoạt</option>
        </select>
        <FieldError
          msg={fieldErrors.status}
          show={submitted || touched.status}
        />
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Ảnh đại diện</div>

        {/* File input đẹp hơn */}
        <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
          <span>Chọn ảnh đại diện...</span>
          <input
            type="file"
            accept="image/*"
            onChange={onPickMainImage}
            className="hidden"
          />
        </label>

        {currentMainImageUrl ? (
          <img
            src={currentMainImageUrl}
            alt="Ảnh đại diện"
            className="mt-3 w-full h-56 sm:h-64 object-cover rounded-2xl bg-gray-100 border border-gray-200"
            loading="lazy"
          />
        ) : (
          <div className="mt-3 w-full h-56 sm:h-64 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
            Chưa có ảnh đại diện
          </div>
        )}
      </div>

      {/* Actions: mobile full width */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!canSubmit || saving}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-black text-white disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Spinner /> Đang lưu...
            </>
          ) : (
            "Lưu thay đổi"
          )}
        </button>
      </div>
    </form>
  );
}
