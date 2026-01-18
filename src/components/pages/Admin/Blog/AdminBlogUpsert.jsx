import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBlogById, saveBlog } from "@/apis/Blog";
import { getUserFromToken } from "@/utils/auth";

const S3_BLOG_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/blog";

export default function AdminBlogUpsert() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // lấy user hiện tại từ JWT
  const me = useMemo(() => getUserFromToken?.(), []);
  const myUserId = useMemo(() => (me?.sub ? Number(me.sub) : ""), [me]);

  const [form, setForm] = useState({
    title: "",
    content: "",
    tag: "",
    userId: myUserId, // luôn dùng user hiện tại
    createdAt: "",
    thumbnail: "",
  });

  const [currentThumb, setCurrentThumb] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  // đảm bảo userId luôn sync theo JWT (phòng trường hợp me load trễ)
  useEffect(() => {
    setForm((p) => ({ ...p, userId: myUserId }));
  }, [myUserId]);

  // Fetch blog detail when editing
  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const data = await getBlogById(id);

        setForm((prev) => ({
          ...prev,
          title: data.title || "",
          content: data.details || "",
          tag: data.tag || "",
          userId: myUserId,
          createdAt: data.createdAt ?? data.created_at ?? "",
          thumbnail: data.thumbnail || "",
        }));

        if (data.thumbnail) {
          setCurrentThumb(
            data.thumbnail.startsWith("http")
              ? data.thumbnail
              : `${S3_BLOG_BASE}/${data.thumbnail}`
          );
        }
      } catch (e) {
        setErr(e?.message || "Không lấy được chi tiết bài viết");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, id, myUserId]);

  // Preview uploaded thumbnail
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const canSubmit = useMemo(() => {
    return form.title.trim() && form.content.trim();
  }, [form.title, form.content]);

  const onChange = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!myUserId) {
      setErr(
        "Không xác định được người dùng hiện tại (JWT). Vui lòng đăng nhập lại."
      );
      return;
    }

    if (!canSubmit) {
      setErr("Vui lòng nhập Tiêu đề và Nội dung.");
      return;
    }

    try {
      setSaving(true);

      const base = {
        title: form.title.trim(),
        details: form.content.trim(),
        tag: form.tag?.trim() || null,
      };

      const payload = isEdit
        ? {
            blogId: Number(id),
            ...base,
            userId: myUserId,
            ...(!file && form.thumbnail ? { thumbnail: form.thumbnail } : {}),
          }
        : {
            ...base,
            userId: myUserId,
            createdAt: new Date().toISOString(),
          };

      await saveBlog(payload, file);
      navigate("/admin/blogs");
    } catch (e2) {
      setErr(e2?.message || "Lưu bài viết thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl shadow p-6">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6">
      <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold break-words">
            {isEdit ? `Sửa bài viết #${id}` : "Thêm bài viết"}
          </h2>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border hover:bg-gray-50"
          >
            Quay lại
          </button>
        </div>

        {err && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 break-words">
            {err}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="mt-6 grid grid-cols-12 gap-6"
        >
          {/* LEFT */}
          <div className="col-span-12 lg:col-span-7 space-y-4 min-w-0">
            <Field label="Tiêu đề" required>
              <input
                value={form.title}
                onChange={onChange("title")}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </Field>

            <Field label="Thẻ (Tag)">
              <input
                value={form.tag}
                onChange={onChange("tag")}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </Field>

            <Field label="Nội dung" required>
              <textarea
                value={form.content}
                onChange={onChange("content")}
                rows={10}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </Field>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                disabled={saving || !canSubmit}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-900 text-white disabled:opacity-50 active:scale-[0.99]"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/blogs")}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border hover:bg-gray-50"
              >
                Huỷ
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-12 lg:col-span-5">
            <div className="border rounded-2xl p-4">
              <div className="text-sm font-semibold mb-3">
                Ảnh đại diện (Thumbnail)
              </div>

              <div className="aspect-[16/10] bg-gray-100 rounded-xl overflow-hidden">
                {preview || currentThumb ? (
                  <img
                    src={preview || currentThumb}
                    className="w-full h-full object-cover"
                    alt="thumbnail"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Chưa có ảnh
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={onPickFile}
                className="mt-4 text-sm w-full"
              />

              {file && (
                <div className="mt-3 flex items-start justify-between gap-3">
                  <span className="text-sm text-gray-600 break-words min-w-0">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-sm border px-3 py-1 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                  >
                    Xoá
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="min-w-0">
      <div className="text-sm font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      {children}
    </div>
  );
}
