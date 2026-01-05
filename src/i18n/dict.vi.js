import Tour from "../models/Tour";

export const vi = {
  // ===== HEADER =====
  header: {
    home: "Trang chủ",
    about: "Về chúng tôi",
    tours: "Tour du lịch",
    hotel: "Khách sạn",
    blog: "Bài viết",
    contact: "Liên hệ",
    login: "Đăng nhập",
    signup: "Đăng ký",
    logout: "Đăng xuất",
    users: "Người dùng",
    dashboard: "Bảng điều khiển",
  },

  // ===== FOOTER =====
  footer: {
    services: "Dịch vụ",
    help: "Hỗ trợ",
    contacts: "Liên hệ",
    social_media: "Mạng xã hội",
    contact_us: "Liên hệ",
    about_us: "Về chúng tôi",
    tour_packages: "Gói tour du lịch",
    book_tour: "Đặt tour",
    book_hotel: "Đặt khách sạn",
    terms_of_use: "Điều khoản sử dụng",
    privacy_policy: "Chính sách bảo mật",
    address: "Địa chỉ",
    phone: "Số điện thoại",
    email: "Email",
    copyright: "© 2025 EasyTravel. Bảo lưu mọi quyền.",
  },

  // ===== HOME PAGE =====
  home: {
    hero: {
      title: "Tận hưởng chuyến đi theo cách tuyệt vời nhất!",
      subtitle: "Trải nghiệm dịch vụ du lịch của chúng tôi mọi lúc, mọi nơi",
      publicTour: "Tour ghép đoàn",
      privateTour: "Tour riêng",
      people: "Số lượng người",
      chooseNumber: "Chọn số người",
      startDate: "Ngày khởi hành",
      endDate: "Ngày kết thúc",
      departure: "Điểm khởi hành",
      selectDeparture: "Chọn điểm khởi hành",
      destination: "Điểm đến",
      selectDestination: "Chọn điểm đến",
    },
    popularTours: {
      title: "Khám phá các tour nổi bật của chúng tôi",
    },
    popularDestinations: {
      title: "Điểm đến phổ biến",
      subtitle: "Khám phá thế giới với sự tự tin",
    },
    aboutCompany: {
      subtitle: "Chào mừng bạn đến với trang của chúng tôi!",
      title: "Chúng tôi là công ty tốt nhất cho chuyến đi của bạn",
      desc: "Với nhiều năm kinh nghiệm và cuộc sống gắn bó tại Lucca, chúng tôi mang đến cho bạn dịch vụ du lịch hoàn thiện nhất. Bên cạnh việc cung cấp xe đạp và xích lô để bạn thoải mái khám phá, chúng tôi còn có đội ngũ hướng dẫn viên và tài xế sẵn sàng đáp ứng mọi nhu cầu của bạn. Chúng tôi cung cấp các gói du lịch giúp bạn nhận được nhiều giá trị nhất với chi phí thấp nhất. Hãy đồng hành cùng chúng tôi, chúng tôi sẽ luôn sẵn sàng phục vụ bạn!",
      years: "Năm kinh nghiệm",
      customers: "Khách hàng hài lòng",
      services: "Dịch vụ đa dạng",
      guides: "Hướng dẫn viên chuyên nghiệp",
    },
    popularHotels: {
      title: "Khách sạn nổi bật nhất",
    },
    offerBanner: {
      title: "Ưu đãi đặc biệt dành cho các tổ chức",
      desc: "Chúng tôi mang đến các gói du lịch và dịch vụ hấp dẫn dành riêng cho nhóm hoặc tổ chức. Nhận ưu đãi tốt nhất khi đặt trước ngay hôm nay!",
      button: "Liên hệ ngay",
    },
    popularTopics: {
      title: "Chủ đề phổ biến",
    },
    whyChooseUs: {
      subtitle: "Vì sao chọn Easy Travel",
      title: "Lý do du khách tin tưởng EasyTravel cho chuyến đi trọn vẹn",

      features: {
        agents: {
          title: "Đại lý du lịch tốt nhất",
          desc: "Chúng tôi bắt đầu bằng việc hiểu tầm nhìn, mục tiêu và thị trường của bạn để xây dựng chiến lược phù hợp.",
        },
        safety: {
          title: "An toàn luôn được đặt lên hàng đầu",
          desc: "Thiết kế lấy người dùng làm trung tâm cùng trải nghiệm tương tác giúp biến giấc mơ du lịch của bạn thành hiện thực.",
        },
        price: {
          title: "Cam kết giá tốt nhất",
          desc: "Chúng tôi đảm bảo mang đến giá trị tốt nhất cùng chất lượng được kiểm soát liên tục.",
        },
        support: {
          title: "Hỗ trợ khách hàng 24/7",
          desc: "Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn mọi lúc trong suốt hành trình du lịch.",
        },
      },
    },
    customerReviews: {
      subtitle: "Cảm nhận từ khách hàng",
      title: "Khách hàng nói gì về chúng tôi!",
      review:
        "Chuyến đi này thật tuyệt vời hơn cả mong đợi! Hướng dẫn viên thân thiện, lịch trình rõ ràng và những trải nghiệm thật đáng nhớ. Cảm giác như một giấc mơ thành hiện thực. Rất khuyến khích cho ai đang tìm kiếm một hành trình phiêu lưu!",
      name: "Cameron William",
      position: "Giám đốc Marketing, Oliver’s LAB llc.",
    },
  },
  hotelPage: {
    title: "Danh sách khách sạn",
    searchPlaceholder: "Tìm khách sạn...",
    noResult: "Không tìm thấy khách sạn nào.",
    only: "Chỉ từ",
    hotline: "Đường dây nóng",
    bookNow: "Đặt ngay",
    night: "Đêm",
    loading: "Đang tải...",
    allProvinces: "Tất cả tỉnh thành",
    filterByProvince: "Lọc theo tỉnh thành",
    sortBy: "Sắp xếp theo",
    defaultSort: "Mặc định",
    sortAsc: "Giá: Thấp đến Cao",
    sortDesc: "Giá: Cao đến Thấp"
  },
};
