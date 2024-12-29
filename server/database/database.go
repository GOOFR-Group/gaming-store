package database

import "embed"

//go:embed migrations
var FileSystemMigrations embed.FS
