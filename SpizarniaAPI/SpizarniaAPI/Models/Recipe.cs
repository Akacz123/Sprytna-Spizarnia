using System.ComponentModel.DataAnnotations;

namespace SpizarniaAPI.Models;

public class Recipe
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Instructions { get; set; } = string.Empty;
    public int? PrepTimeMinutes { get; set; }

    public List<RecipeIngredient> RecipeIngredients { get; set; } = new();
}