export const API_BASE = "http://localhost:8080";

export const getPopularHotels = async () => {
  try {
    const res = await fetch(`${API_BASE}/hotels`);
    const data = await res.json();
    return (data?._embedded?.hotels || []).slice(0, 8);
  } catch (error) {
    console.error("Lỗi API: getPopularHotels", error);
    throw error;
  }
};

export const getPopularBlogs = async () => {
  try {
    const res = await fetch(`${API_BASE}/blogs`);
    const data = await res.json();

    const raw = data?._embedded?.blogs || [];
    const limited = raw.slice(0, 8);

    return limited.map((b) => ({
      id: b.blogId,
      image: `/images/blog/${b.mainImage}`,
      date: b.createdAt?.split("T")[0],
      title: b.title,
      description: b.shortDescription || "",
    }));
  } catch (error) {
    console.error("Lỗi API: getPopularBlogs", error);
    throw error;
  }
};

export const getPopularTours = async () => {
  try {
    const res = await fetch(`${API_BASE}/tours`);
    const data = await res.json();

    const raw = data?._embedded?.tours || [];
    const limited = raw.slice(0, 8);

    return limited.map((t) => ({
      id: t.tourId,
      tourId: t.tourId,
      title: t.title,
      priceAdult: t.priceAdult || 0,
      percentDiscount: t.percentDiscount || 0,
      startDate: t.startDate,
      destination: t.destination,
      description: t.shortDescription || t.description,
      mainImage: t.mainImage,
      imagesHref: t._links?.images?.href || null,
    }));
  } catch (error) {
    console.error("Lỗi API: getPopularTours", error);
    throw error;
  }
};
