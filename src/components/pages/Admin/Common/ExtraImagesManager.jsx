import { useEffect, useMemo, useRef, useState } from "react";
import { getExtras, uploadExtra, deleteExtra } from "@/apis/ExtraImageAPI";

const S3_IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/image";

export default function ExtraImagesManager({ type, ownerId, readOnly = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const replaceTargetRef = useRef(null);
  const replaceInputRef = useRef(null);

  const canLoad = useMemo(() => !!type && !!ownerId, [type, ownerId]);

  const imageSrc = (it) => {
    const u = it?.url || "";
    if (!u) return "";
    if (u.startsWith("http")) return u;
    return `${S3_IMAGE_BASE}/${u}`;
  };

  async function refresh() {
    if (!canLoad) return;
    try {
      setLoading(true);
      setErr("");
      const list = await getExtras({ type, id: ownerId });
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(e?.message || "Load images failed");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, ownerId]);

  async function handleAdd(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    try {
      setBusy(true);
      setErr("");
      for (const f of files) {
        await uploadExtra({ type, id: ownerId, file: f });
      }
      await refresh();
    } catch (e2) {
      setErr(e2?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(imageId) {
    if (!window.confirm("Xóa ảnh này?")) return;
    try {
      setBusy(true);
      setErr("");
      await deleteExtra(imageId);
      setItems((prev) => prev.filter((x) => x.imageId !== imageId));
    } catch (e) {
      setErr(e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  function startReplace(item) {
    replaceTargetRef.current = item;
    replaceInputRef.current?.click();
  }

  async function handleReplace(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const target = replaceTargetRef.current;
    replaceTargetRef.current = null;
    if (!target) return;

    try {
      setBusy(true);
      setErr("");
      await uploadExtra({ type, id: ownerId, file });
      await deleteExtra(target.imageId);
      await refresh();
    } catch (e2) {
      setErr(e2?.message || "Replace failed");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">Ảnh phụ</h3>
          <p className="text-sm text-gray-500 break-words">
            {type} — ID: {ownerId}
          </p>
        </div>

        {!readOnly && (
          <label className="w-full sm:w-auto">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleAdd}
              disabled={!canLoad || busy}
              className="hidden"
            />
            <span
              className={[
                "block text-center w-full sm:w-auto",
                "px-4 py-2 rounded-xl text-sm font-medium cursor-pointer select-none",
                busy || !canLoad
                  ? "bg-gray-200 text-gray-600"
                  : "bg-black text-white hover:opacity-90",
              ].join(" ")}
            >
              {busy ? "Đang xử lý..." : "Thêm ảnh"}
            </span>
          </label>
        )}
      </div>

      {err && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm break-words">
          {err}
        </div>
      )}

      {!canLoad ? (
        <div className="text-sm text-gray-500">
          Thiếu <b>type</b> hoặc <b>ownerId</b> nên chưa load được ảnh.
        </div>
      ) : loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">Chưa có ảnh phụ.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((it) => (
            <div
              key={it.imageId}
              className="relative border rounded-2xl overflow-hidden bg-gray-50"
            >
              {/* delete button */}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleDelete(it.imageId)}
                  disabled={busy}
                  className="absolute top-2 right-2 z-10
                             w-7 h-7 rounded-full
                             bg-black/60 text-white text-xs
                             flex items-center justify-center
                             hover:bg-red-600 disabled:opacity-60"
                  aria-label="Delete"
                  title="Delete"
                >
                  ✕
                </button>
              )}

              <div className="aspect-[4/3] bg-gray-100">
                <img
                  src={imageSrc(it)}
                  alt={it.altText || it.title || "extra"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="p-3">
                <div className="text-sm font-medium line-clamp-1">
                  {it.title || `Image #${it.imageId}`}
                </div>
                <div className="text-xs text-gray-500 line-clamp-1">
                  {it.altText || it.url}
                </div>

                {!readOnly && (
                  <button
                    type="button"
                    className="mt-3 w-full text-sm px-3 py-2 rounded-xl
                               bg-white border hover:bg-gray-100 disabled:opacity-60"
                    onClick={() => startReplace(it)}
                    disabled={busy}
                  >
                    Sửa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplace}
      />
    </div>
  );
}
