import React, { useEffect, useState } from "react";
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
import BlogComments from "./BlogComments";

export default function BlogDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const S3_BLOG_BASE =
    "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/blog";
  const blogImg = (blogId) => `${S3_BLOG_BASE}/blog_${blogId}.jpg`;

  // ✅ Fetch blog detail + tất cả blog (để xác định prev/next)
  useEffect(() => {
    const fetchData = async () => {
      try {
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
          thumbnail: blogImg(detailData.blogId),
          createdAt: new Date(detailData.createdAt).toLocaleDateString("vi-VN"),
        };

        setBlog(current);
        setAllBlogs(blogs);
      } catch (err) {
        console.error("❌ Lỗi fetch blog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
      {/* ---------- BACK BUTTON ---------- */}
      <button
        onClick={() => navigate("/blog")}
        className="flex items-center gap-2 text-gray-700 hover:text-orange-500 font-medium mb-5 transition"
      >
        <FaArrowLeft className="text-sm" />
        <span>Back</span>
      </button>

      {/* ---------- IMAGE + META ---------- */}
      <img
        src={blog.thumbnail}
        alt={blog.title}
        className="w-full h-[420px] object-cover rounded-2xl"
        onError={(e) => {
          e.currentTarget.src =
            "https://via.placeholder.com/1200x600?text=No+Image";
        }}
      />

      <div className="mt-6 text-sm text-gray-500">
        {blog.createdAt} •{" "}
        <span className="text-gray-600 font-medium">Admin</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mt-2 leading-snug">
        {blog.title}
      </h1>

      {/* ---------- CONTENT ---------- */}
      <div
        className="prose prose-lg max-w-none mt-6 text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: (blog.details || "").replace(/\n/g, "<br/>"),
        }}
      ></div>

      {/* ---------- TAGS + SHARE ---------- */}
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
            >
              <FaLink />
            </button>
          </div>
        </div>
      </div>

      {/* ---------- AUTHOR ---------- */}
      <div className="mt-10 bg-gray-50 rounded-xl p-6 flex items-center gap-4">
        <img
          src="https://i.pravatar.cc/100?img=8"
          alt="Admin"
          className="w-16 h-16 rounded-full object-cover border"
        />
        <div>
          <h4 className="font-semibold text-gray-800">Admin</h4>
          <p className="text-sm text-gray-500">Tác giả</p>
          <p className="text-gray-600 text-sm mt-1">
            Chia sẻ những trải nghiệm du lịch và đánh giá khách sạn chân thật,
            giúp bạn chọn điểm đến lý tưởng.
          </p>
        </div>
      </div>

      {/* ---------- RELATED POSTS (PREV / NEXT 2 BÊN) ---------- */}
      <div className="mt-14 border-t border-gray-100 pt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-5">
          Bài viết liên quan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* PREV */}
          <div className={`${!prevBlog ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="text-sm font-semibold text-orange-600 mb-2 flex items-center gap-2">
              
            </div>

            {prevBlog ? (
              <div
                onClick={() => navigate(`/detailblog/${prevBlog.blogId}`)}
                className="cursor-pointer group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col h-full"
              >
                <div className="w-full h-44 overflow-hidden">
                  <img
                    src={blogImg(prevBlog.blogId)}
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
                    {new Date(prevBlog.createdAt).toLocaleDateString("vi-VN")} •
                    Admin
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

          {/* NEXT */}
          <div className={`${!nextBlog ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="text-sm font-semibold text-orange-600 mb-2 flex items-center justify-end gap-2">
              
            </div>

            {nextBlog ? (
              <div
                onClick={() => navigate(`/detailblog/${nextBlog.blogId}`)}
                className="cursor-pointer group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col h-full"
              >
                <div className="w-full h-44 overflow-hidden">
                  <img
                    src={blogImg(nextBlog.blogId)}
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
                    {new Date(nextBlog.createdAt).toLocaleDateString("vi-VN")} •
                    Admin
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
      </div>

      {/* ---------- PREV / NEXT BUTTONS (GIỮ NGUYÊN NẾU BẠN MUỐN) ---------- */}
      <div className="mt-12 border-t border-gray-100 pt-8">
        <div className="flex justify-between text-sm font-medium text-orange-600 mb-5">
          <button
            disabled={!prevBlog}
            onClick={() => prevBlog && navigate(`/detailblog/${prevBlog.blogId}`)}
            className={`flex items-center gap-1 transition ${
              !prevBlog
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-orange-500"
            }`}
          >
            <span className="text-lg">←</span> Prev
          </button>

          <button
            disabled={!nextBlog}
            onClick={() => nextBlog && navigate(`/detailblog/${nextBlog.blogId}`)}
            className={`flex items-center gap-1 transition ${
              !nextBlog
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-orange-500"
            }`}
          >
            Next <span className="text-lg">→</span>
          </button>
        </div>
      </div>

      {/* ---------- COMMENTS ---------- */}
      {/* <BlogComments /> */}
    </div>
  );
}
