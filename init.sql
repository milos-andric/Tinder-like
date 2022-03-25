CREATE TYPE enum_types_notifs AS ENUM ('visit', 'like', 'unlike', 'match', 'message');

CREATE TABLE IF NOT EXISTS "users" (
    "user_id" serial PRIMARY KEY,
    "first_name" VARCHAR ( 64 ) NOT NULL,
    "last_name" VARCHAR ( 64 ) NOT NULL,
    "user_name" VARCHAR ( 16 ) UNIQUE NOT NULL,
    "email" VARCHAR ( 255 ) UNIQUE NOT NULL,
    "age" INT,
    "password" VARCHAR ( 512 ) NOT NULL,
    "gender" INT NOT NULL,
    "orientation" INT DEFAULT 2,
    "bio" TEXT,
    "tags" VARCHAR(16)[],
    "profile_pic" INT DEFAULT NULL,
    "score" INT DEFAULT 0,
    "activation_code" VARCHAR ( 512 ) NOT NULL,
    "created_on" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "images" (
    "image_id" serial PRIMARY KEY,
    "url" VARCHAR(255) NOT NULL,
    "user_id" INT NOT NULL,
    "created_on" TIMESTAMP NOT NULL DEFAULT now(),
    
    CONSTRAINT "fk_user" FOREIGN KEY("user_id") REFERENCES "users"("user_id")
);

CREATE TABLE IF NOT EXISTS "likes" (
    "like_id" serial PRIMARY KEY,
    "user_id" INT NOT NULL,
    "created_on" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "fk_user" FOREIGN KEY("user_id") REFERENCES "users"("user_id")
);

CREATE TABLE IF NOT EXISTS "blocks" (
    "block_id" serial PRIMARY KEY,
    "sender_id" INT NOT NULL,
    "blocked_id" INT NOT NULL,
    "created_on" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "fk_sender_id" FOREIGN KEY("sender_id") REFERENCES "users"("user_id"),
    CONSTRAINT "fk_blocked_id" FOREIGN KEY("blocked_id") REFERENCES "users"("user_id")
);

CREATE TABLE IF NOT EXISTS "reports" (
    "report_id" serial PRIMARY KEY,
    "sender_id" INT NOT NULL,
    "reported_id" INT NOT NULL,
    "created_on" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "fk_sender_id" FOREIGN KEY("sender_id") REFERENCES "users"("user_id"),
    CONSTRAINT "fk_reported_id" FOREIGN KEY("reported_id") REFERENCES "users"("user_id")
);

CREATE TABLE IF NOT EXISTS "notifications" (
    "notification_id" serial PRIMARY KEY,
    "user_id_send" INT NOT NULL,
    "user_id_receiver" INT NOT NULL,
    "content" VARCHAR ( 255 ) NOT NULL,
    "type" enum_types_notifs NOT NULL,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "created_on" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "fk_user_send" FOREIGN KEY("user_id_send") REFERENCES "users"("user_id"),
    CONSTRAINT "fk_user_receiver" FOREIGN KEY("user_id_receiver") REFERENCES "users"("user_id")
);

-- INSERT into "users"("first_name", "last_name", "user_name", "email", "password", "gender", "created_on") VALUES ("thais", "marcon", "diams", "mthais.web@gmail.com", "diams", 0, NOW())