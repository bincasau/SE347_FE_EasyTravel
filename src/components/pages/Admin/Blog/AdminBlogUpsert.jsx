import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBlogById, saveBlog } from "@/apis/Blog";
import { getCachedUser } from "@/utils/auth";
import ExtraImagesManager from "@/components/pages/admin/Common/ExtraImagesManager";

const S3_BLOG_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/blog";

export default function AdminBlogUpsert() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const me = useMemo(() => getCachedUser?.(), []);
  const myUserId = useMemo(() => (me?.sub ? Number(me.sub) : ""), [me]);

  const [form, setForm] = useState({
    title: "",
    content: "",
    tag: "",
    userId: myUserId,
    createdAt: "",
    thumbnail: "",
  });

  const [currentThumb, setCurrentThumb] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const pageTitle = isEdit ? "Cập nhật bài viết" : "Thêm bài viết mới";
  const pageDesc = isEdit
    ? "Cập nhật thông tin bài viết"
    : "Thêm mới một bài viết";
  const saveText = saving ? "Saving..." : isEdit ? "Cập nhật bài viết" : "Thêm bài viết";

  useEffect(() => {
    setForm((p) => ({ ...p, userId: myUserId }));
  }, [myUserId]);

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
              : `${S3_BLOG_BASE}/${data.thumbnail}`,
          );
        } else {
          setCurrentThumb("");
        }
      } catch (e) {
        setErr(e?.message || "Không lấy được chi tiết bài viết");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, id, myUserId]);

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
    e.target.value = "";
    if (f) setFile(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    // if (!myUserId) {
    //   setErr("Không xác định được người dùng hiện tại.");
    //   return;
    // }

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
      <div className="p-4 sm:p-6 w-full max-w-none">
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 w-full max-w-none">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold">{pageTitle}</h2>
              <p className="mt-1 text-sm text-gray-500">{pageDesc}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              Quay lại
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 text-gray-600">
            <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
            <p>{isEdit ? "Đang tải bài viết..." : "Đang chuẩn bị..."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full max-w-none">
      <div className="bg-white rounded-2xl shadow p-4 sm:p-6 w-full max-w-none">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-semibold break-words">
              {pageTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{pageDesc}</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              Quay lại
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 break-words">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7 space-y-4 min-w-0">
            <Field label="Tiêu đề" required>
              <input
                value={form.title}
                onChange={onChange("title")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
              />
            </Field>

            <Field label="Thẻ (Tag)">
              <input
                value={form.tag}
                onChange={onChange("tag")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
              />
            </Field>

            <Field label="Nội dung" required>
              <textarea
                value={form.content}
                onChange={onChange("content")}
                rows={10}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
              />
            </Field>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                disabled={saving || !canSubmit}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-900 text-white disabled:opacity-50 active:scale-[0.99]"
              >
                {saveText}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/blogs")}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                Huỷ
              </button>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="text-sm font-semibold mb-3">
                  Ảnh đại diện (Thumbnail)
                </div>

                <div className="aspect-[16/10] bg-gray-100 rounded-xl overflow-hidden">
                  {preview || currentThumb ? (
                    <img
                      src={preview || currentThumb}
                      className="w-full h-full object-cover"
                      alt="thumbnail"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      {isEdit ? "Chưa có thumbnail" : "Vui lòng chọn thumbnail"}
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
                      className="text-sm border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                    >
                      Xoá
                    </button>
                  </div>
                )}
              </div>

              {isEdit && (
                <div className="rounded-2xl border border-gray-200 p-3 sm:p-4">
                  <ExtraImagesManager
                    type="blog"
                    ownerId={Number(id)}
                    readOnly={false}
                  />
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
      <div className="text-sm font-medium mb-2 text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      {children}
    </div>
  );
}
