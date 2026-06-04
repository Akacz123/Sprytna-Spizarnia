using System.ComponentModel.DataAnnotations;

namespace SpizarniaAPI.Models
{
    /// <summary>
    /// Reprezentuje pojedynczy produkt przechowywany w spiżarni użytkownika.
    /// Łączy użytkownika (<see cref="User"/>) z produktem (<see cref="Product"/>)
    /// i zawiera informacje o ilości oraz dacie ważności.
    /// </summary>
    public class PantryItem
    {
        /// <summary>Unikalny identyfikator pozycji w spiżarni (UUID generowany przez PostgreSQL).</summary>
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>Identyfikator właściciela – użytkownika, do którego należy ten produkt (klucz obcy).</summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// Nawigacja do użytkownika-właściciela. Oznaczona <c>[JsonIgnore]</c>
        /// aby uniknąć cykli referencyjnych podczas serializacji JSON.
        /// </summary>
        [System.Text.Json.Serialization.JsonIgnore]
        public User? User { get; set; }

        /// <summary>Identyfikator produktu (klucz obcy do tabeli Products).</summary>
        public int ProductId { get; set; }

        /// <summary>Nawigacja do encji produktu zawierającej nazwę i kod kreskowy.</summary>
        public Product? Product { get; set; }

        /// <summary>Ilość produktu w spiżarni (np. 2.5 lub 3).</summary>
        public decimal Quantity { get; set; }

        /// <summary>
        /// Jednostka miary. Pole wymagane. Domyślnie "szt.".
        /// Możliwe wartości: szt., kg, g, l, ml, opak.
        /// </summary>
        [Required]
        public string Unit { get; set; } = "szt.";

        /// <summary>Data ważności produktu. Produkty z datą przeszłą lub ≤ 3 dni pojawiają się na Pulpicie.</summary>
        public DateTime ExpirationDate { get; set; }

        /// <summary>Data ostatniej modyfikacji pozycji (UTC).</summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Data dodania produktu do spiżarni (UTC).</summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}