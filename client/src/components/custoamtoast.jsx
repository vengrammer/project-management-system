"use client";

import { CircleCheckIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export default function Component() {
  return (
    <Button
      onClick={() => {
        toast.custom((t) => (
          <div className="w-full rounded-md border bg-background px-4 py-3 text-foreground shadow-lg sm:w-(--width)]">
            <div className="flex gap-2">
              <div className="flex grow gap-3">
                <CircleCheckIcon
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-emerald-500"
                  size={16}
                />
                <div className="flex grow justify-between gap-12">
                  <p className="text-sm">Message sent</p>
                  <div className="whitespace-nowrap text-sm">
                    <button
                      className="font-medium text-sm hover:underline"
                      type="button"
                    >
                      View
                    </button>{" "}
                    <span className="mx-1 text-muted-foreground">·</span>{" "}
                    <button
                      className="font-medium text-sm hover:underline"
                      onClick={() => toast.dismiss(t)}
                      type="button"
                    >
                      Undo
                    </button>
                  </div>
                </div>
              </div>
              <Button
                aria-label="Close banner"
                className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
                onClick={() => toast.dismiss(t)}
                variant="ghost"
              >
                <XIcon
                  aria-hidden="true"
                  className="opacity-60 transition-opacity group-hover:opacity-100"
                  size={16}
                />
              </Button>
            </div>
          </div>
        ));
      }}
      variant="outline"
    >
      Custom sonner
    </Button>
  );
}
