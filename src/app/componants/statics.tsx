"use client";

import { useEffect, useState } from "react";
import { Users, Globe2, MapPin, User, BarChart3 } from "lucide-react";

interface CemeteryRecord {
  _id: string;
  name: string;
  age: number;
  gender: string;
  isNative: boolean;
}

export default function CemeteryStats() {
  const [records, setRecords] = useState<CemeteryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCemeteryData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cemetery`, {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY!,
          },
        });
        const data = await res.json();
        setRecords(data);
      } catch (error) {
        console.error("Error fetching cemetery data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCemeteryData();
  }, []);

  // Compute dynamic stats
  const total = records.length;
  const native = records.filter((r) => r.isNative).length;
  const foreigner = records.filter((r) => !r.isNative).length;
  const male = records.filter((r) => r.gender?.toLowerCase() === "male").length;
  const female = records.filter(
    (r) => r.gender?.toLowerCase() === "female"
  ).length;

  // Group by age range dynamically
  const ageGroups = [
    { range: "0-10", min: 0, max: 10 },
    { range: "11-20", min: 11, max: 20 },
    { range: "21-30", min: 21, max: 30 },
    { range: "31-40", min: 31, max: 40 },
    { range: "41-50", min: 41, max: 50 },
    { range: "51-60", min: 51, max: 60 },
    { range: "61+", min: 61, max: 200 },
  ];

  const ageStats = ageGroups.map((g) => ({
    range: g.range,
    count: records.filter(
      (r) => r.age >= g.min && (g.max ? r.age <= g.max : true)
    ).length,
  }));

  const stats = [
    { label: "Total Buried", value: total, icon: Users },
    { label: "Native Buried", value: native, icon: MapPin },
    { label: "Foreigner Buried", value: foreigner, icon: Globe2 },
    { label: "Male Buried", value: male, icon: User },
    { label: "Female Buried", value: female, icon: User },
  ];

  return (
   <section className="bg-amber-50 py-12 text-black px-6 md:px-16  shadow-md border border-amber-100">

      <div className="text-center mb-10">
        <h2 className="text-3xl font-semibold text-amber-800 mb-2">
          Cemetery Statistics
        </h2>
        <p className="text-gray-600">
          Overview of those resting here — may Allah grant them Jannah.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 italic">Loading data...</p>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            {stats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-white border border-amber-100 rounded-xl p-5 text-center shadow hover:shadow-lg transition"
              >
                <Icon className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                <h4 className="text-lg font-semibold text-gray-700">{label}</h4>
                <p className="text-2xl font-bold text-amber-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Age Range Table */}
          <div className="bg-white border border-amber-100 rounded-xl p-6 shadow overflow-x-auto">
            <div className="flex items-center mb-4">
              <BarChart3 className="text-amber-600 w-6 h-6 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">
                Burials by Age Range
              </h3>
            </div>

            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="bg-amber-100 text-amber-900">
                  <th className="border border-amber-200 px-4 py-2">
                    Age Range
                  </th>
                  <th className="border border-amber-200 px-4 py-2">
                    Number of Buried
                  </th>
                </tr>
              </thead>
              <tbody>
                {ageStats.map(({ range, count }) => (
                  <tr key={range} className="hover:bg-amber-50">
                    <td className="border border-amber-100 px-4 py-2">{range}</td>
                    <td className="border border-amber-100 px-4 py-2">
                      {count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Dua */}
          <p className="text-center mt-8 text-gray-600 italic">
            “O Allah, forgive all who lie here and grant them the highest place
            in Jannah.”
          </p>
        </>
      )}
    </section>
  );
}
