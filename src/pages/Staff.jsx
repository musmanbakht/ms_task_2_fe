import LoadingSkeleton from "../components/Common/LoadingSkeleton";
import { useEffect, useState } from "react";
// import {
//   MagnifyingGlassIcon,
//   Pencil1Icon,
//   TrashIcon,
//   EyeOpenIcon,
// } from "@radix-ui/react-icons";
import { IoTrashOutline } from "react-icons/io5";
import { LuPencil } from "react-icons/lu";

// import * as Checkbox from "@radix-ui/react-checkbox";
// import * as Select from "@radix-ui/react-select";
// import * as Dialog from "@radix-ui/react-dialog";
// import * as Tooltip from "@radix-ui/react-tooltip";
// import * as Select from "@radix-ui/react-select";
// import { Dialog } from "radix-ui";
// import { Tooltip } from "radix-ui";
// import { PlusIcon } from "@radix-ui/react-icons";
import { getAllStaff } from "../API/index"; // <- your API function
// import { Select } from "radix-ui";
// import Sidebar from "../components/Sidebar/Sidebar";
// import AdminNavbar from "../components/Navbars/AdminNavbar";
// import { Button } from "@radix-ui/themes";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [metadata, setMetadata] = useState({ totalPages: 1, page: 1 });

  useEffect(() => {
    fetchStaff();
  }, [page, limit, search]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await getAllStaff(search, page, limit);
      const { allStaff, metadata } = res.data;
      setStaff(allStaff || []);
      setTotalPages(metadata.totalPages);
      setPage(metadata.page); // ensure sync with backend
      setMetadata(metadata);
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === staff.length ? [] : staff.map((s) => s.id)
    );
  };

  const handleDelete = () => {
    // TODO: call delete API with selectedRows
    console.log("Deleting:", selectedRows);
    setDeleteModalOpen(false);
    setSelectedRows([]);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };
  return (
    <>
      <div>
        {/* <AdminNavbar /> */}
        <div className="flex flex-col h-full bg-blueGray-500 overflow-hidden py-8">
          <main className="container min-w-full mx-auto flex-grow px-6 py-8">
            <div className="bg-white shadow-lg rounded-lg p-8">
              <div className="p-4">
                {/* Header */}
                <div className="flex  sm:flex-row justify-between sm:items-center mb-6 gap-4">
                  <h2 className="text-xl font-bold text-gray-700">
                    Staff Management
                  </h2>

                  <div className="flex gap-2 items-center">
                    {selectedRows.length > 0 && (
                      <button
                        className="px-4 py-2 rounded-lg bg-red-500 text-white shadow hover:bg-red-600"
                        onClick={() => setDeleteModalOpen(true)}
                      >
                        Delete All
                      </button>
                    )}

                    <div className="relative">
                      {/* <MagnifyingGlassIcon className="absolute left-3 top-3 text-gray-400" /> */}
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1); // reset page on search
                        }}
                        placeholder="Search staff..."
                        className="pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring w-64"
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  {loading ? (
                    <LoadingSkeleton text="Loading staff…" className="h-48" />
                  ) : staff.length > 0 ? (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          {/* <th className="px-4 py-2"> */}
                          {/* <Checkbox.Root
                              checked={selectedRows.length === staff.length}
                              onCheckedChange={handleSelectAll}
                              className="h-4 w-4 border rounded"
                            >
                              <Checkbox.Indicator />
                            </Checkbox.Root> */}
                          {/* </th> */}
                          <th className="text-left px-4 py-2">Name</th>
                          <th className="text-left px-4 py-2">Email</th>
                          <th className="text-left px-4 py-2">Designation</th>
                          <th className="text-left px-4 py-2">School</th>
                          <th className="text-left px-4 py-2">Created At</th>
                          <th className="text-center px-4 py-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.map((s) => (
                          <tr key={s.id} className="border-b hover:bg-gray-50">
                            {/* <td className="px-4 py-2">
                              <Checkbox.Root
                                checked={selectedRows.includes(s.id)}
                                onCheckedChange={() => handleRowSelect(s.id)}
                                className="h-4 w-4 border rounded"
                              >
                                <Checkbox.Indicator />
                              </Checkbox.Root>
                            </td> */}
                            <td className="px-4 py-2">{s.name}</td>
                            <td className="px-4 py-2">{s.email}</td>
                            <td className="px-4 py-2">{s.designation}</td>
                            <td className="px-4 py-2">{s.school?.name}</td>
                            <td className="px-4 py-2">
                              {formatDate(s.createdAt)}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <div className="flex justify-center gap-2">
                                {/* <Tooltip.Provider>
                                  <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                      <button className="text-gray-500 hover:text-green-600">
                                        <EyeOpenIcon />
                                      </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>View</Tooltip.Content>
                                  </Tooltip.Root>
                                </Tooltip.Provider> */}

                                <button className="text-gray-500 hover:text-blue-600">
                                  <LuPencil />
                                </button>

                                <button
                                  className="text-gray-500 hover:text-red-600"
                                  onClick={() => setDeleteModalOpen(true)}
                                >
                                  <IoTrashOutline />
                                </button>

                                {/* <Tooltip.Provider>
                                  <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                      <button className="IconButton">
                                        <PlusIcon />
                                      </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                      <Tooltip.Content
                                        className="TooltipContent"
                                        sideOffset={5}
                                      >
                                        Add to library
                                        <Tooltip.Arrow className="TooltipArrow" />
                                      </Tooltip.Content>
                                    </Tooltip.Portal>
                                  </Tooltip.Root>
                                </Tooltip.Provider> */}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-20 text-gray-500">
                      No staff found
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {staff.length > 0 && (
                  <div className="flex justify-end items-center gap-4 mt-5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-md font-normal text-gray-700 rounded-full">
                        {metadata.total} Records
                      </h2>
                      <span className="text-sm text-gray-600 px-2">Rows:</span>
                      <select
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setPage(1);
                        }}
                        className="px-3 py-1 border rounded-full w-20 focus:outline-none focus:ring-2 focus:ring-blueGray-600 focus:border-blueGray-600 cursor-pointer"
                      >
                        {[5, 10, 15, 20].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="px-2">
                        <button
                          disabled={page === 1}
                          onClick={() => setPage((p) => p - 1)}
                          className="px-4 py-1 border rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Prev
                        </button>
                      </div>

                      <span>
                        {page} / {totalPages}
                      </span>
                      {/* <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                      >
                        Next
                      </button> */}
                      <div className="px-2">
                        <button
                          disabled={page === totalPages}
                          onClick={() => setPage((p) => p + 1)}
                          className="px-3 py-1 border rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Delete Modal */}
          {/* <Dialog.Root open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/30" />
              <Dialog.Content className="fixed top-1/2 left-1/2 bg-white rounded-lg p-6 shadow-lg transform -translate-x-1/2 -translate-y-1/2">
                <Dialog.Title className="font-bold text-lg">
                  Delete Staff
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-600 mt-2">
                  Are you sure you want to delete {selectedRows.length} staff
                  member(s)?
                </Dialog.Description>
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => setDeleteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root> */}
        </div>
      </div>
    </>
  );
}
