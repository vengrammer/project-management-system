//for creating the account
import { useId, useState} from "react";
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { Eye, EyeOff, Plus } from "lucide-react";

export default function FormAddUser() {
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
    role: "",
    showPassword: false,
  });

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [showPassword, setShowPassword] = useState(true);
  const id = useId();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 hover:text-white"
        >
          <Plus size={20} />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:w-full md:max-w-3xl lg:max-w-xl p-6">
        <div className="flex flex-col items-center gap-2 rounded">
          <div
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border "
          >
            <img
              src={logo}
              alt="Logo"
              className="h-10 w-10 object-contain rounded-full"
            />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              Welcome to the Project Management System
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              Enter your credentials to create an account.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <div className="space-y-4">
            <div className="*:not-first:mt-2">
              <Label htmlFor={`${id}-email`}>Fullname</Label>
              <Input
                id={`${id}-email`}
                placeholder="Enter your Fullname"
                required
              />
            </div>
            {/*dropdown for department and role*/}
            <div className="flex flex-row space-between gap-15">
              <div className="space-y-2">
                <div>
                  <Label htmlFor={`${id}-department`}>
                    Department <span className="text-red-500">*</span>
                  </Label>
                </div>
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
              {/*dropdown for role*/}
              <div className="space-y-2">
                <div>
                  <Label htmlFor={`${id}-department`}>
                    Role <span className="text-red-500">*</span>
                  </Label>
                </div>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                  required
                >
                  <SelectTrigger id={`${id}-role`}>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="*:not-first:mt-2">
              <Label htmlFor={`${id}-email`}>Email address</Label>
              <Input
                id={`${id}-email`}
                placeholder="Enter your email address"
                required
              />
            </div>
            <div className="*:not-first:mt-2">
              <Label htmlFor={`${id}-email`}>Username</Label>
              <Input
                id={`${id}-email`}
                placeholder="Enter your Username"
                required
              />
            </div>
            <div className="relative">
              <div className="*:not-first:mt-2">
                <Label htmlFor={`${id}-password`}>Password</Label>
                <Input
                  id={`${id}-password`}
                  placeholder="Enter your password"
                  required
                  type={showPassword ? "password" : "text"}
                  className="pr-10"
                />
              </div>

              {/* Eye toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-12 -translate-y-1/2 text-black cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-between gap-2"></div>
          <Button className="w-full" type="button">
            Create Account
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
