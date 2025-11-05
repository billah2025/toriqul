"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, FileText } from "lucide-react";
import axios from "axios";

interface Notice {
  _id: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  type: string;
}

const NoticesPage = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axios.get(`https://cemeteryapi.onrender.com/api/notices`);
        const sorted = res.data.sort(
          (a: Notice, b: Notice) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setNotices(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  if (loading) return <p className="p-8 text-green-900">Loading notices...</p>;
  if (notices.length === 0) return <p className="p-8 text-green-900">No notices found.</p>;

  return (
    <div className="p-6 md:p-12 bg-green-50 min-h-screen font-sans">
      <h2 className="text-4xl font-bold text-green-900 text-center mb-10">
        All Notices & Events
      </h2>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
        {notices.map((notice) => (
          <Link key={notice._id} href={`/notice/${notice._id}`}>
            <div className="bg-gradient-to-br from-green-200 to-green-400 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 w-64 p-4 cursor-pointer border border-green-100">
              
              {/* Image */}
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

              {/* Title */}
              <h2 className="text-lg font-semibold text-green-900 mb-2 flex items-center gap-2">
                <FileText size={18} /> {notice.title}
              </h2>

              {/* Date */}
              <p className="text-green-800 text-sm mb-4 flex items-center gap-2">
                <CalendarDays size={16} /> {new Date(notice.date).toLocaleDateString()}
              </p>

              {/* Optional: Description preview */}
              {notice.description && (
                <p className="text-green-900 text-sm line-clamp-3">
                  {notice.description}
                </p>
              )}

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NoticesPage;
