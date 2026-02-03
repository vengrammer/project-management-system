import { useId, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

export default function FormAddProject() {
  const id = useId();
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    client: "",
    department: "",
    status: "",
    priority: "",
    progress: "",
    tags: "",
    projectManager: "",
    assignee: "",
    teamSize: "",
    budget: "",
    startDate: "",
    dueDate: "",
  });

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your submit logic here
  };

  const employees = [
    { id: 1, name: "Alice Johnson" },
    { id: 2, name: "Bob Smith" },
    { id: 3, name: "Carol Williams" },
    { id: 4, name: "David Brown" },
    { id: 5, name: "Eva Martinez" },
    { id: 6, name: "Frank Lee" },
    { id: 7, name: "Grace Kim" },
    { id: 8, name: "Henry Clark" },
  ];

  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id],
    );
  };
  return (
    <div className="max-w-500 rounded">
      <Dialog className="min-w-200">
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 hover:text-white"
          >
            <Plus size={20} />
            Add New Project
          </Button>
        </DialogTrigger>
        {/*this is the size adjustment*/}
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:w-full md:max-w-3xl lg:max-w-4xl p-6">
          <div className="flex flex-col items-center gap-2 rounded">
            <div
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-full border"
            >
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-10 object-contain rounded-full"
              />
            </div>
            <DialogHeader>
              <DialogTitle className="sm:text-center">
                Create New Project
              </DialogTitle>
              <DialogDescription className="sm:text-center">
                Please fill in the information below to create a new project.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                Basic Information
              </h3>

              {/* Project Name - Full Width */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${id}-projectName`}>
                    Project Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`${id}-projectName`}
                    placeholder="Enter project name"
                    value={formData.projectName}
                    onChange={(e) =>
                      handleInputChange("projectName", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* Description - Full Width */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${id}-description`}>
                    Project Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id={`${id}-description`}
                    placeholder="Enter project description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                    required
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Client, Department, Status - 3 Columns on Wide Screen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${id}-client`}>
                    Client <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`${id}-client`}
                    placeholder="Enter client name"
                    value={formData.client}
                    onChange={(e) =>
                      handleInputChange("client", e.target.value)
                    }
                    required
                  />
                </div>

                {/*employee depends on */}
                <div className="space-y-2">
                  <Label htmlFor={`${id}-status`}>
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                    required
                  >
                    <SelectTrigger id={`${id}-status`}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Department dropdown*/}
                <div className="space-y-2">
                  <Label htmlFor={`${id}-department`}>
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      handleInputChange("department", value)
                    }
                    required
                  >
                    <SelectTrigger id={`${id}-department`}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/*employee dropdown */}
                <Label htmlFor={`${id}-department`}>
                  Department <span className="text-red-500 ">*</span>
                </Label>
                <div className="col-span-full">
                  <div className="w-full bg-gray-200 h-50 overflow-auto rounded py-3 px-5">
                    {employees.map((emp) => (
                      <label
                        key={emp.id}
                        className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-gray-300 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(emp.id)}
                          onChange={() => toggleEmployee(emp.id)}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-800">
                          {emp.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                Project Details
              </h3>

              {/* Priority, Progress, Tags - 3 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${id}-priority`}>
                    Priority <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      handleInputChange("priority", value)
                    }
                    required
                  >
                    <SelectTrigger id={`${id}-priority`}>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${id}-progress`}>
                    Progress Percentage <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`${id}-progress`}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g., 50"
                    value={formData.progress}
                    onChange={(e) =>
                      handleInputChange("progress", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${id}-tags`}>Tags</Label>
                  <Input
                    id={`${id}-tags`}
                    placeholder="e.g., Design, Frontend, API"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Team & Resources Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                Team & Resources
              </h3>

              {/* Project Manager, Assignee, Team Size - 3 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${id}-projectManager`}>
                    Project Manager <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`${id}-projectManager`}
                    placeholder="Enter project manager name"
                    value={formData.projectManager}
                    onChange={(e) =>
                      handleInputChange("projectManager", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${id}-assignee`}>
                    Lead Assignee <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`${id}-assignee`}
                    placeholder="Enter lead assignee name"
                    value={formData.assignee}
                    onChange={(e) =>
                      handleInputChange("assignee", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${id}-teamSize`}>
                    Team Size <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`${id}-teamSize`}
                    type="number"
                    min="1"
                    placeholder="Number of team members"
                    value={formData.teamSize}
                    onChange={(e) =>
                      handleInputChange("teamSize", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* Budget - Can span or be in row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${id}-budget`}>
                    Budget <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`${id}-budget`}
                    placeholder="e.g., $50,000"
                    value={formData.budget}
                    onChange={(e) =>
                      handleInputChange("budget", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                Timeline
              </h3>

              {/* Start Date, End Date - 2 or 3 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${id}-startDate`}>
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`${id}-startDate`}
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${id}-dueDate`}>
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`${id}-dueDate`}
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      handleInputChange("dueDate", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex cursor-pointer items-center gap-2 px-4 py-2 border roubded bg-white hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </Button>
              </DialogTrigger>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Create Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
