using System.ComponentModel.DataAnnotations;

namespace SpizarniaAPI.Models;

/// <summary>
/// Reprezentuje konkretny produkt spożywczy (np. markę) powiązany z ogólnym składnikiem (<see cref="Ingredient"/>).
/// Produkt może być identyfikowany przez unikalny kod kreskowy EAN.
/// Każdy produkt jest powiązany z użytkownikiem, który go dodał (<see cref="User"/>).
/// </summary>
public class Product
{
    /// <summary>Unikalny identyfikator produktu (klucz główny, auto-inkrementowany).</summary>
    public int Id { get; set; }

    /// <summary>Identyfikator ogólnego składnika, do którego należy ten produkt (klucz obcy).</summary>
    public int IngredientId { get; set; }

    /// <summary>Nawigacja do ogólnego składnika (np. "mleko").</summary>
    public Ingredient? Ingredient { get; set; }

    /// <summary>Nazwa produktu (np. "Mleko Łaciate 3,2%"). Pole wymagane.</summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Kod kreskowy EAN-8 lub EAN-13. Opcjonalny, lecz unikalny w bazie danych.
    /// Produkty dodane ręcznie bez kodu mają wartość w formacie <c>"BRAK-{timestamp}"</c>.
    /// </summary>
    public string? Barcode { get; set; }

    /// <summary>Identyfikator użytkownika, który dodał produkt (klucz obcy).</summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Nawigacja do użytkownika-właściciela. Oznaczona <c>[JsonIgnore]</c>
    /// aby uniknąć cykli referencyjnych podczas serializacji JSON.
    /// </summary>
    [System.Text.Json.Serialization.JsonIgnore]
    public User? User { get; set; }
}