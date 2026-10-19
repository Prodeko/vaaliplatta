import { readFileSync } from 'fs';
import * as path from 'path';
import { db } from '../src/database';

// Creates an open election whose positions are the toimarivisa roles, so that
// the quiz can be tried locally. Some names are written differently from the
// quiz data on purpose ("Proleko?n", "Wild Card: Ehdota omaa!") to exercise
// the name matching.

interface QuizRole {
    nimi: string
    kategoria: string
    kuvaus: string
}

const quizData = JSON.parse(readFileSync(
    path.join(__dirname, '../../frontend/src/toimarivisa/toimarivisa.json'),
    'utf-8',
)) as { roolit: QuizRole[] }

const nameOverrides: Record<string, string> = {
    'Prolekon taittaja': 'Proleko?n taittaja',
    'Prolekon toimittaja': 'Proleko?n toimittaja',
}

async function createToimarivisaTestData() {
    const election = await db
        .insertInto('election')
        .values({
            name: 'Toimarivisan testivaalit',
            description: '<p>Testivaalit toimarivisaa varten. Jokainen visan rooli on mukana.</p>',
            state: 'open',
        })
        .returning('id')
        .executeTakeFirstOrThrow()

    await db
        .insertInto('position')
        .values(quizData.roolit.map(role => ({
            election_id: election.id,
            name: nameOverrides[role.nimi] ?? role.nimi,
            description: `<p>${role.kuvaus}</p>`,
            seats: '1',
            category: role.kategoria,
            state: 'open' as const,
        })))
        .execute()

    console.log(`Created election ${election.id} with ${quizData.roolit.length} positions`)
}

createToimarivisaTestData()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Error inserting test data:', err);
        process.exit(1);
    });
