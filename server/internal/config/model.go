package config

// Service defines the service configuration structure.
type Service struct {
	ServerHTTP   ServerHTTP   `yaml:"serverHTTP"`
	Database     Database     `yaml:"database"`
	CloudStorage CloudStorage `yaml:"cloudStorage"`
	SMTP         SMTP         `yaml:"smtp"`
}

// ServerHTTP defines the http server configuration structure.
type ServerHTTP struct {
	Address      string `yaml:"address"`
	WriteTimeout string `yaml:"writeTimeout"`
}

// DatabaseMigrations defines the database migrations configuration structure.
type DatabaseMigrations struct {
	Apply   bool `yaml:"apply"`
	Version uint `yaml:"version"`
}

// Database defines the database configuration structure.
type Database struct {
	URL        string             `yaml:"url"`
	Migrations DatabaseMigrations `yaml:"migrations"`
}

// CloudStorage defines the cloud storage configuration structure.
type CloudStorage struct {
	Enabled          bool   `yaml:"enabled"`
	BucketMultimedia string `yaml:"bucketMultimedia"`
}

// SMTP defines the SMTP configuration structure.
type SMTP struct {
	Enabled  bool   `yaml:"enabled"`
	Host     string `yaml:"host"`
	Port     string `yaml:"port"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
	From     string `yaml:"from"`
}
