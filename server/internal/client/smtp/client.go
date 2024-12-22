package smtp

import (
	"fmt"
	"net/smtp"

	"github.com/goofr-group/gaming-store/server/internal/config"
)

const (
	headerSubject         = "Subject: %s\n"
	headerContentTypeHTML = "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
)

// client defines the smtp client structure.
type client struct {
	Host     string
	Port     string
	Username string
	Password string
	From     string
}

// New returns a new smtp client.
func New(config config.SMTP) *client {
	return &client{
		Host:     config.Host,
		Port:     config.Port,
		Username: config.Username,
		Password: config.Password,
		From:     config.From,
	}
}

// SendMailHTML sends the given message to the given list of recipients using the HTML content type.
func (c *client) SendMailHTML(to []string, subject string, body string) error {
	subject = fmt.Sprintf(headerSubject, subject)

	return smtp.SendMail(
		c.Host+":"+c.Port,
		smtp.PlainAuth("", c.Username, c.Password, c.Host),
		c.From,
		to,
		[]byte(subject+headerContentTypeHTML+body),
	)
}
