import { useMemo, useState } from "react";

const BRANCHES = {
  hcm: {
    key: "hcm",
    label: "Hồ Chí Minh",
    address: "Tầng 8, 123 Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "+84 28 1234 5678",
    email: "hcm@yourcompany.com",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Nguyen+Hue+District+1+Ho+Chi+Minh",
    zaloUrl: "https://zalo.me/0123456789",
  },
  hn: {
    key: "hn",
    label: "Hà Nội",
    address: "Tầng 12, 88 Trần Duy Hưng, Cầu Giấy, Hà Nội",
    phone: "+84 24 1234 5678",
    email: "hn@yourcompany.com",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Tran+Duy+Hung+Cau+Giay+Ha+Noi",
    zaloUrl: "https://zalo.me/0123456789",
  },
};

const ActionBtn = ({ href, icon, label, sub, variant = "light" }) => (
  <a
    href={href}
    target={href?.startsWith("http") ? "_blank" : undefined}
    rel={href?.startsWith("http") ? "noreferrer" : undefined}
    className={[
      "group flex items-start gap-3 rounded-2xl p-4 ring-1 ring-black/5 transition active:scale-[0.99]",
      variant === "primary"
        ? "bg-amber-500 text-white hover:bg-amber-600"
        : "bg-white/75 hover:bg-white",
    ].join(" ")}
  >
    <div
      className={[
        "grid h-10 w-10 place-items-center rounded-xl",
        variant === "primary"
          ? "bg-white/20 text-white"
          : "bg-orange-100 text-orange-700",
      ].join(" ")}
    >
      <i className={icon}></i>
    </div>
    <div className="min-w-0">
      <p className="text-sm font-extrabold">{label}</p>
      <p
        className={[
          "mt-0.5 text-xs",
          variant === "primary" ? "text-white/90" : "text-gray-600",
        ].join(" ")}
      >
        {sub}
      </p>
    </div>
    <div className="ml-auto opacity-60 group-hover:opacity-100">
      <i className="fa-solid fa-arrow-up-right-from-square"></i>
    </div>
  </a>
);

export default function ContactSectionNoForm() {
  const [active, setActive] = useState("hcm");
  const branch = useMemo(() => BRANCHES[active], [active]);

  return (
    <section className="w-full">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-orange-100 to-amber-100" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
          {/* header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-black/5 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Liên hệ
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900">
              Chọn chi nhánh & liên hệ nhanh
            </h2>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-gray-700">
              Không cần điền form. Bạn có thể gọi, nhắn Zalo, gửi email hoặc mở
              map.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2 items-stretch">
            {/* LEFT: Branch switch + info */}
            <div className="text-gray-800">
              <div className="inline-flex rounded-full bg-white/70 p-1 ring-1 ring-black/5 backdrop-blur">
                {Object.values(BRANCHES).map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setActive(b.key)}
                    className={[
                      "px-4 py-2 text-sm font-semibold rounded-full transition",
                      active === b.key
                        ? "bg-amber-500 text-white shadow-sm"
                        : "text-gray-700 hover:text-orange-700 hover:bg-white",
                    ].join(" ")}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-3xl bg-white/70 p-5 sm:p-6 shadow-sm ring-1 ring-black/5 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">
                      Chi nhánh {branch.label}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {branch.address}
                    </p>
                  </div>

                  <a
                    href={branch.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-gray-800 ring-1 ring-black/5 hover:bg-orange-50"
                    title="Mở Google Maps"
                  >
                    <i className="fa-solid fa-map-location-dot text-orange-500"></i>
                    Map
                  </a>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-black/5">
                    <p className="text-xs font-semibold text-gray-500">
                      Hotline
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-gray-900">
                      {branch.phone}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-black/5">
                    <p className="text-xs font-semibold text-gray-500">Email</p>
                    <p className="mt-1 text-sm font-extrabold text-gray-900 break-all">
                      {branch.email}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-4 ring-1 ring-black/5">
                  <p className="text-xs text-gray-700">
                    Cần báo giá nhanh? Nhấn{" "}
                    <span className="font-semibold">“Yêu cầu báo giá”</span> để
                    mở Google Form/Typeform (không cần backend).
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: Quick actions */}
            <div className="rounded-3xl bg-white/55 p-5 sm:p-6 shadow-lg ring-1 ring-black/5 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-extrabold text-gray-900">
                  Hành động nhanh
                </h3>
                <span className="text-xs font-semibold text-gray-600">
                  {branch.label}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                <ActionBtn
                  href={`tel:${branch.phone.replace(/\s/g, "")}`}
                  icon="fa-solid fa-phone"
                  label="Gọi hotline"
                  sub={branch.phone}
                  variant="primary"
                />
                <ActionBtn
                  href={branch.zaloUrl}
                  icon="fa-solid fa-comment-dots"
                  label="Nhắn Zalo"
                  sub="Chat trực tiếp với tư vấn"
                />
                <ActionBtn
                  href={`mailto:${branch.email}`}
                  icon="fa-solid fa-envelope"
                  label="Gửi Email"
                  sub={branch.email}
                />
                <ActionBtn
                  href={branch.mapUrl}
                  icon="fa-solid fa-location-crosshairs"
                  label="Mở chỉ đường"
                  sub="Xem đường đi trên Google Maps"
                />

                {/* Optional: Quote request via external form */}
                <ActionBtn
                  href="https://forms.gle/your-google-form"
                  icon="fa-solid fa-file-signature"
                  label="Yêu cầu báo giá"
                  sub="Mở form báo giá (Google Form/Typeform)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
