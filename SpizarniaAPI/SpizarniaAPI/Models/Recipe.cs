using System.ComponentModel.DataAnnotations;

namespace SpizarniaAPI.Models;

/// <summary>
/// Reprezentuje przepis kulinarny w systemie.
/// Przepisy są sugerowane użytkownikowi przez <c>RecipesController</c> na podstawie składników
/// z krótką datą ważności. Baza ~100 przepisów może być zasilona endpointem <c>POST /api/recipes/seed</c>.
/// </summary>
public class Recipe
{
    /// <summary>Unikalny identyfikator przepisu (klucz główny, auto-inkrementowany).</summary>
    public int Id { get; set; }

    /// <summary>Tytuł przepisu (np. "Spaghetti Bolognese"). Pole wymagane.</summary>
    [Required]
    public string Title { get; set; } = string.Empty;

    /// <summary>Instrukcje przygotowania potrawy w formie tekstu. Pole wymagane.</summary>
    [Required]
    public string Instructions { get; set; } = string.Empty;

    /// <summary>Szacowany czas przygotowania w minutach. Wartość opcjonalna.</summary>
    public int? PrepTimeMinutes { get; set; }

    /// <summary>Lista powiązań ze składnikami wymaganymi przez ten przepis.</summary>
    public List<RecipeIngredient> RecipeIngredients { get; set; } = new();
}