import { Insertable } from 'kysely';
import { db } from '../src/database';
import { faker } from '@faker-js/faker';
import {
    Election,
    Position,
    State,

} from '../src/db'
import { randomInt } from 'crypto';

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

async function createRandomElection(state: State = "open") {
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

async function createRandomPosition(election_id: number, state: State = "open") {
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



async function createTestData() {
    const id = await createRandomElection()
    await createRandomPosition(id)
}

createTestData()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Error inserting test data:', err);
        process.exit(1);
    });
