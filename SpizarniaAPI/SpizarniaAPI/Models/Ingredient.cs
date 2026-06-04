using System.ComponentModel.DataAnnotations;

namespace SpizarniaAPI.Models;

public class Ingredient
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    public List<Product> Products { get; set; } = new();
    public List<RecipeIngredient> RecipeIngredients { get; set; } = new();
}