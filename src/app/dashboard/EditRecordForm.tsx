"use client";

import { useState, useEffect } from "react";

interface Record {
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
  graveNumber: string;
  gender?: string;
  whereDied?: string;
  description?: string;
}

interface Props {
  record: Record | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditRecordForm({ record, onClose, onUpdate }: Props) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [isNative, setIsNative] = useState(false);
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [graveNumber, setGraveNumber] = useState("");
  const [gender, setGender] = useState("");
  const [whereDied, setWhereDied] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (record) {
      setName(record.name);
      setAddress(record.address || "");
      setAge(record.age?.toString() || "");
      setBirthDate(record.birthDate?.slice(0, 10) || "");
      setDeathDate(record.deathDate?.slice(0, 10) || "");
      setIsNative(record.isNative || false);
      setFatherName(record.fatherName || "");
      setMotherName(record.motherName || "");
      setGuardianName(record.guardianName || "");
      setImagePreview(record.image || "");
      setGraveNumber(record.graveNumber);
      setGender(record.gender || "");
      setWhereDied(record.whereDied || "");
      setDescription(record.description || "");
    }
  }, [record]);

  if (!record) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    let imageUrl = imagePreview;
    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/cemetery/${record._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          address,
          age: Number(age),
          birthDate,
          deathDate,
          isNative,
          fatherName,
          motherName,
          guardianName,
          image: imageUrl,
          graveNumber,
          gender,
          whereDied,
          description,
        }),
      }
    );

    if (res.ok) {
      onUpdate();
      onClose();
    } else {
      alert("Failed to update record");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md max-w-3xl w-full max-h-[95vh] overflow-auto space-y-4"
      >
        <h2 className="text-xl font-bold mb-2">Edit Cemetery Record</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            placeholder="Birth Date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            placeholder="Death Date"
            value={deathDate}
            onChange={(e) => setDeathDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isNative}
              onChange={(e) => setIsNative(e.target.checked)}
            />
            <span>Is Native</span>
          </div>
          <input
            type="text"
            placeholder="Father's Name"
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Mother's Name"
            value={motherName}
            onChange={(e) => setMotherName(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Guardian's Name"
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-32 object-cover rounded"
            />
          )}
          <input
            type="text"
            placeholder="Grave Number"
            value={graveNumber}
            onChange={(e) => setGraveNumber(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Where Died"
            value={whereDied}
            onChange={(e) => setWhereDied(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
