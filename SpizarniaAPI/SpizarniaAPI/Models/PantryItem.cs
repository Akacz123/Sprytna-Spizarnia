using System.ComponentModel.DataAnnotations;

namespace SpizarniaAPI.Models
{
    public class PantryItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid UserId { get; set; }

        [System.Text.Json.Serialization.JsonIgnore]
        public User? User { get; set; }

        public int ProductId { get; set; }
        public Product? Product { get; set; }

        public decimal Quantity { get; set; }

        [Required]
        public string Unit { get; set; } = "szt.";

        public DateTime ExpirationDate { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}