import { Input } from "@/components/ui/input";

export function Search(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      className="max-w-sm"
      placeholder="Search"
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
    />
  );
}
