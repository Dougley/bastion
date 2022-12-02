import { ColumnType } from "kysely";

export interface Member {
  id: string;
  invited_with: number | null;
  invites: ColumnType<number, number | undefined, number | undefined>;
  joined_at: ColumnType<Date, string, never>;
}
