-- Tables.
CREATE TABLE tags (
    id          uuid            NOT NULL    DEFAULT GEN_RANDOM_UUID(),
    name        varchar(100)    NOT NULL,
    description varchar(200)    NOT NULL,
    created_at  timestamp       NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp       NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tags_pkey        PRIMARY KEY (id),
    CONSTRAINT tags_name_key    UNIQUE (name)
);

CREATE TABLE games (
    id              uuid            NOT NULL    DEFAULT GEN_RANDOM_UUID(),
    publisher_id    uuid            NOT NULL,
    title           varchar(150)    NOT NULL,
    price           float8          NOT NULL,
    is_active       boolean         NOT NULL    DEFAULT FALSE,
    release_date    date,
    description     varchar(500)    NOT NULL,
    features        varchar(250)    NOT NULL,
    languages       varchar(20)[]   NOT NULL, -- BCP 47 language tags.
    requirements    json            NOT NULL,
    url             varchar(2048)   NOT NULL,
    created_at      timestamp       NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    modified_at     timestamp       NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT games_pkey                   PRIMARY KEY (id),
    CONSTRAINT games_publisher_id_fkey      FOREIGN KEY (publisher_id)  REFERENCES publishers (id),
    CONSTRAINT games_price_positive_check   CHECK (price >= 0)
);

CREATE TABLE games_tags (
    game_id     uuid        NOT NULL,
    tag_id      uuid        NOT NULL,
    created_at  timestamp   NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT games_tags_pkey          PRIMARY KEY (game_id, tag_id),
    CONSTRAINT games_tags_game_id_fkey  FOREIGN KEY (game_id)           REFERENCES games (id)   ON DELETE CASCADE,
    CONSTRAINT games_tags_tag_id_fkey   FOREIGN KEY (tag_id)            REFERENCES tags (id)
);

CREATE TABLE games_multimedia (
    game_id         uuid        NOT NULL,
    multimedia_id   uuid        NOT NULL,
    position        int         NOT NULL    DEFAULT 0,
    created_at      timestamp   NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    modified_at     timestamp   NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT games_multimedia_pkey                                PRIMARY KEY (game_id, multimedia_id),
    CONSTRAINT games_multimedia_game_id_fkey                        FOREIGN KEY (game_id)                       REFERENCES games (id)       ON DELETE CASCADE,
    CONSTRAINT games_multimedia_multimedia_id_fkey                  FOREIGN KEY (multimedia_id)                 REFERENCES multimedia (id),
    CONSTRAINT games_multimedia_game_id_multimedia_id_position_key  UNIQUE (game_id, multimedia_id, position),
    CONSTRAINT games_multimedia_position_positive_check             CHECK (position >= 0)
);

-- Triggers.
CREATE TRIGGER tags_update_modified_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_at();

CREATE TRIGGER games_update_modified_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_at();

CREATE TRIGGER games_multimedia_update_modified_at
    BEFORE UPDATE ON games_multimedia
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_at();
