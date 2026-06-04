namespace SpizarniaAPI.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<PantryItem> PantryItems { get; set; } = new List<PantryItem>();
        public string? AvatarSeed { get; set; }
    }
}