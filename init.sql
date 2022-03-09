CREATE TABLE IF NOT EXISTS "users" (
    "user_id" serial PRIMARY KEY,
    "first_name" VARCHAR ( 64 ) NOT NULL,
    "last_name" VARCHAR ( 64 ) NOT NULL,
    "user_name" VARCHAR ( 16 ) UNIQUE NOT NULL,
    "email" VARCHAR ( 255 ) UNIQUE NOT NULL,
    "password" VARCHAR ( 64 ) NOT NULL,
    "gender" INT NOT NULL,
    "bio" TEXT,
    "tags" VARCHAR(16)[],
    "profile_pic" INT DEFAULT NULL,
    "score" INT DEFAULT 0,
    "created_on" TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "images" (
    "image_id" serial PRIMARY KEY,
    "url" VARCHAR(255) NOT NULL,
    "user_id" INT NOT NULL,
    "created_on" TIMESTAMP NOT NULL,
    
    CONSTRAINT "fk_user" FOREIGN KEY("user_id") REFERENCES "users"("user_id")
);

CREATE TABLE IF NOT EXISTS "likes" (
    "like_id" serial PRIMARY KEY,
    "user_id" INT NOT NULL,
    "created_on" TIMESTAMP NOT NULL,

    CONSTRAINT "fk_user" FOREIGN KEY("user_id") REFERENCES "users"("user_id")
);