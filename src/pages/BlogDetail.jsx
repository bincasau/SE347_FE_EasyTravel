import React from "react";
import BlogDetailContent from "../components/pages/DetailBlog/BlogDetailContent";
import BlogComments from "../components/pages/DetailBlog/BlogComments";

const BlogDetail = () => {
  return (
    <div className="max-w-[900px] mx-auto px-[30px] py-12">
      {/* Nội dung chính */}
      <BlogDetailContent />

      {/* Bình luận */}
      <BlogComments />
    </div>
  );
};

export default BlogDetail;
