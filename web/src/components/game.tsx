import { formatCurrency } from "@/lib/utils";

export function Game(props: {
  title: string;
  publisher: string;
  price: number;
  image: string;
}) {
  return (
    <article className="max-w-80">
      <img
        alt="Game cover"
        className="object-cover aspect-[3/4] rounded-lg w-80 group-hover:brightness-90"
        src={props.image}
      />
      <div className="py-2 flex flex-col gap-1">
        <p className="text-sm text-gray-300">{props.publisher}</p>
        <h3 className="text-xl font-semibold">{props.title}</h3>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <p>{formatCurrency(props.price)}</p>
        </div>
      </div>
    </article>
  );
}
