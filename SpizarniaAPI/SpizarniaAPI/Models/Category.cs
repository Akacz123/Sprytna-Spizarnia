using System.ComponentModel.DataAnnotations;

namespace SpizarniaAPI.Models;

/// <summary>
/// Reprezentuje kategorię składników spożywczych (np. "Nabiał", "Mięso", "Warzywa", "Inne").
/// Każda kategoria może zawierać wiele składników (<see cref="Ingredient"/>).
/// Kategoria "Inne" tworzona jest automatycznie przez <c>PantryController</c> dla nowych produktów.
/// </summary>
public class Category
{
    /// <summary>Unikalny identyfikator kategorii (klucz główny, auto-inkrementowany).</summary>
    public int Id { get; set; }

    /// <summary>Nazwa kategorii (np. "Inne", "Nabiał"). Pole wymagane.</summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>Lista składników należących do tej kategorii.</summary>
    public List<Ingredient> Ingredients { get; set; } = new();
}