"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, FileText } from "lucide-react";

interface Notice {
  _id: string;
  title: string;
  date: string;
  image?: string;
  type: string;
}

const NoticesPage = () => {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notices`);
        const data = await res.json();
        data.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setNotices(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotices();
  }, []);

  const latestNotices = notices.slice(0, 4);

  return (
    <div className="min-h-screen bg-green-50 py-12 px-6 font-sans">
      <h1 className="text-4xl font-bold text-green-900 text-center mb-10">
        Latest Notices & Events
      </h1>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
        {latestNotices.map((notice) => (
          <Link key={notice._id} href={`/notice/${notice._id}`}>
            <div className="bg-gradient-to-br from-green-200 to-green-400 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 w-64 p-4 cursor-pointer border border-green-100">
              <div className="bg-green-100 w-full h-36 rounded-xl flex items-center justify-center overflow-hidden mb-4">
                {notice.image ? (
                  <img
                    src={notice.image}
                    alt={notice.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-green-400 font-medium">No Image</span>
                )}
              </div>

              <h2 className="text-lg font-semibold text-green-900 mb-2 flex items-center gap-2">
                <FileText size={18} /> {notice.title}
              </h2>

              <p className="text-green-800 text-sm mb-4 flex items-center gap-2">
                <CalendarDays size={16} /> {new Date(notice.date).toLocaleDateString()}
              </p>

              
            </div>
          </Link>
        ))}
      </div>

      {/* See More Button */}
      {notices.length > 4 && (
        <div className="flex justify-center mt-10">
          <Link
            href="/notices/all"
            className="bg-green-900 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-green-800 transition-all"
          >
            See More
          </Link>
        </div>
      )}
    </div>
  );
};

export default NoticesPage;
