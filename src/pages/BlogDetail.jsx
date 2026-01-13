import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import BlogDetailContent from "../components/pages/DetailBlog/BlogDetailContent";
import BlogComments from "../components/pages/DetailBlog/BlogComments";
import { extractIdFromSlug } from "@/utils/slug";

const BlogDetail = () => {
  const { slugId } = useParams();

  const id = useMemo(() => extractIdFromSlug(slugId), [slugId]);

  return (
    <div className="max-w-[900px] mx-auto px-[30px] py-12">
      <BlogDetailContent />

      <div className="mt-10">
        {/* ✅ blogId phải là id thật */}
        <BlogComments blogId={id} />
      </div>
    </div>
  );
};

export default BlogDetail;
