"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
// import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
const downloadFile = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Full-featured Printing Dashboard (Option B)
 *
 * Features:
 * - Login required (JWT read from localStorage "token")
 * - Fetch /api/prints with x-api-key + Authorization
 * - Add / Edit / Delete records (image upload to /api/upload)
 * - Image preview + image click popup
 * - Search, sort, pagination (simple)
 * - Export to Excel, Import from Excel
 * - Generate Invoice PDF (download)
 *
 * NOTE: Install jspdf, xlsx, file-saver first:
 * npm install jspdf xlsx file-saver
 */

interface PrintRecord {
  _id: string;
  clientName: string;
  address?: string;
  phone?: string;
  email?: string;

  totalPages: number;
  chargePerPage: number;
  costPerPage: number;
  totalCharge: number;
  totalCost: number;
  profit: number;
  image?: string;
  date: string;
}


export default function DashboardPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

  // data + UI state
  const [records, setRecords] = useState<PrintRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<PrintRecord | null>(null);

  // form
  const [clientName, setClientName] = useState("");
  const [totalPages, setTotalPages] = useState<number | "">("");
  const [chargePerPage, setChargePerPage] = useState<number | "">("");
  const [costPerPage, setCostPerPage] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // UI helpers
  const [popupImage, setPopupImage] = useState<string>("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "clientName" | "profit">(
    "date"
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Require login (JWT token)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []);

  // Fetch all records
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/prints`, {
        headers: {
          "x-api-key": API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        // if 401 redirect to login
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch records. Check server or login.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Image input change
  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      setImagePreview(URL.createObjectURL(f));
    }
  };

  // Compute totals for preview in form
  const computedTotals = useMemo(() => {
    const tp = Number(totalPages) || 0;
    const cp = Number(chargePerPage) || 0;
    const cosp = Number(costPerPage) || 0;
    const totalCharge = tp * cp;
    const totalCost = tp * cosp;
    const profit = totalCharge - totalCost;
    return { totalCharge, totalCost, profit };
  }, [totalPages, chargePerPage, costPerPage]);

  // Submit add/edit
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const token = localStorage.getItem("token");
    // validation
    if (!clientName || !totalPages || !chargePerPage || !costPerPage) {
      return alert("Please fill required fields");
    }

    // 1) upload image if changed
    let imageUrl = editing?.image || "";
    if (imageFile) {
      try {
        const fd = new FormData();
        fd.append("file", imageFile);
        const upl = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          body: fd,
          headers: {
            // upload route in your backend might not require api-key; include if required
            "x-api-key": API_KEY,
            Authorization: `Bearer ${token}`,
          } as any,
        });
        if (!upl.ok) throw new Error("Upload failed");
        const ud = await upl.json();
        // backend should return { url: "..." }
        imageUrl = ud.url || ud.data?.url || imageUrl;
      } catch (err) {
        console.error("Upload error", err);
        return alert("Image upload failed");
      }
    }

    // 2) prepare record payload
    const tp = Number(totalPages);
    const cp = Number(chargePerPage);
    const cosp = Number(costPerPage);
const payload = {
  clientName,
  address,
  phone,
  email,

  totalPages: tp,
  chargePerPage: cp,
  costPerPage: cosp,
  totalCharge: tp * cp,
  totalCost: tp * cosp,
  profit: tp * cp - tp * cosp,
  image: imageUrl || undefined,
};


    try {
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${API_URL}/api/prints/${editing._id}`
        : `${API_URL}/api/prints`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Save failed");
      }
      await fetchRecords();
      // reset form
      setAdding(false);
      setEditing(null);
      setClientName("");
      setTotalPages("");
      setChargePerPage("");
      setCostPerPage("");
      setImageFile(null);
      setImagePreview("");
    } catch (err: any) {
      console.error(err);
      alert("Save failed: " + (err.message || ""));
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/prints/${id}`, {
      method: "DELETE",
      headers: {
        "x-api-key": API_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    await fetchRecords();
  };

  // Edit
  const handleEdit = (r: PrintRecord) => {
    setEditing(r);
    setClientName(r.clientName);
    setAddress(r.address || "");
setPhone(r.phone || "");
setEmail(r.email || "");

    setTotalPages(r.totalPages);
    setChargePerPage(r.chargePerPage);
    setCostPerPage(r.costPerPage);
    setImagePreview(r.image || "");
    setAdding(true);
  };

  // Invoice PDF generator (beautiful template)
const generateInvoicePDF = (r: PrintRecord) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.width;

  let y = 40;

  // ---------------- LOGO ----------------
  const logo = new Image();
  logo.src = "/logo.png"; // PUBLIC FOLDER

  logo.onload = () => {
    doc.addImage(logo, "PNG", pageWidth / 2 - 40, y, 80, 80);
    y += 100;

    // ---------------- HEADER ----------------
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth / 2, y, { align: "center" });
    y += 30;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice ID: ${r._id}`, 40, y);
    doc.text(`Date: ${new Date(r.date).toLocaleDateString()}`, pageWidth - 40, y, { align: "right" });
    y += 10;

    doc.line(40, y, pageWidth - 40, y);
    y += 20;

    // ---------------- BUYER & SELLER INFO ----------------
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Buyer Information", 40, y);
    doc.text("Seller Information", pageWidth - 250, y);
    y += 18;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Buyer
    doc.text(`Name: ${r.clientName || "-"}`, 40, y);
    doc.text(`Print Shop BD`, pageWidth - 250, y); 
    y += 16;

    doc.text(`Address: ${r.address || "-"}`, 40, y);
    doc.text(`123 Business Road`, pageWidth - 250, y);
    y += 16;

    doc.text(`Phone: ${r.phone || "-"}`, 40, y);
    doc.text(`Phone: 018xx-xxxxxx`, pageWidth - 250, y);
    y += 16;

    doc.text(`Email: ${r.email || "-"}`, 40, y);
    doc.text(`Email: info@printshop.com`, pageWidth - 250, y);
    y += 30;

    // ---------------- ITEMS TABLE ----------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    doc.text("Item", 40, y);
    doc.text("Pages", 240, y);
    doc.text("Charge/Page", 320, y);
    // doc.text("Cost/Page", 400, y);
    doc.text("Total Charge", 480, y);

    y += 10;
    doc.line(40, y, pageWidth - 40, y);
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.text("Printing Service", 40, y);
    doc.text(String(r.totalPages), 240, y);
    doc.text(String(r.chargePerPage), 320, y);
    // doc.text(String(r.costPerPage), 400, y);
    doc.text(String(r.totalCharge), 480, y);
    y += 40;

    // ---------------- TOTAL ----------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    // doc.text(`TOTAL COST: ${r.totalCost} BDT`, 40, y);
    y += 50;

    // ---------------- SIGNATURE ----------------
    const signature = new Image();
    signature.src = "/signature.png";

    signature.onload = () => {
      const sigWidth = 130;
      const sigHeight = (signature.height / signature.width) * sigWidth;

      doc.addImage(signature, "PNG", pageWidth - sigWidth - 40, y, sigWidth, sigHeight);

      doc.setFontSize(11);
      doc.text("Authorized Signature", pageWidth - sigWidth - 40, y + sigHeight + 15);

      // ---------------- FOOTER (Developer Credit) ----------------
      const footerY = doc.internal.pageSize.height - 40;

      doc.setFontSize(10);
      doc.setTextColor(120);

      // Add clickable link
      const linkText = "Developed by Motasim Billah Siam";
      const linkUrl = "https://facebook.com/"; // change if needed

      doc.textWithLink(linkText, pageWidth / 2, footerY, {
        url: linkUrl,
        align: "center",
      });

      doc.save(`invoice_${r._id}.pdf`);
    };
  };
};




  // Quick text invoice modal (if you want) — we will implement PDF download link above
  const handleInvoiceClick = (r: PrintRecord) => {
    generateInvoicePDF(r);
  };

  // Search + sort computed
  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = records.filter((r) => {
      if (!q) return true;
      return (
        r.clientName.toLowerCase().includes(q) ||
        String(r.totalPages).includes(q) ||
        String(r.chargePerPage).includes(q)
      );
    });
    arr.sort((a, b) => {
      let val = 0;
      if (sortBy === "date") val = +new Date(a.date) - +new Date(b.date);
      if (sortBy === "clientName")
        val = a.clientName.localeCompare(b.clientName);
      if (sortBy === "profit") val = a.profit - b.profit;
      return sortDir === "asc" ? val : -val;
    });
    return arr;
  }, [records, query, sortBy, sortDir]);

  // Pagination slice
  const totalPagesCount = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const pageSlice = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  // Export to Excel
  const handleExportExcel = () => {
  const ws = XLSX.utils.json_to_sheet(
    records.map((r) => ({
      clientName: r.clientName,
      address: r.address || "",
      phone: r.phone || "",
      email: r.email || "",
      totalPages: r.totalPages,
      chargePerPage: r.chargePerPage,
      costPerPage: r.costPerPage,
      totalCharge: r.totalCharge,
      totalCost: r.totalCost,
      profit: r.profit,
      image: r.image || "",
      date: r.date,
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "prints");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  downloadFile(blob,`prints_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

  // Import Excel (reads first sheet, expects headers that match fields)
  const handleImportExcel = async (file: File | null) => {
  if (!file) return;
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json<any>(worksheet);
    const token = localStorage.getItem("token");

    for (const row of json) {
      const payload = {
        clientName: row.clientName || row.Client || "",
        address: row.address || row.Address || "",
        phone: row.phone || row.Phone || "",
        email: row.email || row.Email || "",
        totalPages: Number(row.totalPages || row.Pages || 0),
        chargePerPage: Number(row.chargePerPage || row["Charge/Page"] || 0),
        costPerPage: Number(row.costPerPage || row["Cost/Page"] || 0),
        totalCharge:
          Number(row.totalCharge) ||
          (Number(row.totalPages || 0) * Number(row.chargePerPage || 0)),
        totalCost:
          Number(row.totalCost) ||
          (Number(row.totalPages || 0) * Number(row.costPerPage || 0)),
        profit:
          Number(row.profit) ||
          (Number(row.totalCharge || 0) - Number(row.totalCost || 0)),
        image: row.image || row.Image || "",
      };

      await fetch(`${API_URL}/api/prints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    }
    alert("Import finished (rows posted). Refreshing list.");
    await fetchRecords();
  } catch (err) {
    console.error(err);
    alert("Import failed");
  }
};


  // Simple logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Printing Admin Dashboard</h1>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleExportExcel}
            className="px-3 py-1 bg-indigo-600 text-white rounded"
          >
            Export Excel
          </button>

          <label className="px-3 py-1 bg-green-600 text-white rounded cursor-pointer">
            Import Excel
            <input
              type="file"
              accept=".xls,.xlsx"
              className="hidden"
              onChange={(e) => handleImportExcel(e.target.files?.[0] ?? null)}
            />
          </label>

          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filters / Search / Sort */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by client / pages / charge..."
          className="p-2 border rounded w-64"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="p-2 border rounded"
        >
          <option value="date">Date</option>
          <option value="clientName">Client</option>
          <option value="profit">Profit</option>
        </select>

        <select
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value as any)}
          className="p-2 border rounded"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => {
              setAdding(true);
              setEditing(null);
              // reset form
              setClientName("");
              setTotalPages("");
              setChargePerPage("");
              setCostPerPage("");
              setImageFile(null);
              setImagePreview("");
              setAddress("");
setPhone("");
setEmail("");

            }}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Records</div>
          <div className="text-2xl font-bold">{records.length}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold">{records.reduce((s, r) => s + (r.totalCharge || 0), 0)}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Cost</div>
          <div className="text-2xl font-bold">{records.reduce((s, r) => s + (r.totalCost || 0), 0)}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Profit</div>
          <div className="text-2xl font-bold">{records.reduce((s, r) => s + (r.profit || 0), 0)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-slate-100">
            <tr className="text-left">
              <th className="p-3 border">Client</th>
              <th className="p-3 border">Pages</th>
              <th className="p-3 border">Charge/P</th>
              <th className="p-3 border">Cost/P</th>
              <th className="p-3 border">Revenue</th>
              <th className="p-3 border">Profit</th>
                 <th className="p-3 border">Address</th>
<th className="p-3 border">Phone</th>
<th className="p-3 border">Email</th>
              <th className="p-3 border">Image</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Actions</th>
           

            </tr>
          </thead>
          <tbody>
            {pageSlice.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-3">{r.clientName}</td>
                <td className="p-3">{r.totalPages}</td>
                <td className="p-3">{r.chargePerPage}</td>
                <td className="p-3">{r.costPerPage}</td>
                <td className="p-3">{r.totalCharge}</td>
                <td className="p-3">{r.profit}</td>
                <td className="p-3">{r.address || "—"}</td>
<td className="p-3">{r.phone || "—"}</td>
<td className="p-3">{r.email || "—"}</td>

                <td className="p-3">
                  {r.image ? (
                    <img
                      src={r.image}
                      alt="img"
                      className="w-14 h-14 object-cover rounded cursor-pointer"
                      onClick={() => setPopupImage(r.image!)}
                    />
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="p-3">{new Date(r.date).toLocaleString()}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(r)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="px-2 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => generateInvoicePDF(r)}
                      className="px-2 py-1 bg-indigo-600 text-white rounded"
                    >
                      Invoice
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pageSlice.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-500">
                  No records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Page {page} of {totalPagesCount}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPagesCount, p + 1))}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      </div>

      {/* Image modal */}
      {popupImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setPopupImage("")}
        >
          <img src={popupImage} className="max-h-[85vh] max-w-[90vw] rounded shadow-lg" />
        </div>
      )}

      {/* Add / Edit Drawer Modal */}
      {adding && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded shadow max-w-xl w-full p-6 relative">
            <button
              className="absolute top-3 right-4 text-xl"
              onClick={() => {
                setAdding(false);
                setEditing(null);
                setImageFile(null);
                setImagePreview("");
              }}
            >
              ✖
            </button>

            <h2 className="text-lg font-semibold mb-3">
              {editing ? "Edit Print Record" : "Add Print Record"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Client Name</label>
                <input
                  className="w-full p-2 border rounded mt-1"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm">Pages</label>
                  <input
                    className="w-full p-2 border rounded mt-1"
                    type="number"
                    step="any"
                    min={0}
                    value={totalPages}
                    onChange={(e) => setTotalPages(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm">Charge / Page</label>
                  <input
                    className="w-full p-2 border rounded mt-1"
                    step="any"
                    type="number"
                    min={0}
                    value={chargePerPage}
                    onChange={(e) => setChargePerPage(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm">Cost / Page</label>
                  <input
                    className="w-full p-2 border rounded mt-1"
                    type="number"
                    step="any"
                    min={0}
                    value={costPerPage}
                    onChange={(e) => setCostPerPage(Number(e.target.value))}
                    required
                  />
                </div>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address"
                  className="p-2 border rounded w-full"
                />

                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                  className="p-2 border rounded w-full"
                />

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="p-2 border rounded w-full"
                />

              </div>

              <div>
                <label className="block text-sm">Image (optional)</label>
                <input type="file" accept="image/*" onChange={onImageChange} className="mt-1" />
              </div>

              {imagePreview && (
                <img src={imagePreview} className="w-full h-44 object-cover rounded shadow" />
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-sm text-gray-500">Total Charge</div>
                  <div className="text-lg font-semibold">{computedTotals.totalCharge}</div>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-sm text-gray-500">Total Cost</div>
                  <div className="text-lg font-semibold">{computedTotals.totalCost}</div>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-sm text-gray-500">Profit</div>
                  <div className="text-lg font-semibold">{computedTotals.profit}</div>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                  {editing ? "Update" : "Save & Add"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border rounded"
                  onClick={() => {
                    // quick reset (but keep modal open)
                    setClientName("");
                    setTotalPages("");
                    setChargePerPage("");
                    setCostPerPage("");
                    setImageFile(null);
                    setImagePreview("");
                  }}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
