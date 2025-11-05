"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CalendarDays, FileText } from "lucide-react";
import axios from "axios";
import Link from "next/link";

interface Notice {
  _id: string;
  title: string;
  description: string;
  date: string;
  image?: string;
}

const NoticeDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resAll = await axios.get(`https://cemeteryapi.onrender.com/api/notices`);
        const sorted = resAll.data.sort(
          (a: Notice, b: Notice) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setNotices(sorted);

        if (id) {
          const resNotice = await axios.get(`https://cemeteryapi.onrender.com/api/notices/${id}`);
          setNotice(resNotice.data);
        }
      } catch (err) {
        console.error(err);
        router.push("/notices");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  if (loading) return <p className="p-8 text-green-900">Loading...</p>;
  if (!notice) return <p className="p-8 text-red-600">Notice not found.</p>;

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-12 font-sans text-green-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Selected Notice */}
        <div className="md:col-span-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Image Banner */}
          <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-green-200 to-green-400 flex items-center justify-center overflow-hidden">
            {notice.image ? (
              <img
                src={notice.image}
                alt={notice.title}
                className="w-full h-full object-cover rounded-t-3xl"
              />
            ) : (
              <div className="text-green-900 font-bold text-xl md:text-2xl">
                No Image Available
              </div>
            )}
          </div>

          {/* Notice Content */}
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 flex items-center gap-2">
              {notice.title}
            </h1>

            <p className="text-green-800 text-sm md:text-base mb-6 flex items-center gap-2">
              <CalendarDays size={18} /> {new Date(notice.date).toLocaleDateString()}
            </p>

            <p className="text-green-900 text-base md:text-lg leading-relaxed whitespace-pre-line mb-6">
              {notice.description}
            </p>

            <button
              onClick={() => router.push("/notices")}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-all font-medium"
            >
              ← Back to Notices
            </button>
          </div>
        </div>

        {/* Right Column: Notices List */}
        <div className="md:col-span-1 bg-white rounded-2xl shadow-lg p-4 overflow-auto max-h-screen">
          <h2 className="text-xl font-bold mb-4">All Notices</h2>
          <ul className="space-y-4">
            {notices.map((n) => (
              <Link key={n._id} href={`/notice/${n._id}`}>
                <li
                  className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-green-100 transition ${
                    n._id === notice._id ? "bg-green-200 font-semibold" : ""
                  }`}
                >
                  <FileText size={18} className="text-green-900" />
                  <div>
                    <p>{n.title}</p>
                    <p className="text-green-800 text-sm flex items-center gap-1">
                      <CalendarDays size={14} /> {new Date(n.date).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default NoticeDetailPage;
