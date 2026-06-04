using System.ComponentModel.DataAnnotations;

namespace SpizarniaAPI.Models;

/// <summary>
/// Tabela pośrednia łącząca przepisy (<see cref="Recipe"/>) ze składnikami (<see cref="Ingredient"/>).
/// Przechowuje wymaganą ilość i jednostkę miary danego składnika w konkretnym przepisie.
/// </summary>
public class RecipeIngredient
{
    /// <summary>Unikalny identyfikator powiązania (klucz główny, auto-inkrementowany).</summary>
    public int Id { get; set; }

    /// <summary>Identyfikator przepisu (klucz obcy).</summary>
    public int RecipeId { get; set; }

    /// <summary>Nawigacja do przepisu.</summary>
    public Recipe? Recipe { get; set; }

    /// <summary>Identyfikator składnika (klucz obcy).</summary>
    public int IngredientId { get; set; }

    /// <summary>Nawigacja do składnika. Używana przez <c>RecipesController</c> do pobierania nazwy składnika.</summary>
    public Ingredient? Ingredient { get; set; }

    /// <summary>Wymagana ilość składnika w przepisie (może być 0 jeśli nie podano).</summary>
    public decimal Quantity { get; set; }

    /// <summary>Jednostka miary (np. "g", "ml", "szt."). Pole wymagane.</summary>
    [Required]
    public string Unit { get; set; } = string.Empty;
}