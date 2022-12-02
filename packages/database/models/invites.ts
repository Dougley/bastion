import {
  Generated,
  ColumnType,
  Selectable,
  Insertable,
  Updateable,
} from "kysely";

export interface Invite {
  id: Generated<number>;
  code: string;
  owner_id: string;
  usable: ColumnType<boolean, boolean | undefined, boolean>;
  uses: ColumnType<number, number | undefined, number>;
  max_uses: ColumnType<number, number | undefined, number>;
  created_at: ColumnType<Date, string, never>;
  updated_at: ColumnType<Date, string, string>;
}
