package domain

// Invoice defines the invoice structure.
type Invoice struct {
	User       User
	Games      []Game
	Subtotal   GamePrice
	TaxPercent string
	Tax        GamePrice
	TotalPrice GamePrice
	CreatedAt  string
}
