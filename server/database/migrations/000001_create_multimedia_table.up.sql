CREATE TABLE multimedia (
    id          uuid            NOT NULL    DEFAULT GEN_RANDOM_UUID(),
    checksum    char(8)         NOT NULL, -- CRC32 checksum using the Castagnoli93 polynomial.
    media_type  varchar(255)    NOT NULL, -- MIME type.
    url         varchar(2048)   NOT NULL,
    created_at  timestamp       NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT multimedia_pkey                      PRIMARY KEY (id),
    CONSTRAINT multimedia_checksum_media_type_key   UNIQUE (checksum, media_type),
    CONSTRAINT multimedia_url_key                   UNIQUE (url)
);
