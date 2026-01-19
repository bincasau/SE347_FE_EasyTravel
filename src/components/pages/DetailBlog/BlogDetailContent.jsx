import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaPinterestP,
  FaWhatsapp,
  FaLink,
  FaArrowLeft,
} from "react-icons/fa";

import { extractIdFromSlug, buildTourSlug } from "@/utils/slug";

export default function BlogDetailContent() {
  const { slugId } = useParams();
  const navigate = useNavigate();

  const id = useMemo(() => extractIdFromSlug(slugId), [slugId]);

  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: list ảnh extra hợp lệ (tồn tại)
  const [validExtraImgs, setValidExtraImgs] = useState([]);

  const S3_BLOG_MAIN =
    "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/blog";
  const S3_BLOG_IMAGE =
    "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/image";

  const blogMainImg = (blogId) => `${S3_BLOG_MAIN}/blog_${blogId}.jpg`;
  const blogExtraImg = (blogId, idx) =>
    `${S3_BLOG_IMAGE}/blog_${blogId}_img_${idx}.jpg`;

  // ✅ helper: check image exists
  const checkImage = (url) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) throw new Error("URL không hợp lệ (thiếu id blog).");

        const [detailRes, allRes] = await Promise.all([
          fetch(`http://localhost:8080/blogs/${id}`),
          fetch("http://localhost:8080/blogs?page=0&size=9999"),
        ]);

        if (!detailRes.ok) throw new Error("Không thể tải blog detail");
        if (!allRes.ok) throw new Error("Không thể tải list blogs");

        const detailData = await detailRes.json();
        const allData = await allRes.json();

        const blogs = allData._embedded ? allData._embedded.blogs : [];

        const current = {
          id: detailData.blogId,
          title: detailData.title,
          details: detailData.details || "",
          thumbnail: blogMainImg(detailData.blogId),
          createdAt: detailData.createdAt
            ? new Date(detailData.createdAt).toLocaleDateString("vi-VN")
            : "",
        };

        setBlog(current);
        setAllBlogs(blogs);

        // ✅ redirect về slug đúng nếu gõ sai
        const correctSlugId = buildTourSlug(current.id, current.title);
        if (slugId !== correctSlugId) {
          navigate(`/detailblog/${correctSlugId}`, { replace: true });
        }

        // ✅ NEW: kiểm tra ảnh extra tồn tại thì mới render
        const candidates = [1, 2].map((idx) => blogExtraImg(current.id, idx));
        const okList = await Promise.all(candidates.map(checkImage));
        const valid = candidates.filter((_, i) => okList[i]);
        setValidExtraImgs(valid);
      } catch (err) {
        console.error("❌ Lỗi fetch blog:", err);
        setBlog(null);
        setAllBlogs([]);
        setValidExtraImgs([]);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchData();
  }, [id, slugId, navigate]);

  if (loading)
    return (
      <div className="text-center text-gray-500 py-12">
        Đang tải chi tiết bài viết...
      </div>
    );

  if (!blog)
    return (
      <div className="text-center text-red-500 py-12">
        Không tìm thấy bài viết.
      </div>
    );

  const index = allBlogs.findIndex((b) => String(b.blogId) === String(id));
  const prevBlog = index > 0 ? allBlogs[index - 1] : null;
  const nextBlog =
    index >= 0 && index < allBlogs.length - 1 ? allBlogs[index + 1] : null;

  const goToBlog = (b) => {
    if (!b?.blogId) return;
    const slug = buildTourSlug(b.blogId, b.title);
    navigate(`/detailblog/${slug}`);
  };

  const currentUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(blog.title);
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${currentUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${currentUrl}&title=${shareText}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${currentUrl}&description=${shareText}`,
    whatsapp: `https://api.whatsapp.com/send?text=${shareText}%20${currentUrl}`,
  };

  return (
    <div>
      <button
        onClick={() => navigate("/blog")}
        className="flex items-center gap-2 text-gray-700 hover:text-orange-500 font-medium mb-5 transition"
      >
        <FaArrowLeft className="text-sm" />
        <span>Back</span>
      </button>

      <img
        src={blog.thumbnail}
        alt={blog.title}
        className="w-full h-[420px] object-cover rounded-2xl"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src =
            "https://via.placeholder.com/1200x600?text=No+Image";
        }}
      />

      <div className="mt-6 text-sm text-gray-500">
        {blog.createdAt} • <span className="text-gray-600 font-medium">Admin</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mt-2 leading-snug">
        {blog.title}
      </h1>

      <div className="mt-6 rounded-2xl border bg-white p-6 md:p-8 shadow-sm">
        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed prose-p:my-4"
          dangerouslySetInnerHTML={{
            __html: (blog.details || "").replace(/\n/g, "<br/>"),
          }}
        />
      </div>

      {/* ✅ EXTRA IMAGES: chỉ render khi có ảnh thật */}
      {validExtraImgs.length > 0 && (
        <div className="mt-10">
          <div
            className={`grid grid-cols-1 md:grid-cols-${
              validExtraImgs.length >= 2 ? "2" : "1"
            } gap-6`}
          >
            {validExtraImgs.map((src, i) => (
              <div
                key={`${blog.id}-extra-${i}`}
                className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition"
              >
                <img
                  src={src}
                  alt={`blog-${blog.id}-img-${i + 1}`}
                  className="w-full h-72 object-cover hover:scale-[1.03] transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between mt-10 border-b border-gray-100 pb-6">
        <div className="flex gap-2 flex-wrap">
          {["Du lịch", "Trải nghiệm", "Khách sạn"].map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
            >
              {tag}
            </span>
          ))}
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Chia sẻ:</h3>
          <div className="flex gap-4 text-gray-600 text-lg">
            {Object.entries(shareLinks).map(([key, link]) => (
              <a
                key={key}
                href={link}
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-500"
              >
                {key === "facebook" && <FaFacebookF />}
                {key === "twitter" && <FaTwitter />}
                {key === "linkedin" && <FaLinkedinIn />}
                {key === "pinterest" && <FaPinterestP />}
                {key === "whatsapp" && <FaWhatsapp />}
              </a>
            ))}
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="hover:text-gray-800"
              title="Copy link"
            >
              <FaLink />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-14 border-t border-gray-100 pt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-5">
          Bài viết liên quan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className={`${!prevBlog ? "opacity-50 pointer-events-none" : ""}`}>
            {prevBlog ? (
              <div
                onClick={() => goToBlog(prevBlog)}
                className="cursor-pointer group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col h-full"
              >
                <div className="w-full h-44 overflow-hidden">
                  <img
                    src={blogMainImg(prevBlog.blogId)}
                    alt={prevBlog.title}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-gray-500">
                    {prevBlog.createdAt
                      ? new Date(prevBlog.createdAt).toLocaleDateString("vi-VN")
                      : "--"}{" "}
                    • Admin
                  </p>
                  <p className="mt-2 font-medium text-gray-800 group-hover:text-orange-500 line-clamp-2">
                    {prevBlog.title}
                  </p>
                  <div className="flex-1" />
                  <p className="mt-3 text-sm text-orange-500 font-semibold">
                    Xem thêm →
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-gray-500 text-sm">
                Không có bài trước
              </div>
            )}
          </div>

          <div className={`${!nextBlog ? "opacity-50 pointer-events-none" : ""}`}>
            {nextBlog ? (
              <div
                onClick={() => goToBlog(nextBlog)}
                className="cursor-pointer group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col h-full"
              >
                <div className="w-full h-44 overflow-hidden">
                  <img
                    src={blogMainImg(nextBlog.blogId)}
                    alt={nextBlog.title}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-gray-500">
                    {nextBlog.createdAt
                      ? new Date(nextBlog.createdAt).toLocaleDateString("vi-VN")
                      : "--"}{" "}
                    • Admin
                  </p>
                  <p className="mt-2 font-medium text-gray-800 group-hover:text-orange-500 line-clamp-2">
                    {nextBlog.title}
                  </p>
                  <div className="flex-1" />
                  <p className="mt-3 text-sm text-orange-500 font-semibold">
                    Xem thêm →
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-gray-500 text-sm text-right">
                Không có bài sau
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6">
          <div className="flex justify-between text-sm font-medium text-orange-600">
            <button
              disabled={!prevBlog}
              onClick={() => prevBlog && goToBlog(prevBlog)}
              className={`flex items-center gap-2 transition ${
                !prevBlog ? "opacity-50 cursor-not-allowed" : "hover:text-orange-500"
              }`}
            >
              <span className="text-lg">←</span> Prev
            </button>

            <button
              disabled={!nextBlog}
              onClick={() => nextBlog && goToBlog(nextBlog)}
              className={`flex items-center gap-2 transition ${
                !nextBlog ? "opacity-50 cursor-not-allowed" : "hover:text-orange-500"
              }`}
            >
              Next <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments: bạn đang render ở page BlogDetail rồi, nên ở đây không cần */}
    </div>
  );
}
