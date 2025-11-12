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
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch blog detail + tất cả blog (để xác định prev/next + related)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detailRes, allRes] = await Promise.all([
          fetch(`http://localhost:8080/blogs/${id}`),
          fetch("http://localhost:8080/blogs?page=0&size=9999"),
        ]);

        const detailData = await detailRes.json();
        const allData = await allRes.json();

        const blogs = allData._embedded ? allData._embedded.blogs : [];

        const current = {
          id: detailData.blogId,
          title: detailData.title,
          details: detailData.details,
          // ✅ Dùng ảnh tĩnh từ thư mục /images/blog/
          thumbnail: `/images/blog/blog_${detailData.blogId}_img_1.jpg`,
          createdAt: new Date(detailData.createdAt).toLocaleDateString("vi-VN"),
        };

        setBlog(current);
        setAllBlogs(blogs);

        // ✅ Random 3 bài liên quan khác
        const others = blogs
          .filter((b) => b.blogId !== detailData.blogId)
          .slice(0, 3);
        setRelated(others);
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
  const prevBlog = allBlogs[index - 1];
  const nextBlog = allBlogs[index + 1];

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
          __html: blog.details.replace(/\n/g, "<br/>"),
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
              onClick={() =>
                navigator.clipboard.writeText(window.location.href)
              }
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

      {/* ---------- RELATED POSTS ---------- */}
      {related.length > 0 && (
        <div className="mt-14 border-t border-gray-100 pt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-5">
            Bài viết liên quan
          </h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((r) => (
              <div
                key={r.blogId}
                onClick={() => navigate(`/detailblog/${r.blogId}`)}
                className="cursor-pointer group"
              >
                <div className="w-full h-44 overflow-hidden rounded-lg">
                  <img
                    src={`/images/blog/blog_${r.blogId}_img_1.jpg`}
                    alt={r.title}
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://via.placeholder.com/300x200?text=No+Image")
                    }
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(r.createdAt).toLocaleDateString("vi-VN")} • Admin
                </p>
                <p className="font-medium text-gray-800 group-hover:text-orange-500 line-clamp-2">
                  {r.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- PREV / NEXT ---------- */}
      <div className="mt-12 border-t border-gray-100 pt-8">
        <div className="flex justify-between text-sm font-medium text-orange-600 mb-5">
          <button
            disabled={!prevBlog}
            onClick={() =>
              prevBlog && navigate(`/detailblog/${prevBlog.blogId}`)
            }
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
            onClick={() =>
              nextBlog && navigate(`/detailblog/${nextBlog.blogId}`)
            }
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
    </div>
  );
}
