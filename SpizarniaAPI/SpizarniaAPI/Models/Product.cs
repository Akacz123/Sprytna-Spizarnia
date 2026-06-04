using System.ComponentModel.DataAnnotations;

namespace SpizarniaAPI.Models;

public class Product
{
    public int Id { get; set; }
    public int IngredientId { get; set; }
    public Ingredient? Ingredient { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;
    public string? Barcode { get; set; }

    public Guid UserId { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public User? User { get; set; }
}