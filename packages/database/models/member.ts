import { ColumnType } from "kysely";

export interface Member {
  id: string;
  invites: ColumnType<number, number | undefined, number | undefined>;
  joined_at: ColumnType<Date, string, never>;
  whitelisted: ColumnType<boolean, boolean | undefined, boolean | undefined>;
  blacklisted: ColumnType<boolean, boolean | undefined, boolean | undefined>
  whitelisted_by: string | null;
  blacklisted_by: string | null;
}
