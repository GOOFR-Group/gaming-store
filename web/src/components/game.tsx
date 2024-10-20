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
      <div className="p-4">
        <h3 className="text-xl font-semibold">{props.title}</h3>
        <div className="flex items-center justify-between flex-wrap">
          <p className="text-sm text-gray-300">{props.publisher}</p>
          <p>€{props.price}</p>
        </div>
      </div>
    </Link>
  );
}
