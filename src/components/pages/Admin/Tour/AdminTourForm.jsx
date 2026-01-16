import React from "react";

function FieldError({ msg, show }) {
  if (!show || !msg) return null;
  return <div className="mt-1 text-sm text-red-600">{msg}</div>;
}

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
        <FieldError msg={fieldErrors.title} show={submitted || touched.title} />
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

      <div>
        <div className="text-sm font-medium mb-1">Số ngày</div>
        <input
          name="durationDays"
          type="number"
          value={form.durationDays}
          readOnly
          className="w-full border rounded-xl p-3 bg-gray-50"
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
          className="w-full border rounded-xl p-3 bg-white"
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
  );
}
