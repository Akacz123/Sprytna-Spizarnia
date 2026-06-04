using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpizarniaAPI.Data;
using SpizarniaAPI.Models;

namespace SpizarniaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PantryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PantryController(AppDbContext context)
        {
            _context = context;
        }

        private Guid? GetUserId()
        {
            if (Request.Headers.TryGetValue("X-User-Id", out var userIdStr) && Guid.TryParse(userIdStr, out var userId))
            {
                return userId;
            }
            return null;
        }

        [HttpGet]
        public async Task<ActionResult> GetPantryItems()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized("Brak autoryzacji.");

            var items = await _context.PantryItems
                .Include(p => p.Product)
                .Where(p => p.UserId == userId)
                .Select(p => new
                {
                    id = p.Id,
                    name = p.Product != null ? p.Product.Name : "Nieznany produkt",
                    barcode = p.Product != null ? p.Product.Barcode : "",
                    quantity = p.Quantity,
                    unit = p.Unit,
                    expirationDate = p.ExpirationDate,
                    updatedAt = p.UpdatedAt
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePantryItem(Guid id, [FromBody] AddToPantryDto dto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var item = await _context.PantryItems.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (item == null) return NotFound();

            var product = await _context.Products.FirstOrDefaultAsync(p => p.Name.ToLower() == dto.Name.ToLower());
            if (product == null)
            {
                var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name.ToLower() == "inne");
                if (category == null)
                {
                    category = new Category { Name = "Inne" };
                    _context.Categories.Add(category);
                    await _context.SaveChangesAsync();
                }

                var ingredient = new Ingredient { Name = dto.Name, CategoryId = category.Id };
                _context.Ingredients.Add(ingredient);
                await _context.SaveChangesAsync();

                product = new Product { Name = dto.Name, IngredientId = ingredient.Id, UserId = userId.Value, Barcode = string.IsNullOrWhiteSpace(dto.Barcode) ? $"BRAK-{DateTime.UtcNow.Ticks}" : dto.Barcode };
                _context.Products.Add(product);
                await _context.SaveChangesAsync();
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(dto.Barcode) && !dto.Barcode.StartsWith("BRAK-"))
                {
                    if (string.IsNullOrWhiteSpace(product.Barcode) || product.Barcode.StartsWith("BRAK-"))
                    {
                        product.Barcode = dto.Barcode;
                    }
                }
            }

            item.ProductId = product.Id;
            item.Quantity = dto.Quantity;
            item.Unit = dto.Unit;
            item.ExpirationDate = dto.ExpirationDate;
            item.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(item);
        }
        [HttpPost]
        public async Task<ActionResult> PostPantryItem([FromBody] AddToPantryDto dto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized("Brak autoryzacji.");

            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Name.ToLower() == dto.Name.ToLower());

            if (product == null)
            {
                var ingredient = await _context.Ingredients
                    .FirstOrDefaultAsync(i => i.Name.ToLower() == dto.Name.ToLower());

                if (ingredient == null)
                {
                    var category = await _context.Categories
                        .FirstOrDefaultAsync(c => c.Name.ToLower() == "inne");

                    if (category == null)
                    {
                        category = new Category { Name = "Inne" };
                        _context.Categories.Add(category);
                        await _context.SaveChangesAsync();
                    }

                    ingredient = new Ingredient
                    {
                        Name = dto.Name,
                        CategoryId = category.Id
                    };
                    _context.Ingredients.Add(ingredient);
                    await _context.SaveChangesAsync();
                }

                product = new Product
                {
                    Name = dto.Name,
                    Barcode = dto.Barcode,
                    IngredientId = ingredient.Id,
                    UserId = userId.Value
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();
            }

            var pantryItem = new PantryItem
            {
                UserId = userId.Value,
                ProductId = product.Id,
                Quantity = dto.Quantity,
                Unit = dto.Unit,
                ExpirationDate = dto.ExpirationDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.PantryItems.Add(pantryItem);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = pantryItem.Id,
                name = product.Name,
                quantity = pantryItem.Quantity,
                unit = pantryItem.Unit,
                expirationDate = pantryItem.ExpirationDate
            });
        }
       
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePantryItem(Guid id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized("Brak autoryzacji.");

            var pantryItem = await _context.PantryItems
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (pantryItem == null) return NotFound();

            _context.PantryItems.Remove(pantryItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class AddToPantryDto
    {
        public string Name { get; set; } = string.Empty;
        public string Barcode { get; set; } = string.Empty;
        public DateTime ExpirationDate { get; set; }
        public decimal Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
    }
}