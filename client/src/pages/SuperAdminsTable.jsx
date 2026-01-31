import React, { useState, useEffect } from "react";
import {
  Edit2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Plus,
  Trash2,
} from "lucide-react";
import FormAddUser from "./FormAddUser";

const EmployeeTable = () => {
  // Sample data structure - easily adaptable to your needs
  const sampleProjects = [
    {
      id: 1,
      projectName: "Website Redesign",
      status: "In Progress",
      priority: "High",
      assignee: "John Doe",
      dueDate: "2024-02-15",
      budget: "$50,000",
    },
    {
      id: 2,
      projectName: "Mobile App Development",
      status: "Planning",
      priority: "Medium",
      assignee: "Jane Smith",
      dueDate: "2024-03-20",
      budget: "$75,000",
    },
    {
      id: 3,
      projectName: "Database Migration",
      status: "Completed",
      priority: "High",
      assignee: "Mike Johnson",
      dueDate: "2024-01-30",
      budget: "$30,000",
    },
    {
      id: 4,
      projectName: "Marketing Campaign",
      status: "In Progress",
      priority: "Low",
      assignee: "Sarah Wilson",
      dueDate: "2024-02-28",
      budget: "$25,000",
    },
    {
      id: 5,
      projectName: "Security Audit",
      status: "Not Started",
      priority: "High",
      assignee: "Tom Brown",
      dueDate: "2024-04-10",
      budget: "$40,000",
    },
    {
      id: 6,
      projectName: "API Integration",
      status: "In Progress",
      priority: "Medium",
      assignee: "Emily Davis",
      dueDate: "2024-03-05",
      budget: "$35,000",
    },
    {
      id: 7,
      projectName: "Cloud Infrastructure",
      status: "Planning",
      priority: "High",
      assignee: "David Lee",
      dueDate: "2024-03-15",
      budget: "$60,000",
    },
    {
      id: 8,
      projectName: "User Training",
      status: "Not Started",
      priority: "Low",
      assignee: "Lisa Anderson",
      dueDate: "2024-04-20",
      budget: "$15,000",
    },
    {
      id: 9,
      projectName: "Website Redesign",
      status: "In Progress",
      priority: "High",
      assignee: "John Doe",
      dueDate: "2024-02-15",
      budget: "$50,000",
    },
    {
      id: 10,
      projectName: "Mobile App Development",
      status: "Planning",
      priority: "Medium",
      assignee: "Jane Smith",
      dueDate: "2024-03-20",
      budget: "$75,000",
    },
    {
      id: 11,
      projectName: "Database Migration",
      status: "Completed",
      priority: "High",
      assignee: "Mike Johnson",
      dueDate: "2024-01-30",
      budget: "$30,000",
    },
    {
      id: 12,
      projectName: "Marketing Campaign",
      status: "In Progress",
      priority: "Low",
      assignee: "Sarah Wilson",
      dueDate: "2024-02-28",
      budget: "$25,000",
    },
    {
      id: 13,
      projectName: "Security Audit",
      status: "Not Started",
      priority: "High",
      assignee: "Tom Brown",
      dueDate: "2024-04-10",
      budget: "$40,000",
    },
    {
      id: 14,
      projectName: "API Integration",
      status: "In Progress",
      priority: "Medium",
      assignee: "Emily Davis",
      dueDate: "2024-03-05",
      budget: "$35,000",
    },
    {
      id: 15,
      projectName: "Cloud Infrastructure",
      status: "Planning",
      priority: "High",
      assignee: "David Lee",
      dueDate: "2024-03-15",
      budget: "$60,000",
    },
    {
      id: 16,
      projectName: "User Training",
      status: "Not Started",
      priority: "Low",
      assignee: "Lisa Anderson",
      dueDate: "2024-04-20",
      budget: "$15,000",
    },
  ];

  const [data, setData] = useState(sampleProjects);
  const [filteredData, setFilteredData] = useState(sampleProjects);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState({});

  // Get dynamic columns from data
  const columns =
    data.length > 0 ? Object.keys(data[0]).filter((key) => key !== "id") : [];

  // Filter and search logic
  useEffect(() => {
    let result = [...data];

    // Apply search
    if (searchTerm) {
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue) {
        result = result.filter((row) =>
          String(row[column]).toLowerCase().includes(filterValue.toLowerCase()),
        );
      }
    });

    setFilteredData(result);
    setCurrentPage(1);
  }, [searchTerm, columnFilters, data]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Handle cell double click
  const handleCellDoubleClick = (rowId, column, value) => {
    setEditingCell({ rowId, column });
    setEditValue(value);
  };

  // Save edited value
  const handleSave = () => {
    if (editingCell) {
      setData((prevData) =>
        prevData.map((row) =>
          row.id === editingCell.rowId
            ? { ...row, [editingCell.column]: editValue }
            : row,
        ),
      );
      setEditingCell(null);
      setEditValue("");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  // Handle Enter key to save
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Add new row
  const handleAddRow = () => {
    const newRow = {
      id: Math.max(...data.map((d) => d.id)) + 1,
      ...columns.reduce((acc, col) => ({ ...acc, [col]: "" }), {}),
    };
    setData([...data, newRow]);
  };

  // Delete row
  const handleDeleteRow = (id) => {
    setData(data.filter((row) => row.id !== id));
  };

  // Pagination controls
  const goToPage = (page) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  return (
    <div className="w-full max-h-screen  max-w-sreen mx-auto md:p-6 bg-gray-200 min-h-screen rounded-2xl">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Super Admins
          </h1>
          {/* Search and Actions */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-62.5">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search across all columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <FormAddUser/>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-6 py-3 text-left">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        {column.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <input
                        type="text"
                        placeholder={`Filter...`}
                        value={columnFilters[column] || ""}
                        onChange={(e) =>
                          setColumnFilters({
                            ...columnFilters,
                            [column]: e.target.value,
                          })
                        }
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td
                      key={`${row.id}-${column}`}
                      className="px-6 py-4 whitespace-nowrap"
                      onDoubleClick={() =>
                        handleCellDoubleClick(row.id, column, row[column])
                      }
                    >
                      {editingCell?.rowId === row.id &&
                      editingCell?.column === column ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            autoFocus
                            className="px-2 py-1 border border-blue-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                          />
                          <button
                            onClick={handleSave}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group cursor-pointer">
                          <span className="text-sm text-gray-900">
                            {row[column]}
                          </span>
                          <Edit2
                            size={14}
                            className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Items per page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Page info */}
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredData.length)} of {filteredData.length}{" "}
              results
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft size={20} />
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 rounded transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTable;
