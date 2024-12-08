import { Insertable } from 'kysely';
import { db } from '../src/database';
import { faker } from '@faker-js/faker';
import {
    Election,
    Position,
    Application,
    State,
    Question,
    Answer,
} from '../src/db'
import { randomInt } from 'crypto';

// **************************

function maybe(chance = 0.5): boolean {
    return Math.random() < chance
}
function h1(input: string): string {
    return `<h1>${input}</h1>`
}
function h2(input: string): string {
    return `<h2>${input}</h2>`
}
function h3(input: string): string {
    return `<h3>${input}</h3>`
}
function p(input: string): string {
    return `<p>${input}</p>`
}
function randrange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
}
function randFromArray(array: Array<any>): any {
    return array[Math.floor(Math.random() * array.length)];
}
function randCategory(): string {
    return randFromArray(["hallitus", "vastuutoimarit", "toimarit"])
}
function randSeats(): string {
    // returns e.g. "3-8" or "6" or "?"
    return maybe(0.6) ? `${randomInt(3)}-${randomInt(15)}`
        : maybe(0.6) ? `${randomInt(4)}`
            : "?"
}
function randUserId(): string {
    // The django oauth userid is a serial int, currently at a bit over 4000
    return faker.string.numeric(4)
}
function createRandomHTMLText() {
    return (
        (maybe() ? h1(faker.book.title()) : "") +
        (maybe() ? h2(faker.book.title()) : "") +
        (maybe() ? h3(faker.book.title()) : "") +
        (maybe() ? "<br>" : "") +
        (new Array(randrange(1, 10)))
            .fill(null)
            .map(_ => p(faker.lorem.paragraph({ min: 1, max: 10 })))
            .join(""))
}

// **************************

async function createRandomElection(state: State = "open"): Promise<number> {
    const randomElection: Insertable<Election> = {
        name: faker.animal.type(),
        description: createRandomHTMLText(),
        state
    }
    return await db.insertInto("election")
        .values(randomElection)
        .returning("id")
        .executeTakeFirstOrThrow()
        .then(result => result.id)
}

async function createRandomPosition(election_id: number, state: State = "open"): Promise<number> {
    const randomPosition: Insertable<Position> = {
        name: faker.commerce.department(),
        description: createRandomHTMLText(),
        state,
        category: randCategory(),
        seats: randSeats(),
        election_id,
    }
    return await db.insertInto("position")
        .values(randomPosition)
        .returning("id")
        .executeTakeFirstOrThrow()
        .then(result => result.id)
}

async function createRandomApplication(position_id: number): Promise<Application> {
    const randomApplication: Insertable<Application> = {
        applicant_id: randUserId(),
        applicant_name: faker.person.fullName(),
        content: maybe() ? createRandomHTMLText() : null,
        position_id,
        profile_picture: null,
    }

    const application = await db
        .insertInto("application")
        .values(randomApplication)
        .returningAll()
        .executeTakeFirst()

    return application as unknown as Application
}

async function createRandomQuestion(position_id: number): Promise<Question> {
    const randomQuestion: Insertable<Question> = {
        position_id,
        asker_id: randUserId(),
        nickname: maybe() ? faker.person.fullName() : faker.person.firstName(),
        content: createRandomHTMLText(),
    }

    const question = await db.insertInto("question")
        .values(randomQuestion)
        .returningAll()
        .executeTakeFirstOrThrow()

    return question as unknown as Question
}

async function createRandomAnswer(answerer_id: string, question_id: number): Promise<number> {
    const randomAnswer: Insertable<Answer> = {
        answerer_id,
        question_id,
        content: createRandomHTMLText(),
    }
    return await db.insertInto("answer")
        .values(randomAnswer)
        .returning("id")
        .executeTakeFirstOrThrow()
        .then(result => result.id)
}

// **************************

async function createTestData(
    MIN_ELECTIONS = 1,
    MAX_ELECTIONS = 1,
    MIN_POSITIONS = 10,
    MAX_POSITIONS = 20,
    MIN_QUESTIONS = 0,
    MAX_QUESTIONS = 3,
    MIN_ANSWERS = 0,
    MAX_ANSWERS = 3,
    MIN_APPLICATIONS = 1,
    MAX_APPLICATIONS = 10,
) {

    // Create random elections
    const electionIds: number[] = await Promise.all(
        Array.from({ length: randrange(MIN_ELECTIONS, MAX_ELECTIONS) }).map(() => createRandomElection())
    )

    // For each election, create random positions
    const positionIds: number[] = []
    for (const election of electionIds) {
        for (var i = 0; i < randrange(MIN_POSITIONS, MAX_POSITIONS); i += 1) {
            const posId = await createRandomPosition(election)
            positionIds.push(posId)
        }
    }

    // For each position, create random applications and questions
    const applications: Application[] = []
    const questions: Question[] = []
    for (const position of positionIds) {
        for (var i = 0; i < randrange(MIN_APPLICATIONS, MAX_APPLICATIONS); i += 1) {
            const application = await createRandomApplication(position)
            applications.push(application)
        }
        for (var i = 0; i < randrange(MIN_QUESTIONS, MAX_QUESTIONS); i += 1) {
            const question = await createRandomQuestion(position)
            questions.push(question)
        }
    }

    // Create random answers to the questions
    const answerIds: number[] = []
    for (const question of questions) {
        for (var i = 0; i < randrange(MIN_ANSWERS, MAX_ANSWERS); i += 1) {

            const application = applications.find(a => a.position_id === question.position_id)

            const ansId = await createRandomAnswer(
                application?.applicant_id!,
                question.id as unknown as number,
            )
            answerIds.push(ansId)
        }
    }
}

createTestData()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Error inserting test data:', err);
        process.exit(1);
    });
