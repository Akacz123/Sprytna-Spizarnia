namespace SpizarniaAPI.Models
{
    /// <summary>
    /// Reprezentuje użytkownika aplikacji Sprytna Spiżarnia.
    /// Hasło przechowywane jest wyłącznie jako hash BCrypt.
    /// Każdy użytkownik posiada własną kolekcję produktów w spiżarni (<see cref="PantryItem"/>).
    /// </summary>
    public class User
    {
        /// <summary>Unikalny identyfikator użytkownika (UUID generowany przez PostgreSQL).</summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Adres e-mail użytkownika. Służy jako login.
        /// Wartość jest unikalna w bazie danych (indeks unikalny).
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>Hash hasła wygenerowany algorytmem BCrypt. Nigdy nie przechowuje surowego hasła.</summary>
        public string PasswordHash { get; set; } = string.Empty;

        /// <summary>Data i godzina utworzenia konta (UTC).</summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Lista produktów w spiżarni należących do tego użytkownika.</summary>
        public ICollection<PantryItem> PantryItems { get; set; } = new List<PantryItem>();

        /// <summary>
        /// Seed (ziarno) avatara użytkownika używany przez DiceBear API
        /// do wygenerowania unikalnej grafiki awatara. Może być null (wtedy używany jest e-mail).
        /// </summary>
        public string? AvatarSeed { get; set; }
    }
}