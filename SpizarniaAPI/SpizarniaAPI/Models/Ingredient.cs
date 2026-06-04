using System.ComponentModel.DataAnnotations;

namespace SpizarniaAPI.Models;

/// <summary>
/// Reprezentuje ogólny składnik spożywczy (np. "mleko", "jajka", "mąka").
/// Należy do jednej kategorii (<see cref="Category"/>) i może być powiązany
/// z wieloma konkretnymi produktami (<see cref="Product"/>) oraz przepisami (<see cref="RecipeIngredient"/>).
/// </summary>
public class Ingredient
{
    /// <summary>Unikalny identyfikator składnika (klucz główny, auto-inkrementowany).</summary>
    public int Id { get; set; }

    /// <summary>Identyfikator kategorii, do której należy składnik (klucz obcy).</summary>
    public int CategoryId { get; set; }

    /// <summary>Nawigacja do kategorii składnika.</summary>
    public Category? Category { get; set; }

    /// <summary>Nazwa składnika (np. "mleko pełne", "jajka kurze"). Pole wymagane.</summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>Lista konkretnych produktów (marek) odpowiadających temu składnikowi.</summary>
    public List<Product> Products { get; set; } = new();

    /// <summary>Lista powiązań z przepisami, w których ten składnik jest używany.</summary>
    public List<RecipeIngredient> RecipeIngredients { get; set; } = new();
}