import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UnderConstructionPage(props: { showBack?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <h3 className="mt-12 text-2xl font-semibold leading-none tracking-tight">
        Under Construction
      </h3>
      <p
        className={cn("text-sm text-muted-foreground", {
          "mb-12": !props.showBack,
        })}
      >
        This page is under construction.
      </p>
      {props.showBack && (
        <Button asChild className="w-fit mt-4 mb-12">
          <Link to="..">
            <ArrowLeft /> Go Back
          </Link>
        </Button>
      )}
    </div>
  );
}
