using Microsoft.EntityFrameworkCore;
using SpizarniaAPI.Models;

namespace SpizarniaAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Ingredient> Ingredients { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<PantryItem> PantryItems { get; set; }
    public DbSet<Recipe> Recipes { get; set; }
    public DbSet<RecipeIngredient> RecipeIngredients { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(u => u.CreatedAt).HasDefaultValueSql("now()");
        });
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasIndex(p => p.Barcode).IsUnique();
        });

        modelBuilder.Entity<PantryItem>(entity =>
        {
            entity.Property(p => p.Id).HasDefaultValueSql("gen_random_uuid()");

            entity.Property(p => p.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(p => p.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(p => p.User)
                  .WithMany(u => u.PantryItems)
                  .HasForeignKey(p => p.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}