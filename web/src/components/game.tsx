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
        className="object-cover w-80 aspect-[3/4] rounded-lg"
        src={props.image}
      />
      <div className="py-2 flex flex-col gap-1">
        <p className="text-sm text-gray-400">{props.publisher}</p>
        <h3 className="text-xl font-semibold">{props.title}</h3>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <p>{formatCurrency(props.price)}</p>
        </div>
      </div>
    </article>
  );
}
