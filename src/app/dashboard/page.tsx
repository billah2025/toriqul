"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CemeteryTable from "./CemeteryTable";
import AddRecordForm from "./AddRecordForm";
import EditRecordForm from "./EditRecordForm";
import CemeteryStats from "./CemeteryStats";
import { CemeteryRecord } from "@/types/CemeteryRecord";
import NoticeForm from "./notice";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<CemeteryRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<CemeteryRecord | null>(null);
  const [addingRecord, setAddingRecord] = useState(false);
  const [addingNotice, setAddingNotice] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [editingNotice, setEditingNotice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Check JWT token and redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    } catch (err) {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  // Fetch all cemetery records
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cemetery`, {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY!,
          },
        });

        
      const data: CemeteryRecord[] = await res.json();
      setRecords(data);
    } catch (err) {
      console.error("Failed to fetch records", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all notices/events
  const fetchNotices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cemetery`, {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY!,
          },
        });


      const data = await res.json();
      setNotices(data);
    } catch (err) {
      console.error("Failed to fetch notices", err);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchNotices();
  }, []);

  // Delete a cemetery record
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const res = await fetch(`https://cemeteryapi.onrender.com/api/cemetery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchRecords();
      } else {
        alert("Failed to delete record");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete a notice/event
  const handleDeleteNotice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice/event?")) return;

    try {
      const res = await fetch(`https://cemeteryapi.onrender.com/api/notices/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchNotices();
      else alert("Failed to delete notice/event");
    } catch (err) {
      console.error(err);
    }
  };

  // Open edit modal for cemetery
  const handleEdit = (record: CemeteryRecord) => {
    setEditingRecord(record);
  };

  // Open edit modal for notice
  const handleEditNotice = (notice: any) => {
    setEditingNotice(notice);
  };

  if (!user) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen text-black font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Cemetery Dashboard</h1>
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setAddingRecord(true)}
          >
            Add Record
          </button>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => setAddingNotice(true)}
          >
            Add Notice / Event
          </button>
        </div>
      </div>

      {/* Cemetery Stats */}
      <div className="mb-6">
        <CemeteryStats records={records} />
      </div>

      {/* Cemetery Table */}
      {loading ? (
        <p>Loading records...</p>
      ) : (
        <CemeteryTable
          records={records}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}

      {/* Notices Table */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-green-900 mb-2">All Notices / Events</h2>
        {notices.length === 0 ? (
          <p>No notices/events yet.</p>
        ) : (
          <div className="overflow-auto max-h-96">
            <table className="w-full text-left border">
              <thead className="bg-green-200">
                <tr>
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((n) => (
                  <tr key={n._id} className="hover:bg-green-50">
                    <td className="p-2 border">{n.title}</td>
                    <td className="p-2 border">{new Date(n.date).toLocaleDateString()}</td>
                    <td className="p-2 border">{n.type}</td>
                    <td className="p-2 border flex gap-2">
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        onClick={() => handleEditNotice(n)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        onClick={() => handleDeleteNotice(n._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {addingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-full overflow-auto relative p-6">
            <button
              className="absolute top-2 right-2 text-gray-500 text-3xl font-bold hover:text-gray-800"
              onClick={() => setAddingRecord(false)}
            >
              &times;
            </button>
            <AddRecordForm
              onAdd={async () => {
                await fetchRecords();
                setAddingRecord(false);
              }}
              onClose={() => setAddingRecord(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-full overflow-auto relative p-6">
            <button
              className="absolute top-2 right-2 text-gray-500 text-3xl font-bold hover:text-gray-800"
              onClick={() => setEditingRecord(null)}
            >
              &times;
            </button>
            <EditRecordForm
              record={editingRecord}
              onClose={() => setEditingRecord(null)}
              onUpdate={fetchRecords}
            />
          </div>
        </div>
      )}

      {/* Add Notice/Event Modal */}
      {addingNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-full overflow-auto relative p-6">
            <button
              className="absolute top-2 right-2 text-gray-500 text-3xl font-bold hover:text-gray-800"
              onClick={() => setAddingNotice(false)}
            >
              &times;
            </button>
            <NoticeForm
              onUpdate={() => {
                fetchNotices();
                setAddingNotice(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Notice Modal */}
      {editingNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-full overflow-auto relative p-6">
            <button
              className="absolute top-2 right-2 text-gray-500 text-3xl font-bold hover:text-gray-800"
              onClick={() => setEditingNotice(null)}
            >
              &times;
            </button>
            <NoticeForm
              notice={editingNotice}
              onUpdate={() => {
                fetchNotices();
                setEditingNotice(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
