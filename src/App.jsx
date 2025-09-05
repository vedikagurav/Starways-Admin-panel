import { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  // Customer
  const [customerName, setCustomerName] = useState("");
  const [customers, setCustomers] = useState([]);

  // Menu
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  // Drawing Upload
  const [drawingNo, setDrawingNo] = useState("");
  const [file, setFile] = useState(null);
  const [drawings, setDrawings] = useState([]);

  // ✅ Search State
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch Customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/customers");
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  // ✅ Fetch Drawings
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/drawings")
      .then((res) => setDrawings(res.data)) // ✅ already sorted by backend
      .catch((err) => console.error(err));
  }, []);

  // ✅ Add Customer
  const handleAddCustomer = async () => {
    if (!customerName.trim()) {
      alert("Please enter a customer name");
      return;
    }
    try {
      const { data } = await axios.post("http://localhost:5000/api/customers", {
        name: customerName,
      });
      alert("Customer Added: " + data.name);
      setCustomerName("");
      setCustomers([...customers, data]); // update list
    } catch (error) {
      console.error(error);
      alert("Error adding customer");
    }
  };

  // ✅ File Change → Auto Extract Drawing No
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const fileNameWithoutExt = uploadedFile.name
        .split(".")
        .slice(0, -1)
        .join(".");
      setDrawingNo(fileNameWithoutExt);
    }
  };

  // ✅ Upload Drawing
  const handleUploadDrawing = async () => {
    if (!file) {
      alert("Please select a PDF");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("drawingNo", drawingNo);

      const { data } = await axios.post(
        "http://localhost:5000/api/drawings",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // ✅ Add new drawing at top
      setDrawings((prev) => [data, ...prev]);

      alert("Drawing uploaded successfully!");
      setFile(null);
      setDrawingNo("");
    } catch (error) {
      console.error(error);
      alert("Error uploading drawing");
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Customers", icon: "👥" },
    { name: "Drawings", icon: "📁" },
    { name: "Search", icon: "🔍" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-800">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveMenu(item.name)}
              className={`w-full text-left px-4 py-2 rounded flex items-center gap-2 transition
                ${
                  activeMenu === item.name
                    ? "bg-gray-800 font-semibold"
                    : "hover:bg-gray-800"
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500">Welcome back, Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-gray-500">Profile</div>
            <div className="w-12 h-12 bg-gray-400 rounded-full border-2 border-gray-300"></div>
          </div>
        </header>

        {/* Customer Section */}
        <section className="bg-white rounded-2xl shadow p-6 mb-8 hover:shadow-lg transition max-w-lg">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 text-gray-800">
            Customer Management
          </h2>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border border-gray-300 p-3 rounded-l-xl flex-1 focus:ring-2 focus:ring-teal-500 outline-none transition"
            />
            <button
              onClick={handleAddCustomer}
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-r-xl shadow flex items-center gap-2"
            >
              <span className="text-xl">+</span> Add
            </button>
          </div>
          {/* Show Customer List */}
          <ul className="mt-4 text-gray-700">
            {customers.map((c) => (
              <li key={c._id} className="border-b py-1">
                {c.name}
              </li>
            ))}
          </ul>
        </section>

        {/* Drawing Upload Section */}
        <section className="bg-white rounded-2xl shadow p-6 mb-8 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 text-gray-800">
            Drawing Upload
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <select className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition">
              <option>Select Customer</option>
              {customers.map((c) => (
                <option key={c._id}>{c.name}</option>
              ))}
            </select>

            {/* Auto-filled Drawing No */}
            <input
              type="text"
              placeholder="Drawing No."
              value={drawingNo}
              readOnly
              className="border border-gray-300 p-3 rounded-xl bg-gray-100 text-gray-700"
            />

            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
            />
          </div>
          <button
            onClick={handleUploadDrawing}
            className="bg-teal-600 hover:bg-teal-700 transition text-white px-6 py-3 rounded-xl shadow flex items-center gap-2"
          >
            <span>📤</span> Upload
          </button>
        </section>

        {/* Search & Display Section */}
       {/* 🔍 Search & Display Section */}
<section className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6">
  <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-2">
    Search & Display
  </h2>

  {/* ✅ Search Box */}
  <div className="flex items-center mb-5">
    <input
      type="text"
      placeholder="Search Drawing No..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="flex-1 border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
    />
    <button
      onClick={() => setSearchTerm("")}
      className="ml-3 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
    >
      Clear
    </button>
  </div>

  {/* ✅ Table */}
  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
    <table className="w-full border-collapse text-sm sm:text-base">
      <thead className="bg-gray-100 text-gray-700">
        <tr>
          <th className="p-3 border font-medium">Sr No</th>
          <th className="p-3 border font-medium">Drawing No</th>
          <th className="p-3 border font-medium">File</th>
          <th className="p-3 border font-medium">Uploaded Time</th>
        </tr>
      </thead>

      <tbody>
        {drawings
          .filter((d) =>
            searchTerm.trim() === ""
              ? true // ✅ show all if search is empty
              : d.drawingNo
                  .toLowerCase()
                  .includes(searchTerm.trim().toLowerCase()) // ✅ case-insensitive + trim
          )
          .map((d, index) => (
            <tr
              key={d._id}
              className="hover:bg-gray-50 transition text-gray-800"
            >
              <td className="p-3 border text-center">{index + 1}</td>
              <td className="p-3 border font-medium">{d.drawingNo}</td>
              <td className="p-3 border">
                <a
                  href={`http://localhost:5000/${d.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-600 font-medium hover:underline"
                >
                  View File
                </a>
              </td>
              <td className="p-3 border text-gray-600">
                {new Date(d.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}

        {/* ✅ Show "No Results" */}
        {drawings.filter((d) =>
          d.drawingNo
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase())
        ).length === 0 && (
          <tr>
            <td
              colSpan="4"
              className="p-4 text-center text-gray-500 italic"
            >
              No results found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>

      </main>
    </div>
  );
}
