"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface CemeteryRecord {
  _id: string;
  name: string;
  graveNumber: string;
  birthDate?: string;
  deathDate?: string;
}

const GraveGrid: React.FC = () => {
  const [allGraves, setAllGraves] = useState<string[]>([]);
  const [usedGraves, setUsedGraves] = useState<CemeteryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<string>("All");
  const [modalGrave, setModalGrave] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10); // show only 10 initially

  useEffect(() => {
    const fetchGraves = async () => {
      try {
        const resAll = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/graves`, {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY!,
          },
        });
        const allData: string[] = await resAll.json();
        setAllGraves(allData);

        const resUsed = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cemetery`, {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY!,
          },
        });
        const cemeteryData: CemeteryRecord[] = await resUsed.json();
        setUsedGraves(cemeteryData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGraves();
  }, []);

  if (loading) return <p className="text-center py-10">Loading graves...</p>;

  const findUsedGrave = (grave: string) =>
    usedGraves.find((g) => g.graveNumber === grave);

  // ✅ Dynamically generate block letters
  const uniqueBlocks = Array.from(
    new Set(allGraves.map((g) => g.charAt(0).toUpperCase()))
  ).sort();

  const blocks = ["All", ...uniqueBlocks];

  // ✅ Filter graves by selected block
  const filteredGraves =
    selectedBlock === "All"
      ? allGraves
      : allGraves.filter((g) => g.startsWith(selectedBlock));

  const usedCount = allGraves.filter((g) => findUsedGrave(g)).length;
  const availableCount = allGraves.length - usedCount;

  // ✅ Limit to visibleCount
  const visibleGraves = filteredGraves.slice(0, visibleCount);

  return (
    <div
      className="p-6 font-serif min-h-screen bg-green-50 text-black"
      style={{
        backgroundImage: `url('https://www.transparenttextures.com/patterns/asfalt-light.png')`,
        backgroundRepeat: "repeat",
      }}
    >
      {/* Headline */}
      <h2 className="text-3xl font-bold text-center text-green-900 mb-4">
        Graveyard Status
      </h2>
      <p className="text-center text-green-700 mb-6">
        Used Graves: <span className="font-semibold">{usedCount}</span> | Available Graves:{" "}
        <span className="font-semibold">{availableCount}</span>
      </p>

      {/* Block filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {blocks.map((block) => (
          <button
            key={block}
            className={`px-4 py-1 rounded-full font-medium border transition ${
              selectedBlock === block
                ? "bg-green-700 text-white border-green-700"
                : "bg-green-100 text-green-900 border-green-300 hover:bg-green-200"
            }`}
            onClick={() => {
              setSelectedBlock(block);
              setVisibleCount(10); // reset visible count when filter changes
            }}
          >
            {block}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-300 rounded-sm border"></span>
          Used
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-yellow-200 rounded-sm border"></span>
          Available
        </div>
      </div>

      {/* Grave Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {visibleGraves.map((grave) => {
          const record = findUsedGrave(grave);
          const isUsed = !!record;

          const content = (
            <div
              className={`group relative p-3 rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105
                ${isUsed ? "bg-green-300" : "bg-yellow-200"} 
                border border-green-800/20 text-sm
              `}
              onClick={() => {
                if (!isUsed) setModalGrave(grave);
              }}
            >
              <div className="text-center font-bold">{grave}</div>

              {isUsed && (
                <div className="absolute inset-0 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 bg-white/90 rounded-lg transition-opacity p-2 text-center">
                  <p className="font-medium text-green-900 text-xs">
                    {record.name}
                  </p>
                  <p className="text-[10px] text-gray-700">
                    {new Date(record.birthDate || "").toLocaleDateString()} -{" "}
                    {new Date(record.deathDate || "").toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          );

          return isUsed ? (
            <Link key={grave} href={`/grave/${record._id}`}>
              {content}
            </Link>
          ) : (
            <div key={grave}>{content}</div>
          );
        })}
      </div>

      {/* See More Button */}
      {visibleCount < filteredGraves.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="px-5 py-2 bg-green-700 text-white rounded-full font-medium hover:bg-green-800 transition"
          >
            See More
          </button>
        </div>
      )}

      {/* Modal for empty grave */}
      {modalGrave && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-center shadow-lg">
            <h3 className="text-xl font-bold mb-4">{modalGrave}</h3>
            <p className="mb-6">This grave is available.</p>
            <button
              className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition"
              onClick={() => setModalGrave(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraveGrid;
