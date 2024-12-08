import { db } from '../src/database'; // Adjust the relative path if necessary
import { faker } from '@faker-js/faker';

async function createTestData() {

}

createTestData()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Error inserting test data:', err);
        process.exit(1);
    });
