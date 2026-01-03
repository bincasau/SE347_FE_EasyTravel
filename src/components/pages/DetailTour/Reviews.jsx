import React, { useEffect, useMemo, useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

const API_BASE = "http://localhost:8080";

// ✅ chỉnh base avatar theo bucket bạn (đổi 1 dòng nếu cần)
const S3_AVATAR_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/image";

// ✅ Ví dụ rule avatar: user_{id}.jpg
const userAvatarUrl = (userId) =>
  userId != null ? `${S3_AVATAR_BASE}/user_${userId}.jpg` : "";

// ✅ fetch helper có kèm JWT giống style bạn đang làm ở booking.jsx
async function fetchWithJwt(url, options = {}) {
  const token = localStorage.getItem("jwt");
  const finalUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

  return fetch(finalUrl, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

function Avatar({ name, src }) {
  const [imgOk, setImgOk] = useState(true);
  const initial = (name || "A").trim().charAt(0).toUpperCase();

  if (!src || !imgOk) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-xs font-semibold">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || "user"}
      className="w-8 h-8 rounded-full object-cover border"
      onError={() => setImgOk(false)}
      loading="lazy"
    />
  );
}

export default function Reviews({ tourId }) {
  const [reviews, setReviews] = useState([]);
  const [showAll, setShowAll] = useState(false);

  // cache user theo href (hoặc theo id nếu BE trả id)
  const [userMap, setUserMap] = useState({}); // { [hrefOrId]: userObj }

  // 1) Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetchWithJwt(`/tours/${tourId}/reviews`);
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data = await res.json();

        const items = data?._embedded?.reviews || data || [];

        // ✅ sort rating cao -> thấp
        const sorted = [...items].sort(
          (a, b) => (b.rating || 0) - (a.rating || 0)
        );

        setReviews(sorted);
      } catch (err) {
        console.error("❌ Error fetching reviews:", err);
      }
    };

    if (tourId) fetchReviews();
  }, [tourId]);

  // 2) Gom danh sách user cần fetch (ưu tiên link user)
  const userRefs = useMemo(() => {
    const refs = new Set();

    for (const r of reviews) {
      const href = r?._links?.user?.href;
      if (href) {
        refs.add(href);
        continue;
      }

      const uid = r?.user?.userId ?? r?.userId ?? r?.user_id;
      if (uid != null) refs.add(String(uid));
    }

    return [...refs];
  }, [reviews]);

  // 3) Fetch user theo refs (kèm JWT)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const need = userRefs.filter((ref) => !userMap[ref]);
        if (!need.length) return;

        const results = await Promise.all(
          need.map(async (ref) => {
            const url = ref.startsWith("http") ? ref : `/user/${ref}`;
            const res = await fetchWithJwt(url);
            if (!res.ok) return [ref, null];
            const u = await res.json();
            return [ref, u];
          })
        );

        setUserMap((prev) => {
          const next = { ...prev };
          results.forEach(([ref, u]) => {
            if (u) next[ref] = u;
          });
          return next;
        });
      } catch (err) {
        console.error("❌ Error fetching users:", err);
      }
    };

    if (userRefs.length) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRefs]);

  // 4) Helpers
  const visibleReviews = showAll ? reviews : reviews.slice(0, 6);

  const getCreatedAt = (r) => r?.createdAt ?? r?.created_at ?? null;

  const getUserIdFromReview = (r) =>
    r?.user?.userId ?? r?.userId ?? r?.user_id ?? null;

  const getReviewerName = (r) => {
    if (r?.reviewerName) return r.reviewerName;
    if (r?.user?.name) return r.user.name;

    const href = r?._links?.user?.href;
    if (href && userMap[href]?.name) return userMap[href].name;

    const uid = getUserIdFromReview(r);
    if (uid != null && userMap[String(uid)]?.name) return userMap[String(uid)].name;

    return "Anonymous";
  };

  // ✅ avatar: ưu tiên lấy userId để build URL
  const getReviewerAvatar = (r) => {
    const uid = getUserIdFromReview(r);

    // Nếu user object có avatar field (nếu sau này BE trả), dùng luôn:
    if (r?.user?.avatar) return r.user.avatar;

    const href = r?._links?.user?.href;
    if (href && userMap[href]?.avatar) return userMap[href].avatar;

    // Fallback theo S3 rule
    if (uid != null) return userAvatarUrl(uid);

    return "";
  };

  if (!reviews.length) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-10 text-gray-500">
        <h2 className="text-5xl font-podcast text-gray-800 mb-6">Reviews</h2>
        <p>No reviews yet for this tour.</p>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-5xl font-podcast text-gray-800 mb-10">Reviews</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleReviews.map((r, i) => {
          const name = getReviewerName(r);
          const avatarSrc = getReviewerAvatar(r);

          return (
            <div
              key={r.reviewId ?? r.review_id ?? i}
              className="rounded-2xl border border-gray-200 p-5 bg-white shadow-sm hover:shadow-md transition"
            >
              {/* Stars */}
              <div className="flex mb-2">
                {[...Array(5)].map((_, idx) =>
                  idx < (r.rating || 0) ? (
                    <FaStar key={idx} className="text-orange-400" />
                  ) : (
                    <FaRegStar key={idx} className="text-gray-300" />
                  )
                )}
              </div>

              {/* Comment */}
              <p className="text-gray-700 text-sm mb-4 italic line-clamp-4">
                "{r.comment}"
              </p>

              {/* Reviewer info + avatar */}
              <div className="flex items-center gap-3">
                <Avatar name={name} src={avatarSrc} />

                <div className="text-sm text-gray-600">
                  <div className="font-semibold text-gray-800">{name}</div>
                  {getCreatedAt(r) && (
                    <div className="text-[12px] text-gray-400">
                      {new Date(getCreatedAt(r)).toLocaleDateString("vi-VN")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more/less */}
      {reviews.length > 6 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="text-orange-500 text-sm font-medium hover:underline"
          >
            {showAll ? "Show less" : "Show more..."}
          </button>
        </div>
      )}
    </section>
  );
}
