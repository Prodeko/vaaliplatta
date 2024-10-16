import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Answer {
  content: string | null;
  id: Generated<number>;
  question_id: number;
  title: string;
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
  draft: boolean | null;
  id: Generated<number>;
  name: string;
}

export interface Position {
  description: string | null;
  election_id: number;
  id: Generated<number>;
  name: string;
  seats: string | null;
}

export interface Question {
  asker_id: string;
  content: string | null;
  id: Generated<number>;
  nickname: string;
  position_id: number;
  title: string;
}

export interface DB {
  answer: Answer;
  application: Application;
  election: Election;
  position: Position;
  question: Question;
}
