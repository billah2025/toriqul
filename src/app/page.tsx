import Image from "next/image";
 import Slideshow from "@/app/componants/Slideshow";
  import HistoricalBackground from "@/app/componants/tex-img";
import Location from "@/app/componants/location";
import ContactForm from "@/app/componants/contact";
import FindLovedOneSection from "@/app/componants/findlovedone";

import CemeteryStats from "@/app/componants/statics";
import GraveGrid from "@/app/componants/map";
import NoticeCards from "./componants/Noticecard";

export default function Home() {
  return (
    <div >
 <Slideshow />
    <FindLovedOneSection />
     <CemeteryStats />
      <GraveGrid />
    <NoticeCards />
    <HistoricalBackground />
    <Location />
    <ContactForm />
   
   
    </div>
  );
}

  
