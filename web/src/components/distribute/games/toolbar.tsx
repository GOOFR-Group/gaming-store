import { Table } from "@tanstack/react-table";

import { DataTableFacetedFilter } from "@/components/data-table";
import { Game } from "@/domain/game";
import { LANGUAGES } from "@/lib/constants";

export function GamesToolbar(props: { table: Table<Game> }) {
  const languageOptions = LANGUAGES.map((language) => {
    return {
      value: language.code,
      label: language.name,
    };
  });

  return (
    <>
      <DataTableFacetedFilter
        column={props.table.getColumn("languages")}
        options={languageOptions}
      />
    </>
  );
}
