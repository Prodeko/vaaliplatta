# Vaaliplatta

## Docs

Setting up:
```bash
docker compose up -d
```

```bash
# /vaaliplatta/backend
npm install
npm run kysely-codegen
npm run dev

# /vaaliplatta/frontend
npm install
npm run dev
```

### DB schema

```mermaid
erDiagram
    ELECTION {
        int id PK "Primary Key"
        string name "Unique, Not Null"
        bool draft
    }
    POSITION {
        int id PK "Primary Key"
        string name "Not Null"
        string description
        string seats "Text type for ranges"
        int election_id FK "References ELECTION.id, Not Null"
    }
    APPLICATION {
        int id PK "Primary Key"
        string content
        string applicant_name "Not Null"
        string applicant_id "Not Null"
        int position_id FK "References POSITION.id, Not Null"
    }
    QUESTION {
        int id PK "Primary Key"
        string title "Not Null"
        string content
        string nickname "Not Null"
        string asker_id "Not Null"
        int position_id FK "References POSITION.id, Not Null"
    }
    ANSWER {
        int id PK "Primary Key"
        string title "Not Null"
        string content
        int question_id FK "References QUESTION.id, Not Null"
    }

    ELECTION ||--o{ POSITION : "has"
    POSITION ||--o{ APPLICATION : "has"
    POSITION ||--o{ QUESTION : "has"
    QUESTION ||--o{ ANSWER : "has"
```