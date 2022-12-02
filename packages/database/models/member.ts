import { ColumnType } from "kysely";

export interface Member {
  id: string
  invited_with: string | null
  invites: ColumnType<number, number | undefined, number | undefined>;
  joined_at: ColumnType<Date, string | undefined, never>;
}