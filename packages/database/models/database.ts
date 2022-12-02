import { Invite } from "./invites";
import { Member } from "./member";

export interface Database {
  members: Member;
  invites: Invite;
}
