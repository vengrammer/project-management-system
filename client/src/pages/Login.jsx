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

export default function Login() {

  const id = useId();

  return (
    <Dialog >
      <DialogTrigger asChild>
        <Button variant="ghost" className="border border-black">Sign in</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2 rounded" >
          <div
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border ">
            <img src={logo} alt="Logo" className="h-10 w-10 object-contain rounded-full" />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">Welcome back</DialogTitle>
            <DialogDescription className="sm:text-center">
              Enter your credentials to login to your account.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <div className="space-y-4">
            <div className="*:not-first:mt-2">
              <Label htmlFor={`${id}-email`}>Username</Label>
              <Input id={`${id}-email`} placeholder="Enter your Username" required  />
            </div>
            <div className="*:not-first:mt-2">
              <Label htmlFor={`${id}-password`}>Password</Label>
              <Input
                id={`${id}-password`}
                placeholder="Enter your password"
                required
                type="password" />
            </div>
          </div>
          <div className="flex justify-between gap-2">
          </div>
          <Button className="w-full" type="button">
            Sign in
          </Button>
        </form>
      </DialogContent>
      
    </Dialog>
  );
}