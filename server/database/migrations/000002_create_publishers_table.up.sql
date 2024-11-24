-- Functions.
CREATE FUNCTION enforce_lower_case_email() 
RETURNS TRIGGER AS $$
BEGIN
    new.email = LOWER(new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION update_modified_at() 
RETURNS TRIGGER AS $$
BEGIN
    new.modified_at = CURRENT_TIMESTAMP;
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Table.
CREATE TABLE publishers (
    id                      uuid            NOT NULL    DEFAULT GEN_RANDOM_UUID(),
    email                   varchar(320)    NOT NULL,
    password                varchar(60)     NOT NULL,
    name                    varchar(100)    NOT NULL,
    address                 varchar(50)     NOT NULL,
    country                 varchar(2)      NOT NULL, -- ISO 3166-1 alpha-2 code.
    vatin                   varchar(20)     NOT NULL,
    picture_multimedia_id   uuid,
    created_at              timestamp       NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    modified_at             timestamp       NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT publishers_pkey                          PRIMARY KEY (id),
    CONSTRAINT publishers_email_key                     UNIQUE (email),
    CONSTRAINT publishers_vatin_key                     UNIQUE (vatin),
    CONSTRAINT publishers_picture_multimedia_id_fkey    FOREIGN KEY (picture_multimedia_id) REFERENCES multimedia (id)
);

-- Triggers.
CREATE TRIGGER publishers_enforce_lower_case_email
    BEFORE INSERT OR UPDATE ON publishers
    FOR EACH ROW
    EXECUTE PROCEDURE enforce_lower_case_email();

CREATE TRIGGER publishers_update_modified_at
    BEFORE UPDATE ON publishers
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_at();
