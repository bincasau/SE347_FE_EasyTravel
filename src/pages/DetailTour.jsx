import React from "react";
import ShortInfor from "../components/pages/DetailTour/ShortInfor";
import Detail from "../components/pages/DetailTour/Detail";
import Gallery from "../components/pages/DetailTour/Gallery";
import Video from "../components/pages/DetailTour/Video";

export default function DetailTour() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <ShortInfor />
      <Detail />
      <Gallery />
      <Video
        title="Beautiful Place"
        youtubeUrl="https://www.youtube.com/embed/k8m0SaGQ_1c?si=o77-LS04bRJO60qX"
      />
    </div>
  );
}
