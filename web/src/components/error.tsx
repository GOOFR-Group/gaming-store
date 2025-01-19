import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Error(props: {
  title: string;
  description: string;
  showBack?: boolean;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center text-center min-h-full",
        props.className,
      )}
    >
      <CardTitle className="mt-12">{props.title}</CardTitle>
      <CardDescription>{props.description}</CardDescription>
      {props.showBack && (
        <Button asChild className="w-fit mt-4">
          <Link to="..">
            <ArrowLeft /> Go Back
          </Link>
        </Button>
      )}
    </Card>
  );
}
