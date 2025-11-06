"use client";

import { useState, useEffect } from "react";

interface Props {
  onAdd: () => void;
  onClose: () => void;
}

export default function AddRecordForm({ onAdd, onClose }: Props) {
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

  const [unusedGraves, setUnusedGraves] = useState<string[]>([]);
  const [loadingGraves, setLoadingGraves] = useState(true);

  // Fetch unused grave numbers
  useEffect(() => {
    const fetchUnusedGraves = async () => {
      try {
        // 1️⃣ Fetch all possible grave numbers (or load from file/backend)
        const allGravesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cemetery`, {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY!,
          },
        });
        const allGraves: string[] = await allGravesRes.json();

        // 2️⃣ Fetch all used graves
        const usedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cemetery`, {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY!,
          },
        });
        const usedData = await usedRes.json();
        const usedGraves = usedData.map((r: any) => r.graveNumber);

        // 3️⃣ Filter unused
        const available = allGraves.filter((g) => !usedGraves.includes(g));
        setUnusedGraves(available);
      } catch (err) {
        console.error("Failed to fetch grave numbers", err);
      } finally {
        setLoadingGraves(false);
      }
    };

    fetchUnusedGraves();
  }, []);

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

    let imageUrl = "";
    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      const uploadRes = await fetch(`https://cemeteryapi.onrender.com/api/upload`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    const res = await fetch(`https://cemeteryapi.onrender.com/api/cemetery`, {
      method: "POST",
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
    });

    if (res.ok) {
      onAdd();
      onClose();
    } else {
      alert("Failed to add record");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md max-w-3xl w-full max-h-[95vh] overflow-auto space-y-4"
      >
        <h2 className="text-xl font-bold mb-2">Add Cemetery Record</h2>

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
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
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

          {/* Grave Number Dropdown */}
          {loadingGraves ? (
            <p>Loading grave numbers...</p>
          ) : (
            <select
              value={graveNumber}
              onChange={(e) => setGraveNumber(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Unused Grave Number</option>
              {unusedGraves.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          )}

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
            Add Record
          </button>
        </div>
      </form>
    </div>
  );
}
