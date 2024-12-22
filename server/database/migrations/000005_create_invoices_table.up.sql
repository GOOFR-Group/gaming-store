CREATE TABLE invoices (
    id          uuid        NOT NULL    DEFAULT GEN_RANDOM_UUID(),
    user_id     uuid        NOT NULL,
    user_vatin  varchar(20) NOT NULL,
    created_at  timestamp   NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT invoices_pkey            PRIMARY KEY (id),
    CONSTRAINT invoices_user_id_fkey    FOREIGN KEY (user_id)   REFERENCES users (id)       ON DELETE CASCADE
);

CREATE TABLE invoices_games (
    invoice_id      uuid        NOT NULL,
    game_id         uuid        NOT NULL,
    price           float8      NOT NULL,
    tax             float8      NOT NULL,
    publisher_vatin varchar(20) NOT NULL,
    created_at      timestamp   NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT invoices_games_pkey              PRIMARY KEY (invoice_id, game_id),
    CONSTRAINT invoices_games_invoice_id_fkey   FOREIGN KEY (invoice_id)            REFERENCES invoices (id)    ON DELETE CASCADE,
    CONSTRAINT invoices_games_game_id_fkey      FOREIGN KEY (game_id)               REFERENCES games (id)
);
