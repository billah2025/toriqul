"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
 


interface NoticeFormProps {
  notice?: any; // If passed, the form will edit this notice
  onUpdate?: () => void; // Callback to refresh parent data
}

const NoticeForm: React.FC<NoticeFormProps> = ({ notice, onUpdate }) => {
  const [title, setTitle] = useState(notice?.title || "");
  const [description, setDescription] = useState(notice?.description || "");
  const [type, setType] = useState(notice?.type || "notice");
  const [date, setDate] = useState(notice?.date?.split("T")[0] || "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(notice?.image || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let imageUrl = notice?.image || "";

      // Upload image if a new one is selected
      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const uploadRes = await axios.post(
          `https://cemeteryapi.onrender.com/api/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        imageUrl = uploadRes.data.url;
      }

      // If notice exists → update
      if (notice) {
        await axios.put(`https://cemeteryapi.onrender.com/api/notices/${notice._id}`, {
          title,
          description,
          date,
          type,
          image: imageUrl,
        });
        setMessage("Notice/Event updated successfully!");
      } else {
        // Create new notice
        await axios.post(`https://cemeteryapi.onrender.com/api/notices`, {
          title,
          description,
          date,
          type,
          image: imageUrl,
        });
        setMessage("Notice/Event created successfully!");
        // Reset form only if creating new
        setTitle("");
        setDescription("");
        setType("notice");
        setDate("");
        setImage(null);
        setPreview(null);
      }

      // Call parent callback
      onUpdate && onUpdate();
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">
        {notice ? "Edit Notice / Event" : "Add Notice / Event"}
      </h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <textarea
            className="w-full border rounded p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Type</label>
          <select
            className="w-full border rounded p-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="notice">Notice</option>
            <option value="event">Event</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Date</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Image (optional)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover border"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {loading
            ? "Saving..."
            : notice
            ? "Update Notice/Event"
            : "Save Notice/Event"}
        </button>
      </form>
    </div>
  );
};

export default NoticeForm;
