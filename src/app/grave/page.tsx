"use client";

import React, { useEffect, useState } from "react";
import { Search, MapPin, CalendarDays, User } from "lucide-react";
import Link from "next/link";

interface CemeteryRecord {
  _id: string;
  name: string;
  graveNumber: string;
  location?: string;
  birthDate?: string;
  deathDate?: string;
  image?: string;
}

export default function FindLovedOneSection() {
  const [records, setRecords] = useState<CemeteryRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cemetery`, {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY!,
          },
        });
        const data = await res.json();
        setRecords(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toHijri = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const hijriYear = date.getFullYear() - 579;
    const months = [
      "Muharram", "Safar", "Rabi’ al-awwal", "Rabi’ al-thani", "Jumada al-awwal",
      "Jumada al-thani", "Rajab", "Sha‘ban", "Ramadan", "Shawwal", "Dhul-Qa‘dah", "Dhul-Hijjah"
    ];
    const month = months[date.getMonth()];
    return `${date.getDate()} ${month} ${hijriYear} AH`;
  };

  const filteredRecords = records.filter((r) => {
    const q = query.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.graveNumber?.toLowerCase().includes(q)
    );
  });

  const visibleRecords = filteredRecords.slice(0, visibleCount);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setVisibleCount(6);
  };

  return (
    <section className="bg-gradient-to-b from-green-50 to-emerald-100 py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-green-900 mb-4">
          Find a Loved One
        </h2>
        <p className="text-green-800 mb-10 max-w-2xl mx-auto">
          Search through the Jannatul Baqi Cemetery records to find where your loved ones rest.
          <br />
          <span className="italic text-emerald-700">
            May Allah grant them peace and mercy.
          </span>
        </p>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-10"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter name or grave number..."
            className="w-full sm:w-2/3 md:w-1/2 px-4 py-2 border border-green-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-emerald-700 text-white px-6 py-2 rounded-full hover:bg-emerald-600 transition shadow-md"
          >
            <Search size={18} /> Search
          </button>
        </form>

        {loading ? (
          <p className="text-center text-green-700 italic">Loading records...</p>
        ) : filteredRecords.length === 0 ? (
          <p className="text-center text-gray-600 italic">
            No records found for your search.
          </p>
        ) : (
          <>
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {visibleRecords.map((person) => {
                const date = person.deathDate ? new Date(person.deathDate) : null;
                const englishDate = date
                  ? date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—";

                return (
                  <div
                    key={person._id}
                    className="bg-white border border-green-100 rounded-xl p-5 text-left shadow hover:shadow-lg transition"
                  >
                    {/* Header (Name + Image/Icon) */}
                    <div className="flex items-center gap-3 mb-3">
                      {person.image ? (
                        <img
                          src={person.image}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                        />
                      ) : (
                        <User className="text-emerald-700 w-10 h-10" />
                      )}
                      <h3 className="text-lg font-semibold text-green-900">
                        {person.name}
                      </h3>
                    </div>

                    {/* Info Lines */}
                    <p className="text-green-800 text-sm mb-1 flex items-center gap-2">
                      <MapPin size={16} className="text-amber-500" />
                      Grave: {person.location || person.graveNumber || "N/A"}
                    </p>

                    <p className="text-green-700 text-sm flex items-start gap-2">
                      <CalendarDays size={16} className="text-amber-500 mt-[2px]" />
                      <span>
                        Date of Passing: {toHijri(person.deathDate)}{" "}
                        <br />
                        <span className="text-gray-600 text-xs">
                          ({englishDate})
                        </span>
                      </span>
                    </p>

                    {/* Button */}
                    <Link
                      href={`/grave/${person._id}`}
                      className="mt-3 block bg-amber-400 text-green-900 px-4 py-1.5 rounded-md font-medium hover:bg-amber-300 transition text-center"
                    >
                      View Details
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* View More */}
            {visibleCount < filteredRecords.length && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="mt-10 bg-emerald-700 text-white px-6 py-2 rounded-full hover:bg-emerald-600 transition shadow-md"
              >
                View More
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
