-- Function.
CREATE FUNCTION enforce_lower_case_username() 
RETURNS TRIGGER AS $$
BEGIN
    new.username = LOWER(new.username);
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Tables.
CREATE TABLE users (
    id                      uuid            NOT NULL    DEFAULT GEN_RANDOM_UUID(),
    username                varchar(50)     NOT NULL,
    email                   varchar(320)    NOT NULL,
    password                varchar(60)     NOT NULL,
    display_name            varchar(100)    NOT NULL,
    date_of_birth           date            NOT NULL,
    address                 varchar(50)     NOT NULL,
    country                 varchar(20)     NOT NULL, -- BCP 47 language tag.
    vatin                   varchar(20)     NOT NULL,
    balance                 float8          NOT NULL    DEFAULT 0,
    picture_multimedia_id   uuid,
    created_at              timestamp       NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    modified_at             timestamp       NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey                       PRIMARY KEY (id),
    CONSTRAINT users_username_key               UNIQUE (username),
    CONSTRAINT users_email_key                  UNIQUE (email),
    CONSTRAINT users_vatin_key                  UNIQUE (vatin),
    CONSTRAINT users_picture_multimedia_id_fkey FOREIGN KEY (picture_multimedia_id) REFERENCES multimedia (id)
);

CREATE TABLE users_carts (
    user_id     uuid        NOT NULL,
    game_id     uuid        NOT NULL,
    created_at  timestamp   NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_carts_pkey         PRIMARY KEY (user_id, game_id),
    CONSTRAINT users_carts_user_id_fkey FOREIGN KEY (user_id)           REFERENCES users (id)   ON DELETE CASCADE,
    CONSTRAINT users_carts_game_id_fkey FOREIGN KEY (game_id)           REFERENCES games (id)   ON DELETE CASCADE
);

CREATE TABLE users_libraries (
    user_id     uuid        NOT NULL,
    game_id     uuid        NOT NULL,
    downloads   int         NOT NULL    DEFAULT 0,
    created_at  timestamp   NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp   NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_libraries_pkey         PRIMARY KEY (user_id, game_id),
    CONSTRAINT users_libraries_user_id_fkey FOREIGN KEY (user_id)           REFERENCES users (id)   ON DELETE CASCADE,
    CONSTRAINT users_libraries_game_id_fkey FOREIGN KEY (game_id)           REFERENCES games (id)
);

-- Triggers.
CREATE TRIGGER users_enforce_lower_case_username
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE enforce_lower_case_username();

CREATE TRIGGER users_enforce_lower_case_email
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE enforce_lower_case_email();

CREATE TRIGGER users_update_modified_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_at();

CREATE TRIGGER users_libraries_update_modified_at
    BEFORE UPDATE ON users_libraries
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_at();
