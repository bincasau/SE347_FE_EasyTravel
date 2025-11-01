import React from "react";

const BlogComments = () => {
  return (
    <div className="mt-10">
      {/* --- Comments Section --- */}
      <h3 className="font-semibold text-gray-800 mb-3">1 Comment</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <img
            src="https://i.pravatar.cc/80?img=12"
            alt="comment"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold text-gray-800">Jonathan Doe</p>
            <p className="text-xs text-gray-500">April 21, 2023</p>
          </div>
        </div>
        <p className="text-gray-700 text-sm">
          Objectively productive just in time information with dynamic channels.
          Energetically exploit seamless growth strategies after 24/7 experiences.
        </p>
      </div>

      {/* --- Reply Form --- */}
      <div className="mt-10 bg-gray-50 p-6 rounded-xl">
        <h3 className="font-semibold text-gray-800 mb-4">Leave Reply</h3>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email address"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <textarea
            rows="4"
            placeholder="Write your comment"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
          <button
            type="submit"
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Post Comment
          </button>
        </form>
      </div>
    </div>
  );
};

export default BlogComments;
