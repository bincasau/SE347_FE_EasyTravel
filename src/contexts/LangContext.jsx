import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { en } from "@/i18n/dict.en";
import { vi } from "@/i18n/dict.vi";

const DICTS = { en, vi };

const LangContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export const LangProvider = ({ children }) => {
  // Ưu tiên lấy từ localStorage, nếu chưa có thì lấy theo ngôn ngữ trình duyệt
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem("lang");
    if (stored) return stored;

    const browserLang = navigator.language?.toLowerCase();
    if (browserLang.startsWith("vi")) return "vi";
    return "en";
  });

  // Lưu lại lựa chọn vào localStorage mỗi khi đổi ngôn ngữ
  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  // Hàm lấy giá trị dịch từ dict (hỗ trợ key dạng "home.hero.title")
  const getValue = (dict, keys) => {
    let value = dict;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined || value === null) return null;
    }
    // Nếu value là object thì không render được → trả null để fallback
    return typeof value === "object" ? null : value;
  };

  // Hàm dịch có fallback và kiểm tra lỗi
  const t = (key) => {
    if (!key) return "";
    const keys = key.split(".");

    // Lấy từ ngôn ngữ hiện tại
    const fromCurrent = getValue(DICTS[lang], keys);
    if (fromCurrent) return fromCurrent;

    // Fallback sang tiếng Anh nếu thiếu
    const fromEn = getValue(DICTS.en, keys);
    if (fromEn) return fromEn;

    // Nếu vẫn không có, trả lại key để debug
    return key;
  };

  const value = useMemo(() => ({ lang, setLang, t }), [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext);
