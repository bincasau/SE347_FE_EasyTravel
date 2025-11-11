import React from "react";
import { useParams } from "react-router-dom";
import BlogDetailContent from "../components/pages/DetailBlog/BlogDetailContent";
import BlogComments from "../components/pages/DetailBlog/BlogComments";

const BlogDetail = () => {
  const { id } = useParams(); // ✅ Lấy id từ URL

  return (
    <div className="max-w-[900px] mx-auto px-[30px] py-12">
      {/* Nội dung chính */}
      <BlogDetailContent />

      {/* Bình luận */}
      <div className="mt-10">
        <BlogComments blogId={id} />
      </div>
    </div>
  );
};

export default BlogDetail;
