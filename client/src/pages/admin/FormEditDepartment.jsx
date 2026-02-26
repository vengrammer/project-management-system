import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Pen, XCircle } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";


const GET_DEPARTMENT = gql`
  query Departments {
    departments {
      id
      isActive
      name
      description
      users {
        id
      }
    }
  }
`;


const GET_THE_DEPARTMENT = gql`
  query Department($departmentId: ID) {
    department(id: $departmentId) {
      id
      name
      description
    }
  }
`;

const UPDATE_DEPARTMENT = gql`
  mutation updateDepartment(
    $updateDepartmentId: ID!
    $name: String
    $description: String
  ) {
    updateDepartment(
      id: $updateDepartmentId
      name: $name
      description: $description
    ) {
      message
    }
  }
`;

function FormEditDepartment({ departmentId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Only fetch when modal is open
  const { data: dataDepartment } = useQuery(GET_THE_DEPARTMENT, {
    variables: { departmentId },
    skip: !isOpen,
  });

  const [updateDepartment] = useMutation(UPDATE_DEPARTMENT,
    {
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
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedTitle = title || dataDepartment?.department?.name;
    const updatedDescription = description || dataDepartment?.department?.description;
    updateDepartment({
      variables: {
        updateDepartmentId: departmentId,
        name: updatedTitle,
        description: updatedDescription,
      },
    });
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex-1 lg:flex-none px-2 py-2 rounded cursor-pointer  bg-green-600 text-white hover:bg-green-700  text-sm font-medium lg:font-normal"
        title="Edit"
      >
        <span className="lg:hidden">Edit</span>
        <Pen size={20} className="hidden lg:block" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Edit Department
              </h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Reset form when closing
                  setTitle("");
                  setDescription("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={24} className="text-gray-500 cursor-pointer" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department Title *
                  </label>
                  <input
                    type="text"
                    value={title || dataDepartment?.department?.name || ""}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Engineering, Marketing, Finance…"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={
                      description ||
                      dataDepartment?.department?.description ||
                      ""
                    }
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe this department's role and responsibilities…"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setTitle("");
                    setDescription("");
                  }}
                  className="px-6 py-2 cursor-pointer border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
