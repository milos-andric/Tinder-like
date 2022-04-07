CREATE TYPE enum_types_notifs AS ENUM ('view', 'like', 'unlike', 'match', 'message');

CREATE TABLE IF NOT EXISTS "users" (
    "user_id" serial PRIMARY KEY,
    "first_name" VARCHAR ( 64 ) NOT NULL,
    "last_name" VARCHAR ( 64 ) NOT NULL,
    "user_name" VARCHAR ( 16 ) UNIQUE NOT NULL,
    "email" VARCHAR ( 255 ) UNIQUE NOT NULL,
    "age" TIMESTAMP DEFAULT NULL,
    "password" VARCHAR ( 512 ) NOT NULL,
    "gender" INT NOT NULL,
    "orientation" INT DEFAULT 2,
    "bio" TEXT,
    "tags" VARCHAR(16)[],
    "profile_pic" INT DEFAULT NULL,
    "score" INT DEFAULT 0,
    "activation_code" VARCHAR ( 512 ) NOT NULL,
    "latitude" FLOAT,
    "longitude" FLOAT,
    "last_connexion" TIMESTAMP NOT NULL DEFAULT now(),
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
    "liker_id" INT NOT NULL,
    "target_id" INT NOT NULL,
    "created_on" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "fk_liker_id" FOREIGN KEY("liker_id") REFERENCES "users"("user_id"),
    CONSTRAINT "fk_target_id" FOREIGN KEY("target_id") REFERENCES "users"("user_id")
);

CREATE TABLE IF NOT EXISTS "views" (
    "view_id" serial PRIMARY KEY,
    "viewer_id" INT NOT NULL,
    "target_id" INT NOT NULL,
    "created_on" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "fk_viewer_id" FOREIGN KEY("viewer_id") REFERENCES "users"("user_id"),
    CONSTRAINT "fk_target_id" FOREIGN KEY("target_id") REFERENCES "users"("user_id")
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

CREATE TABLE IF NOT EXISTS "chats" (
    "chat_id" serial PRIMARY KEY,
    "first_id" INT NOT NULL,
    "second_id" INT NOT NULL,
    "name" VARCHAR ( 16 ) UNIQUE NOT NULL,
    "created_on" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "fk_first_id" FOREIGN KEY("first_id") REFERENCES "users"("user_id"),
    CONSTRAINT "fk_second_id" FOREIGN KEY("second_id") REFERENCES "users"("user_id")
);

CREATE TABLE IF NOT EXISTS "messages" (
    "msg_id" serial PRIMARY KEY,
    "sender_id" INT NOT NULL,
    "chat_id" VARCHAR(16) NOT NULL,
    "message" TEXT,
    "created_on" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "fk_sender_id" FOREIGN KEY("sender_id") REFERENCES "users"("user_id")
);

CREATE TABLE IF NOT EXISTS "notifications" (
    "notification_id" serial PRIMARY KEY,
    "user_id_send" INT NOT NULL,
    "user_id_receiver" INT NOT NULL,
    "content" VARCHAR ( 255 ),
    "link" VARCHAR ( 255 ),
    "type" enum_types_notifs NOT NULL,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "created_on" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "fk_user_send" FOREIGN KEY("user_id_send") REFERENCES "users"("user_id"),
    CONSTRAINT "fk_user_receiver" FOREIGN KEY("user_id_receiver") REFERENCES "users"("user_id")
);

INSERT into "users"("first_name", "last_name", "user_name", "email", "password", "gender","score","activation_code", "created_on")
    VALUES ('toto', 'toto', 'toto', 'toto@toto.com', '$2b$10$5PVQ6HrCgSYhT/bZeb1HDeW2WoaptVIzvS3qLhIoRdGPKAjyph7Xm', 0,999,'activated', NOW());

    -- code Toto123456789
INSERT into "users"("first_name", "last_name", "user_name", "email", "password", "gender","score","activation_code", "created_on")
    VALUES ('titi', 'titi', 'titi', 'titi@titi.com', '$2b$10$5PVQ6HrCgSYhT/bZeb1HDeW2WoaptVIzvS3qLhIoRdGPKAjyph7Xm', 1,999,'activated', NOW());
--     -- code Toto123456789
    -- code Toto123456789
INSERT into "users"("first_name", "last_name", "user_name", "email", "password", "gender","score","activation_code", "created_on")
    VALUES ('blocker', 'blocker', 'blocker', 'blocker@blocker.com', '$2b$10$5PVQ6HrCgSYhT/bZeb1HDeW2WoaptVIzvS3qLhIoRdGPKAjyph7Xm', 1,0,'activated', NOW());
--     -- code Toto123456789
INSERT into "users"("first_name", "last_name", "user_name", "email", "password", "gender","score","activation_code", "created_on")
    VALUES ('viewer', 'viewer', 'viewer', 'viewer@viewer.com', '$2b$10$5PVQ6HrCgSYhT/bZeb1HDeW2WoaptVIzvS3qLhIoRdGPKAjyph7Xm', 1,0,'activated', NOW());
--     -- code Toto123456789
INSERT into "users"("first_name", "last_name", "user_name", "email", "password", "gender","score","activation_code", "created_on")
    VALUES ('tata', 'tata', 'tata', 'tata@tata.com', '$2b$10$5PVQ6HrCgSYhT/bZeb1HDeW2WoaptVIzvS3qLhIoRdGPKAjyph7Xm', 1,999,'activated', NOW());

INSERT into "likes"
    ("liker_id", "target_id", "created_on")
    VALUES (1, 2, NOW());
INSERT into "likes"
    ("liker_id", "target_id", "created_on")
    VALUES (2, 1, NOW());
INSERT into "likes"
    ("liker_id", "target_id", "created_on")
    VALUES (1, 5, NOW());
INSERT into "likes"
    ("liker_id", "target_id", "created_on")
    VALUES (5, 1, NOW());
INSERT into "blocks"
    ("sender_id", "blocked_id", "created_on")
    VALUES (1, 3, NOW());
INSERT into "views"
    ("viewer_id", "target_id", "created_on")
    VALUES (1, 4, NOW());
INSERT into "chats"
    ("first_id", "second_id", "name", "created_on")
    VALUES (2, 1, '1-2', NOW());
INSERT into "chats"
    ("first_id", "second_id", "name", "created_on")
    VALUES (1, 5, '1-5', NOW());

INSERT into "messages"
    ( "sender_id", "chat_id", "message", "created_on")
    VALUES (1, '1-2', 'hello', NOW());

INSERT into "messages"
    ( "sender_id", "chat_id", "message", "created_on")
    VALUES (1, '1-2', 'from', NOW());

INSERT into "messages"
    ( "sender_id", "chat_id", "message", "created_on")
    VALUES (1, '1-2', 'db', NOW());
