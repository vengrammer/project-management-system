import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { Plus, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const CREATE_DEPARTMENT = gql`
  mutation CreateDepartment($name: String!, $description: String) {
    createDepartment(name: $name, description: $description) {
      message
    }
  }
`;

const GET_DEPARTMENT = gql`
  query Departments {
    departments {
      id isActive name description
      users { id }
    }
  }
`;

function FormAddDepartment() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [createDepartment] = useMutation(CREATE_DEPARTMENT, {
    onCompleted: () => {
      toast.success("Successfully created department!");
      setTitle("");
      setDescription("");
    },
    onErro: () => {
      toast.error("Error in creating department!");
    },
    refetchQueries: [{ query: GET_DEPARTMENT }],
    awaitRefetchQueries: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createDepartment({ variables: { name: title, description: description } });
  };

  const inputCls =
    "w-full px-4 py-2 rounded-lg text-sm transition-all " +
    "border border-gray-300 dark:border-[#2a3040] " +
    "bg-white dark:bg-[#1a1f2b] " +
    "text-gray-800 dark:text-slate-200 " +
    "placeholder-gray-400 dark:placeholder-slate-600 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40 focus:border-transparent";

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150
          bg-blue-600 hover:bg-blue-700 text-white
          dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
          dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]"
      >
        <Plus size={18} />
        Add Department
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
                  Create Department
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
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
                    placeholder="e.g. Engineering, Marketing, Finance…"
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
                  onClick={() => setIsOpen(false)}
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default FormAddDepartment;
