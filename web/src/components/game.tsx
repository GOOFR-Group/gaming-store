import { Link } from "@tanstack/react-router";

export function Game(props: {
  title: string;
  publisher: string;
  price: number;
  image: string;
}) {
  return (
    <Link className="group" href="/games/1">
      <img
        alt="Game cover"
        className="object-cover h-[400px] rounded-lg w-full transition-transform group-hover:scale-105"
        src={props.image}
      />
      <div className="py-2 flex flex-col gap-1">
        <p className="text-sm text-gray-400">{props.publisher}</p>
        <h3 className="text-xl font-semibold">{props.title}</h3>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <p>€{props.price}</p>
        </div>
      </div>
    </Link>
  );
}
