// src/components/admin/TourItineraryEditor.jsx
import { useEffect, useState } from "react";
import {
  getItinerariesByTourId,
  addItineraryAdmin,
  updateItineraryAdmin,
  deleteItineraryAdmin,
} from "@/apis/Itinerary";

const emptyForm = { title: "", dayNumber: 1, activities: "" };

export default function TourItineraryEditor({ tourId }) {
  const [list, setList] = useState([]);

  // add form (vertical)
  const [form, setForm] = useState(emptyForm);

  // inline edit (edit inside card, not 3 inputs)
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const canEdit = !!tourId;

  async function reload() {
    if (!tourId) return;
    setErr("");
    setLoading(true);
    try {
      const arr = await getItinerariesByTourId(tourId); // API trả array
      const items = Array.isArray(arr) ? arr : [];
      items.sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0));
      setList(items);
    } catch (e) {
      setErr(e?.message || "Load itineraries failed");
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  async function handleAdd() {
    if (!canEdit) return;

    const payload = {
      title: (form.title || "").trim(),
      dayNumber: Number(form.dayNumber || 1),
      activities: (form.activities || "").trim(),
    };

    if (!payload.title || !payload.activities) {
      setErr("Không được để trống tiêu đề / hoạt động");
      return;
    }

    setBusy(true);
    setErr("");
    try {
      await addItineraryAdmin(tourId, payload);
      setForm(emptyForm);
      await reload();
    } catch (e) {
      setErr(e?.message || "Add failed");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(it) {
    setErr("");
    setEditId(it.itineraryId);
    setEditForm({
      title: it.title ?? "",
      dayNumber: Number(it.dayNumber ?? 1),
      activities: it.activities ?? "",
    });
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm(emptyForm);
  }

  async function handleUpdate() {
    if (!canEdit || !editId) return;

    const payload = {
      title: (editForm.title || "").trim(),
      dayNumber: Number(editForm.dayNumber || 1),
      activities: (editForm.activities || "").trim(),
    };

    if (!payload.title || !payload.activities) {
      setErr("Không được để trống tiêu đề / hoạt động");
      return;
    }

    setBusy(true);
    setErr("");
    try {
      await updateItineraryAdmin(editId, payload);
      cancelEdit();
      await reload();
    } catch (e) {
      setErr(e?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(itineraryId) {
    if (!canEdit) return;
    if (!window.confirm("Xóa lịch trình này?")) return;

    setBusy(true);
    setErr("");
    try {
      await deleteItineraryAdmin(itineraryId);
      if (editId === itineraryId) cancelEdit();
      await reload();
    } catch (e) {
      setErr(e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-5 rounded-2xl border bg-white">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="font-semibold text-lg">Lịch trình</div>
        {!canEdit && (
          <div className="text-sm text-gray-500">
            Lưu tour trước để thêm/sửa/xóa lịch trình
          </div>
        )}
      </div>

      {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

      {/* ADD (3 ô hàng dọc) */}
      <div className={`${!canEdit ? "opacity-60" : ""}`}>
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-1">Tiêu đề</div>
            <input
              className="w-full border rounded-xl px-3 py-2"
              placeholder="Ngày 1 – ..."
              value={form.title}
              disabled={!canEdit || busy}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Ngày</div>
            <input
              type="number"
              min={1}
              className="w-full border rounded-xl px-3 py-2"
              value={form.dayNumber}
              disabled={!canEdit || busy}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  dayNumber: Number(e.target.value || 1),
                }))
              }
            />
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Hoạt động</div>
            <textarea
              className="w-full border rounded-xl px-3 py-2 min-h-[120px]"
              placeholder="Nhập nội dung hoạt động..."
              value={form.activities}
              disabled={!canEdit || busy}
              onChange={(e) =>
                setForm((p) => ({ ...p, activities: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex justify-end mt-3">
          <button
            type="button"
            className="rounded-xl bg-black text-white px-5 py-2.5 disabled:opacity-60"
            disabled={!canEdit || busy}
            onClick={handleAdd}
          >
            {busy ? "Đang xử lý..." : "Thêm"}
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="mt-6">
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : list.length === 0 ? (
          <div className="text-sm text-gray-500">Chưa có lịch trình</div>
        ) : (
          <div className="space-y-4">
            {list.map((it) => {
              const iid = it.itineraryId;
              const isEditing = editId === iid;

              const day = isEditing ? editForm.dayNumber : it.dayNumber;
              const title = isEditing ? editForm.title : it.title;
              const activities = isEditing
                ? editForm.activities
                : it.activities;

              return (
                <div key={iid} className="border rounded-2xl p-4 bg-white">
                  {/* giữ layout giống card view */}
                  <div className="text-xs text-gray-500 mb-1">Ngày {day}</div>

                  {/* title: khi sửa -> input nhưng vẫn giữ style "to" */}
                  {isEditing ? (
                    <input
                      className="w-full text-xl font-semibold border rounded-xl px-3 py-2"
                      value={editForm.title}
                      disabled={busy}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, title: e.target.value }))
                      }
                    />
                  ) : (
                    <div className="text-xl font-semibold break-words">
                      {title}
                    </div>
                  )}

                  {/* activities: khi sửa -> textarea full width */}
                  <div className="mt-3">
                    {isEditing ? (
                      <textarea
                        className="w-full border rounded-xl px-3 py-2 min-h-[140px]"
                        value={editForm.activities}
                        disabled={busy}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            activities: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <div className="text-sm text-gray-700 whitespace-pre-line break-words">
                        {activities}
                      </div>
                    )}
                  </div>

                  {/* dayNumber: khi sửa -> input nhỏ nhưng đặt dưới, không làm layout bé */}
                  {isEditing ? (
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-1">Ngày</div>
                      <input
                        type="number"
                        min={1}
                        className="w-full border rounded-xl px-3 py-2"
                        value={editForm.dayNumber}
                        disabled={busy}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            dayNumber: Number(e.target.value || 1),
                          }))
                        }
                      />
                    </div>
                  ) : null}

                  {/* actions luôn ở dưới */}
                  {canEdit && (
                    <div className="mt-4 flex justify-end gap-2">
                      {!isEditing ? (
                        <>
                          <button
                            type="button"
                            className="border rounded-xl px-4 py-2 bg-white hover:bg-gray-50 disabled:opacity-60"
                            disabled={busy}
                            onClick={() => startEdit(it)}
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            className="border border-red-200 text-red-700 bg-red-50 rounded-xl px-4 py-2 hover:bg-red-100 disabled:opacity-60"
                            disabled={busy}
                            onClick={() => handleDelete(iid)}
                          >
                            Xóa
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="border rounded-xl px-4 py-2 bg-white hover:bg-gray-50 disabled:opacity-60"
                            disabled={busy}
                            onClick={cancelEdit}
                          >
                            Hủy
                          </button>

                          <button
                            type="button"
                            className="rounded-xl bg-black text-white px-4 py-2 disabled:opacity-60"
                            disabled={busy}
                            onClick={handleUpdate}
                          >
                            Cập nhật
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
