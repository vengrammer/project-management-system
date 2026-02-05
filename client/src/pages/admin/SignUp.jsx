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
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";

export default function SignUp() {
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

  const id = useId();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="bg-blue-400 hover:bg-blue-500">
          Get Started
        </Button>
      </DialogTrigger>
      <DialogContent>
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
            <div className="flex gap-2 flex-row">
              <div className="*:not-first:mt-2">
                <Label htmlFor={`${id}-email`}>Fullname</Label>
                <Input
                  id={`${id}-email`}
                  placeholder="Enter your Fullname"
                  required
                />
              </div>
              {/*dropdown for department*/}
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
            <div className="*:not-first:mt-2">
              <Label htmlFor={`${id}-password`}>Password</Label>
              <Input
                id={`${id}-password`}
                placeholder="Enter your password"
                required
                type="password"
              />
            </div>

            <div className="*:not-first:mt-2">
              <Label htmlFor={`${id}-password`}>Confirm Password</Label>
              <Input
                id={`${id}-password`}
                placeholder="Enter your password"
                required
                type="password"
              />
            </div>
          </div>
          <div className="flex justify-between gap-2"></div>
          <Button className="w-full" type="button">
            Sign Up
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}