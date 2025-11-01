import React, { useState } from "react";
import BlogCard from "../components/pages/Blog/BlogCard";
import BlogSidebar from "../components/pages/Blog/BlogSiderbar";
import Pagination from "../utils/Pagination";
import Blog1 from "../assets/images/Blog/blog1.jpg";
import Blog2 from "../assets/images/Blog/blog2.jpg";
import Blog3 from "../assets/images/Blog/blog3.jpg";
import Blog4 from "../assets/images/Blog/blog4.jpg";
import Blog5 from "../assets/images/Blog/blog5.jpg";
import Blog6 from "../assets/images/Blog/blog6.jpg";
import Blog7 from "../assets/images/Blog/blog7.jpg";
import Blog8 from "../assets/images/Blog/blog8.jpg";
import Blog9 from "../assets/images/Blog/blog9.jpg";
import Blog10 from "../assets/images/Blog/blog10.jpg";

const Blog = () => {
  const blogs = [
    {
      image: Blog1,
      date: "July 13, 2023",
      author: "Admin",
      title: "The Impact of Covid-19 on travel & tourism industry",
      description:
        "Istanbul, the vibrant and historic city straddling the continents of Europe and Asia, offers an enchanting blend of cultures, sights, and experiences that captivate...",
    },
    {
      image: Blog2,
      date: "July 15, 2023",
      author: "Admin",
      title: "Exploring the ancient wonders of Egypt",
      description:
        "From the majestic pyramids to the bustling bazaars of Cairo, Egypt invites you to explore the cradle of civilization...",
    },
    {
      image: Blog3,
      date: "July 18, 2023",
      author: "Admin",
      title: "Top 10 travel destinations for 2024",
      description:
        "Discover breathtaking locations across the globe that should be on every traveler’s bucket list this year...",
    },
    {
      image: Blog4,
      date: "July 20, 2023",
      author: "Admin",
      title: "Cultural gems of Southeast Asia",
      description:
        "Immerse yourself in the diverse traditions, cuisines, and landscapes of Southeast Asia — a paradise for explorers...",
    },
    {
      image: Blog5,
      date: "July 22, 2023",
      author: "Admin",
      title: "The ultimate guide to sustainable travel",
      description:
        "Travel responsibly with these tips to reduce your carbon footprint while exploring the beauty of our planet...",
    },
    {
      image: Blog6,
      date: "July 25, 2023",
      author: "Admin",
      title: "Hidden beaches you must visit in Europe",
      description:
        "Escape the crowds with these secret European coastal gems that promise tranquility and crystal-clear waters...",
    },
    {
      image: Blog7,
      date: "July 27, 2023",
      author: "Admin",
      title: "Backpacking essentials for solo travelers",
      description:
        "Make your solo adventures safe and memorable with these must-have travel essentials...",
    },
    {
      image: Blog8,
      date: "July 29, 2023",
      author: "Admin",
      title: "Discovering the charm of small towns in Italy",
      description:
        "Explore the heart of Italy through its picturesque villages, cobblestone streets, and authentic cuisine...",
    },
    {
      image: Blog9,
      date: "August 1, 2023",
      author: "Admin",
      title: "Why mountain hiking boosts mental health",
      description:
        "Research shows that hiking not only strengthens your body but also rejuvenates your mind...",
    },
    {
      image: Blog10,
      date: "August 3, 2023",
      author: "Admin",
      title: "Packing smart: Travel light without missing essentials",
      description:
        "Learn how to pack efficiently for your next trip — light, organized, and stress-free...",
    },
  ];

  // Pagination setup: 5 blogs per page
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;
  const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);

  return (
    <div className="max-w-[1150px] mx-auto px-[70px] py-12 lg:flex gap-8">
      {/* Left: Blog List */}
      <div className="lg:w-[68%] w-full">
        {currentBlogs.map((blog, index) => (
          <BlogCard key={index} {...blog} />
        ))}
        <div className="mt-8">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Right: Sidebar */}
      <BlogSidebar />
    </div>
  );
};

export default Blog;
