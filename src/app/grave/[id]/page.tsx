"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  User,
  BookOpen,
  Users,
  Heart,
  Globe,
  ArrowLeft,
} from "lucide-react";

interface Grave {
  _id: string;
  name: string;
  address?: string;
  age?: number;
  birthDate?: string;
  deathDate?: string;
  isNative?: boolean;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  image?: string;
  graveNumber?: string;
  gender?: string;
  whereDied?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

const GraveDetailPage = () => {
  const { id } = useParams();
  const [grave, setGrave] = useState<Grave | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrave = async () => {
      try {
        const res = await fetch(`https://cemeteryapi.onrender.com/api/cemetery/${id}`);
        const data = await res.json();
        setGrave(data);
      } catch (err) {
        console.error("Failed to fetch grave details:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGrave();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-emerald-50">
        <p className="text-green-800 text-lg animate-pulse">
          Loading details...
        </p>
      </div>
    );

  if (!grave)
    return (
      <div className="min-h-screen flex justify-center items-center bg-emerald-50">
        <p className="text-red-700 text-lg">No record found.</p>
      </div>
    );

  return (
    <section className="bg-gradient-to-b from-green-50 to-emerald-100 min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-green-100">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 mb-6"
        >
          <ArrowLeft size={18} /> Back to Cemetery
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          <img
            src={
              grave.image && grave.image.trim() !== ""
                ? grave.image
                : "https://cdn-icons-png.flaticon.com/512/4139/4139981.png"
            }
            alt={grave.name}
            className="w-48 h-48 object-cover rounded-xl shadow-md border border-green-100"
          />
          <div className="text-left">
            <h1 className="text-3xl font-bold text-green-900 mb-2">
              {grave.name}
            </h1>
            <p className="text-green-800 flex items-center gap-2 mb-1">
              <MapPin size={18} className="text-amber-500" />
              Grave: {grave.graveNumber || "N/A"}
            </p>
            <p className="text-green-800 flex items-center gap-2 mb-1">
              <Calendar size={18} className="text-amber-500" />
              Date of Birth:{" "}
              {grave.birthDate
                ? new Date(grave.birthDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Unknown"}
            </p>
            <p className="text-green-800 flex items-center gap-2 mb-1">
              <Calendar size={18} className="text-amber-500" />
              Date of Passing:{" "}
              {grave.deathDate
                ? new Date(grave.deathDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Unknown"}
            </p>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-green-100 my-6" />

        {/* Personal Info Section */}
        <div className="grid md:grid-cols-2 gap-6 text-green-800">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2 mb-3">
              <User size={18} className="text-emerald-700" />
              Personal Information
            </h3>
            <ul className="space-y-2 text-sm">
              <li>Gender: {grave.gender || "N/A"}</li>
              <li>Age: {grave.age ? `${grave.age} years` : "Unknown"}</li>
              <li>Address: {grave.address || "N/A"}</li>
              <li>Native: {grave.isNative ? "Yes" : "No"}</li>
              <li>Where Died: {grave.whereDied || "N/A"}</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2 mb-3">
              <Users size={18} className="text-emerald-700" />
              Family Information
            </h3>
            <ul className="space-y-2 text-sm">
              <li>Father: {grave.fatherName || "N/A"}</li>
              <li>Mother: {grave.motherName || "N/A"}</li>
              <li>Guardian: {grave.guardianName || "N/A"}</li>
            </ul>
          </div>
        </div>

        {/* Description Section */}
        {grave.description && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2 mb-2">
              <BookOpen size={18} className="text-amber-600" />
              Description
            </h3>
            <p className="text-green-800 leading-relaxed">
              {grave.description}
            </p>
          </div>
        )}

        {/* Footer / Dates */}
        <div className="text-center text-green-700 italic mt-10">
          <p>“May Allah forgive their sins and grant them Jannatul Firdaus.”</p>
          <p className="text-xs mt-2">
            Record created on{" "}
            {new Date(grave.createdAt || "").toLocaleDateString("en-GB")} and
            last updated on{" "}
            {new Date(grave.updatedAt || "").toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default GraveDetailPage;
