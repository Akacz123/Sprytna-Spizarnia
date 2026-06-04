using System.ComponentModel.DataAnnotations;

namespace SpizarniaAPI.Models;

public class Category
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    public List<Ingredient> Ingredients { get; set; } = new();
}