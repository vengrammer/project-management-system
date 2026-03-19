import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Pen, XCircle } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";

const GET_DEPARTMENT = gql`
  query Departments {
    departments {
      id isActive name description
      users { id }
    }
  }
`;

const GET_THE_DEPARTMENT = gql`
  query Department($departmentId: ID) {
    department(id: $departmentId) {
      id name description
    }
  }
`;

const UPDATE_DEPARTMENT = gql`
  mutation updateDepartment($updateDepartmentId: ID!, $name: String, $description: String) {
    updateDepartment(id: $updateDepartmentId, name: $name, description: $description) {
      message
    }
  }
`;

const inputCls =
  "w-full px-4 py-2 rounded-lg text-sm transition-all " +
  "border border-gray-300 dark:border-[#2a3040] " +
  "bg-white dark:bg-[#1a1f2b] " +
  "text-gray-800 dark:text-slate-200 " +
  "placeholder-gray-400 dark:placeholder-slate-600 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40 focus:border-transparent";

function FormEditDepartment({ departmentId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { refetch } = useQuery(GET_THE_DEPARTMENT, {
    variables: { departmentId },
    skip: !isOpen,
    fetchPolicy: "network-only",
  });

  const populateForm = (department) => {
    setTitle(department.name || "");
    setDescription(department.description || "");
  };

  const handleOpen = async () => {
    setIsOpen(true);
    try {
      const { data } = await refetch({ departmentId });
      if (data?.department) populateForm(data.department);
    } catch {
      toast.error("Failed to load department data");
    }
  };

  const [updateDepartment] = useMutation(UPDATE_DEPARTMENT, {
    onCompleted: () => {
      toast.success("Department updated successfully!");
      setIsOpen(false);
      setTitle("");
      setDescription("");
    },
    onError: () => {
      toast.error("Failed to update department. Please try again.");
    },
    refetchQueries: [{ query: GET_DEPARTMENT }],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateDepartment({
      variables: { updateDepartmentId: departmentId, name: title, description: description },
    });
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTitle("");
    setDescription("");
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        title="Edit"
        className="flex-1 lg:flex-none px-2 py-2 rounded cursor-pointer text-sm font-medium lg:font-normal transition-all duration-150
          bg-green-600 hover:bg-green-700 text-white
          dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
          dark:hover:shadow-[0_0_8px_rgba(49,246,75,0.35)]"
      >
        <span className="lg:hidden">Edit</span>
        <Pen size={18} className="hidden lg:block" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#222732] rounded-lg shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] max-w-lg w-full">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2a3040]">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 rounded-full bg-blue-600 dark:bg-[#31f64b]" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  Edit Department
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#252d3d] rounded-lg transition-colors"
              >
                <XCircle size={24} className="text-gray-500 dark:text-slate-500 cursor-pointer" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Department Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. I.T, Shopee, Gcash…"
                    required
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe this department's role and responsibilities…"
                    rows={4}
                    className={inputCls + " resize-none"}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-[#2a3040]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all duration-150
                    border border-gray-300 dark:border-[#2a3040]
                    bg-white dark:bg-[#1a1f2b]
                    text-gray-700 dark:text-slate-300
                    hover:bg-gray-100 dark:hover:bg-[#252d3d]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 cursor-pointer rounded-lg text-sm font-semibold transition-all duration-150
                    bg-blue-600 hover:bg-blue-700 text-white
                    dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
                    dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]
                    flex items-center gap-2"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default FormEditDepartment;
