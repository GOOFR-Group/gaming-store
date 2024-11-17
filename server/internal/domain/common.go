package domain

import (
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

	countryMinLength = 1
	countryMaxLength = 20

	vatinMinLength = 1
	vatinMaxLength = 20
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

// SignIn defines the sign-in structure.
type SignIn struct {
	Username Username
	Email    Email
	Password Password
}

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
type Country struct {
	language.Tag
}

// Valid returns true if the country is valid, false otherwise.
func (c Country) Valid() bool {
	cString := c.String()
	return len(cString) >= countryMinLength && len(cString) <= countryMaxLength
}

// Vatin defines the value-added tax identification number type.
type Vatin string

// Valid returns true if the value-added tax identification number is valid, false otherwise.
func (v Vatin) Valid() bool {
	return len(v) >= vatinMinLength && len(v) <= vatinMaxLength
}
