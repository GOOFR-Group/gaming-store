package smtp

// noop defines the smtp structure that does not perform any operation.
type noop struct{}

// NewNOOP returns a new smtp that does not perform any operation.
func NewNOOP() *noop {
	return &noop{}
}

func (s *noop) SendMailHTML(to []string, subject string, body string) error {
	return nil
}
