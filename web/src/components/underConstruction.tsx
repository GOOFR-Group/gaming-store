import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function UnderConstructionPage(props: { showBack?: boolean }) {
  return (
    <Card className="flex flex-col items-center text-center min-h-full">
      <CardTitle className="mt-12">Under Construction</CardTitle>
      <CardDescription className={props.showBack ? "" : "mb-12"}>
        This page is under construction.
      </CardDescription>
      {props.showBack && (
        <Button asChild className="w-fit mt-4 mb-12">
          <Link to="..">
            <ArrowLeft /> Go Back
          </Link>
        </Button>
      )}
    </Card>
  );
}
