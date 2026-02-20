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
    createDepartment({
      variables: {
        name: title,
        description: description
      },
    });
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        <Plus size={20} />
        Add Department
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Create Department
              </h2>
              <button
                onClick={() => setIsOpen(false)}
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
                    value={title}
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
                    value={description}
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
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 cursor-pointer border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
