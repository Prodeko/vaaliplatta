import {
    Selectable,
} from 'kysely'

export interface Database {
    // election: ElectionTable,
    jobs: JobsTable,
    // applications: ApplicationTable,
    // questions: QuestionTable,
    // answers: AnswerTable,
}

// export interface ElectionTable { }
export interface JobsTable {
    title: string
}
// export interface ApplicationTable { }

// You should not use the table schema interfaces directly. Instead, you should
// use the `Selectable`, `Insertable` and `Updateable` wrappers. These wrappers
// make sure that the correct types are used in each operation.
// export type Election = Selectable<ElectionTable>
export type Job = Selectable<JobsTable>
// export type Application = Selectable<ApplicationTable>
