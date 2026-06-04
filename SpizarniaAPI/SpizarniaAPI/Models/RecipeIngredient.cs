using System.ComponentModel.DataAnnotations;

namespace SpizarniaAPI.Models;

public class RecipeIngredient
{
    public int Id { get; set; }
    public int RecipeId { get; set; }
    public Recipe? Recipe { get; set; }
    public int IngredientId { get; set; }
    public Ingredient? Ingredient { get; set; }
    public decimal Quantity { get; set; }

    [Required]
    public string Unit { get; set; } = string.Empty;
}