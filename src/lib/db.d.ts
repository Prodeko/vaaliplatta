import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type State = "archived" | "closed" | "draft" | "open";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Answer {
  answerer_id: string;
  content: string | null;
  id: Generated<number>;
  question_id: number;
}

export interface Application {
  applicant_id: string;
  applicant_name: string;
  content: string | null;
  id: Generated<number>;
  position_id: number;
  profile_picture: string | null;
}

export interface Election {
  description: string | null;
  id: Generated<number>;
  name: string;
  state: Generated<State>;
}

export interface Position {
  category: Generated<string>;
  description: string | null;
  election_id: number;
  id: Generated<number>;
  name: string;
  seats: string | null;
  state: Generated<State>;
}

export interface Question {
  asker_id: string;
  content: string | null;
  id: Generated<number>;
  nickname: string;
  position_id: number;
}

export interface ReadReceipts {
  application_id: number;
  time: Generated<Timestamp>;
  user_id: string;
}

export interface ReadReceiptsWithElectionId {
  application_id: number | null;
  election_id: number | null;
  time: Timestamp | null;
  user_id: string | null;
}

export interface DB {
  answer: Answer;
  application: Application;
  election: Election;
  position: Position;
  question: Question;
  read_receipts: ReadReceipts;
  read_receipts_with_election_id: ReadReceiptsWithElectionId;
}
