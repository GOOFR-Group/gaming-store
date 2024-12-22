package domain

// Invoice defines the invoice structure.
type Invoice struct {
	User       User
	Games      []Game
	TotalPrice float64
	CreatedAt  string
}
