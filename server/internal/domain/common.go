package domain

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"net/mail"

	"golang.org/x/text/language"
)

// Field constraints.
const (
	usernameMinLength = 1
	usernameMaxLength = 50

	emailMaxLength = 320

	nameMinLength = 1
	nameMaxLength = 100

	addressMinLength = 1
	addressMaxLength = 100

	countryLength = 2

	languageMinLength = 1
	languageMaxLength = 20

	vatinMinLength = 1
	vatinMaxLength = 20
)

// Common errors.
var (
	ErrCredentialsIncorrect = errors.New("incorrect credentials") // Returned when a username or email is not found or the password is incorrect.
)

// FieldValueInvalidError is returned when a field contains an invalid value.
type FieldValueInvalidError struct {
	FieldName string
}

func (e *FieldValueInvalidError) Error() string {
	return fmt.Sprintf("invalid field value: %s", e.FieldName)
}

// Username defines the username type.
type Username string

// Valid returns true if the username is valid, false otherwise.
func (u Username) Valid() bool {
	return len(u) >= usernameMinLength && len(u) <= usernameMaxLength
}

// Email defines the email type.
type Email string

// Valid returns true if the email is valid, false otherwise.
func (e Email) Valid() bool {
	_, err := mail.ParseAddress(string(e))
	return len(e) <= emailMaxLength && err == nil
}

// Password defines the password type.
type Password string

// Name defines the name type.
type Name string

// Valid returns true if the name is valid, false otherwise.
func (n Name) Valid() bool {
	return len(n) >= nameMinLength && len(n) <= nameMaxLength
}

// Address defines the address type.
type Address string

// Valid returns true if the address is valid, false otherwise.
func (a Address) Valid() bool {
	return len(a) >= addressMinLength && len(a) <= addressMaxLength
}

// Country defines the country type.
// ISO 3166-1 alpha-2 code.
type Country struct {
	language.Region
}

// Valid returns true if the country is valid, false otherwise.
func (c Country) Valid() bool {
	return len(c.String()) == countryLength
}

// Scan implements sql.Scanner so Country can be read from databases transparently.
func (c *Country) Scan(src interface{}) error {
	switch src := src.(type) {
	case nil:
		return nil

	case string:
		region, err := language.ParseRegion(src)
		if err != nil {
			return fmt.Errorf("Scan: %w", err)
		}

		c.Region = region

	default:
		return fmt.Errorf("Scan: unable to scan type %T into Country", src)
	}

	return nil
}

// Value implements sql.Valuer so that Country can be written to databases transparently.
func (c Country) Value() (driver.Value, error) {
	return c.String(), nil
}

// Language defines the language type.
type Language struct {
	language.Tag
}

// Valid returns true if the language is valid, false otherwise.
func (l Language) Valid() bool {
	cString := l.String()
	return len(cString) >= languageMinLength && len(cString) <= languageMaxLength
}

// Scan implements sql.Scanner so Language can be read from databases transparently.
func (l *Language) Scan(src interface{}) error {
	switch src := src.(type) {
	case nil:
		return nil

	case string:
		tag, err := language.Parse(src)
		if err != nil {
			return fmt.Errorf("Scan: %w", err)
		}

		l.Tag = tag

	default:
		return fmt.Errorf("Scan: unable to scan type %T into Language", src)
	}

	return nil
}

// Value implements sql.Valuer so that Language can be written to databases transparently.
func (l Language) Value() (driver.Value, error) {
	return l.String(), nil
}

// Vatin defines the value-added tax identification number type.
type Vatin string

// Valid returns true if the value-added tax identification number is valid, false otherwise.
func (v Vatin) Valid() bool {
	return len(v) >= vatinMinLength && len(v) <= vatinMaxLength
}
