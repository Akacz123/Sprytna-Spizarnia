using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpizarniaAPI.Data;
using SpizarniaAPI.Models;

namespace SpizarniaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RecipesController(AppDbContext context)
        {
            _context = context;
        }

        private Guid? GetUserId()
        {
            if (Request.Headers.TryGetValue("X-User-Id", out var userIdStr) && Guid.TryParse(userIdStr, out var userId))
                return userId;
            return null;
        }

        [HttpGet("suggestions")]
        public async Task<IActionResult> GetSuggestions()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var today = DateTime.UtcNow.Date;
            var shortDateLimit = today.AddDays(3);

            var dyingIngredients = await _context.PantryItems
                .Include(p => p.Product)
                .Where(p => p.UserId == userId && p.ExpirationDate != null && p.ExpirationDate <= shortDateLimit && p.Product != null)
                .Select(p => p.Product.IngredientId)
                .Distinct()
                .ToListAsync();

            if (!dyingIngredients.Any()) return Ok(new List<object>());

            var suggestedRecipes = await _context.Recipes
                .Include(r => r.RecipeIngredients)
                .ThenInclude(ri => ri.Ingredient)
                .Where(r => r.RecipeIngredients.Any(ri => dyingIngredients.Contains(ri.IngredientId)))
                .Select(r => new
                {
                    id = r.Id,
                    name = r.Title,
                    savedIngredients = r.RecipeIngredients
                        .Where(ri => dyingIngredients.Contains(ri.IngredientId) && ri.Ingredient != null)
                        .Select(ri => ri.Ingredient.Name)
                        .ToList()
                })
                .ToListAsync();

            var sorted = suggestedRecipes
                .GroupBy(r => r.id)
                .Select(g => g.First())
                .OrderByDescending(r => r.savedIngredients.Count)
                .ToList();

            return Ok(sorted);
        }

        [HttpPost("seed")]
        public async Task<IActionResult> SeedRecipes()
        {
            var oldRecipeIngredients = await _context.RecipeIngredients.ToListAsync();
            _context.RecipeIngredients.RemoveRange(oldRecipeIngredients);

            var oldRecipes = await _context.Recipes.ToListAsync();
            _context.Recipes.RemoveRange(oldRecipes);

            await _context.SaveChangesAsync();
            var recipeData = new Dictionary<string, List<string>>
            {
                { "Tradycyjny Rosół", new List<string> { "Kurczak", "Marchew", "Pietruszka", "Seler", "Makaron" } },
                { "Spaghetti Bolognese", new List<string> { "Makaron", "Mięso mielone", "Sos pomidorowy", "Cebula", "Czosnek" } },
                { "Kurczak Curry z Ryżem", new List<string> { "Kurczak", "Mleczko kokosowe", "Pasta curry", "Ryż", "Cebula" } },
                { "Naleśniki Tradycyjne", new List<string> { "Mleko", "Mąka", "Jajka", "Olej", "Sól" } },
                { "Jajecznica na Boczku", new List<string> { "Jajka", "Boczek", "Masło", "Sól", "Pieprz" } },
                { "Zupa Pomidorowa z Ryżem", new List<string> { "Bulion", "Przecier pomidorowy", "Śmietana", "Ryż", "Marchew" } },
                { "Tosty z Awokado i Jajkiem", new List<string> { "Chleb", "Awokado", "Jajka", "Cytryna", "Sól" } },
                { "Sałatka Cezar", new List<string> { "Sałata", "Kurczak", "Grzanki", "Sos czosnkowy", "Parmezan" } },
                { "Placki Ziemniaczane", new List<string> { "Ziemniaki", "Jajka", "Mąka", "Cebula", "Sól" } },
                { "Kotlet Schabowy", new List<string> { "Schab", "Jajka", "Bułka tarta", "Ziemniaki", "Smalec" } },
                { "Tradycyjna Mizeria", new List<string> { "Ogórek", "Śmietana", "Sól", "Pieprz", "Koper" } },
                { "Gulasz Wieprzowy", new List<string> { "Mięso wieprzowe", "Cebula", "Papryka", "Bulion", "Mąka" } },
                { "Pierogi Ruskie", new List<string> { "Mąka", "Ziemniaki", "Twaróg", "Cebula", "Masło" } },
                { "Smoothie Bananowe", new List<string> { "Banan", "Mleko", "Jogurt naturalny", "Miód" } },
                { "Omlet z Pieczarkami", new List<string> { "Jajka", "Pieczarki", "Masło", "Ser żółty", "Sól" } },
                { "Leczo Węgierskie", new List<string> { "Kiełbasa", "Papryka", "Pomidory", "Cebula", "Cukinia" } },
                { "Fasolka po Bretońsku", new List<string> { "Fasola", "Kiełbasa", "Sos pomidorowy", "Cebula", "Czosnek" } },
                { "Zapiekanka Makaronowa", new List<string> { "Makaron", "Kurczak", "Ser żółty", "Śmietana", "Brokuł" } },
                { "Risotto z Kurczakiem", new List<string> { "Ryż", "Kurczak", "Bulion", "Masło", "Parmezan" } },
                { "Kotlety Mielone", new List<string> { "Mięso mielone", "Jajka", "Bułka tarta", "Cebula", "Olej" } },
                { "Zupa Ogórkowa", new List<string> { "Ogórki kiszone", "Bulion", "Ziemniaki", "Śmietana", "Koper" } },
                { "Tradycyjny Bigos", new List<string> { "Kapusta kiszona", "Kiełbasa", "Mięso wieprzowe", "Grzyby", "Cebula" } },
                { "Sałatka Jarzynowa", new List<string> { "Marchew", "Ziemniaki", "Groszek", "Majonez", "Jajka" } },
                { "Ryba Pieczona z Cytryną", new List<string> { "Filet rybny", "Cytryna", "Masło", "Koper", "Sól" } },
                { "Szarlotka z Kruszonką", new List<string> { "Mąka", "Masło", "Jabłko", "Cukier", "Cynamon" } },
                { "Sernik na Zimno", new List<string> { "Twaróg", "Galaretka", "Biszkopty", "Masło", "Cukier puder" } },
                { "Zupa Pieczarkowa", new List<string> { "Pieczarki", "Bulion", "Ziemniaki", "Śmietana", "Natka pietruszki" } },
                { "Chrupiące Gofry", new List<string> { "Mąka", "Mleko", "Jajka", "Proszek do pieczenia", "Olej" } },
                { "Kurczak Słodko-Kwaśny", new List<string> { "Kurczak", "Sos słodko-kwaśny", "Ryż", "Papryka", "Ananas" } },
                { "Zupa Cebulowa", new List<string> { "Cebula", "Bulion", "Grzanki", "Ser żółty", "Masło" } },
                { "Papryka Faszerowana", new List<string> { "Papryka", "Mięso mielone", "Ryż", "Sos pomidorowy", "Ser żółty" } },
                { "Szakszuka z Jajkami", new List<string> { "Papryka", "Pomidory", "Jajka", "Czosnek", "Oliwa z oliwek" } },
                { "Zupa Szczawiowa", new List<string> { "Szczaw", "Bulion", "Ziemniaki", "Jajka", "Śmietana" } },
                { "Krokiety z Grzybami", new List<string> { "Naleśniki", "Pieczarki", "Cebula", "Bułka tarta", "Jajka" } },
                { "Pyzy z Mięsem", new List<string> { "Ziemniaki", "Mąka ziemniaczana", "Mięso wieprzowe", "Cebula", "Sól" } },
                { "Domowe Kopytka", new List<string> { "Ziemniaki", "Mąka", "Jajka", "Sól" } },
                { "Zupa Kalafiorowa", new List<string> { "Kalafior", "Bulion", "Ziemniaki", "Koper", "Śmietana" } },
                { "Babeczki Czekoladowe", new List<string> { "Mąka", "Czekolada", "Jajka", "Masło", "Cukier" } },
                { "Klasyczna Pasta Jajeczna", new List<string> { "Jajka", "Majonez", "Musztarda", "Szczypiorek", "Sól" } },
                { "Chłodnik Litewski", new List<string> { "Buraki", "Maślanka", "Ogórek", "Rzodkiewka", "Jajka" } },
                { "Kasza Gryczana z Grzybami", new List<string> { "Kasza", "Grzyby", "Śmietana", "Cebula", "Masło" } },
                { "Domowy Burger Wołowy", new List<string> { "Bułka", "Wołowina", "Sałata", "Pomidor", "Ser żółty" } },
                { "Frytki z Batatów", new List<string> { "Bataty", "Oliwa z oliwek", "Sól", "Papryka", "Czosnek" } },
                { "Sałatka z Tuńczykiem", new List<string> { "Tuńczyk w puszce", "Sałata", "Kukurydza", "Majonez", "Jajka" } },
                { "Makaron ze Szpinakiem", new List<string> { "Makaron", "Szpinak", "Śmietana", "Czosnek", "Parmezan" } },
                { "Piersi z Kurczaka w Panko", new List<string> { "Kurczak", "Bułka tarta", "Jajka", "Mąka", "Olej" } },
                { "Owsianka z Jabłkiem", new List<string> { "Płatki owsiane", "Mleko", "Jabłko", "Cynamon", "Miód" } },
                { "Tosty z Pieczarkami i Serem", new List<string> { "Chleb", "Pieczarki", "Ser żółty", "Masło", "Ketchup" } },
                { "Sałatka Caprese", new List<string> { "Pomidory", "Mozzarella", "Bazylia", "Oliwa z oliwek", "Sól" } },
                { "Krem z Dyni", new List<string> { "Dynia", "Bulion", "Śmietana", "Czosnek", "Cebula" } },
                { "Kanapki z Pastą Rybną", new List<string> { "Chleb", "Makrela", "Twaróg", "Cebula", "Ogórek" } },
                { "Spaghetti Carbonara", new List<string> { "Makaron", "Boczek", "Jajka", "Parmezan", "Pieprz" } },
                { "Chilli Con Carne", new List<string> { "Mięso mielone", "Fasola", "Kukurydza", "Sos pomidorowy", "Cebula" } },
                { "Tacos z Kurczakiem", new List<string> { "Tortilla", "Kurczak", "Kukurydza", "Papryka", "Sałata" } },
                { "Gulasz z Kurczaka", new List<string> { "Kurczak", "Marchew", "Pietruszka", "Cebula", "Bulion" } },
                { "Lazania Mięsna", new List<string> { "Makaron", "Mięso mielone", "Sos pomidorowy", "Ser żółty", "Mleko" } },
                { "Zapiekanka z Ziemniakami", new List<string> { "Ziemniaki", "Kiełbasa", "Cebula", "Ser żółty", "Śmietana" } },
                { "Domowa Pizza", new List<string> { "Mąka", "Drożdże", "Sos pomidorowy", "Ser żółty", "Szynka" } },
                { "Kurczak w Cieście", new List<string> { "Kurczak", "Mąka", "Jajka", "Olej", "Sól" } },
                { "Sałatka Grecka", new List<string> { "Pomidory", "Ogórek", "Ser feta", "Oliwki", "Cebula" } },
                { "Kluski Leniwe", new List<string> { "Twaróg", "Jajka", "Mąka", "Masło", "Cukier" } },
                { "Zupa Krem z Brokułów", new List<string> { "Brokuł", "Ziemniaki", "Bulion", "Śmietana", "Czosnek" } },
                { "Pierś z Kaczki", new List<string> { "Kaczka", "Jabłko", "Sól", "Pieprz", "Masło" } },
                { "Polędwiczki w Sosie", new List<string> { "Polędwiczka", "Śmietana", "Musztarda", "Cebula", "Olej" } },
                { "Makaron z Tuńczykiem", new List<string> { "Makaron", "Tuńczyk w puszce", "Pomidory", "Cebula", "Czosnek" } },
                { "Placki z Cukinii", new List<string> { "Cukinia", "Jajka", "Mąka", "Cebula", "Olej" } },
                { "Pancake", new List<string> { "Mąka", "Mleko", "Jajka", "Cukier", "Proszek do pieczenia" } },
                { "Pieczone Udka Kurczaka", new List<string> { "Kurczak", "Papryka", "Olej", "Czosnek", "Sól" } },
                { "Gulasz Wołowy", new List<string> { "Wołowina", "Cebula", "Papryka", "Bulion", "Olej" } },
                { "Quesadilla z Kurczakiem", new List<string> { "Tortilla", "Kurczak", "Ser żółty", "Kukurydza", "Papryka" } },
                { "Karkówka z Grilla", new List<string> { "Karkówka", "Olej", "Czosnek", "Musztarda", "Ketchup" } },
                { "Burrito z Wołowiną", new List<string> { "Tortilla", "Wołowina", "Ryż", "Fasola", "Sos pomidorowy" } },
                { "Stek Wołowy", new List<string> { "Wołowina", "Masło", "Czosnek", "Sól", "Pieprz" } },
                { "Krewetki na Maśle", new List<string> { "Krewetki", "Masło", "Czosnek", "Cytryna", "Natka pietruszki" } },
                { "Zupa Rybna", new List<string> { "Filet rybny", "Marchew", "Pietruszka", "Ziemniaki", "Koper" } },
                { "Makaron Pesto", new List<string> { "Makaron", "Pesto", "Pomidory", "Parmezan", "Oliwa z oliwek" } },
                { "Sałatka z Kurczakiem", new List<string> { "Sałata", "Kurczak", "Pomidory", "Ogórek", "Sos czosnkowy" } },
                { "Kurczak Teriyaki", new List<string> { "Kurczak", "Sos sojowy", "Miód", "Ryż", "Brokuł" } },
                { "Roladki Schabowe", new List<string> { "Schab", "Boczek", "Ogórek kiszony", "Cebula", "Olej" } },
                { "Ciasto Czekoladowe", new List<string> { "Mąka", "Czekolada", "Jajka", "Masło", "Cukier" } },
                { "Muffinki Jagodowe", new List<string> { "Mąka", "Mleko", "Jajka", "Jagody", "Cukier" } },
                { "Sok Świeżo Wyciskany", new List<string> { "Pomarańcza", "Marchew", "Jabłko" } },
                { "Hot Dog Domowy", new List<string> { "Bułka", "Parówka", "Ketchup", "Musztarda", "Cebula" } },
                { "Zapiekanki z Pieczarkami", new List<string> { "Bułka", "Pieczarki", "Ser żółty", "Ketchup", "Masło" } },
                { "Gofry z Bita Śmietana", new List<string> { "Mąka", "Mleko", "Jajka", "Śmietana", "Cukier" } },
                { "Sałatka Owocowa", new List<string> { "Banan", "Jabłko", "Pomarańcza", "Winogrona", "Truskawki" } },
                { "Kotlety Sojowe", new List<string> { "Kotlety sojowe", "Bulion", "Jajka", "Bułka tarta", "Olej" } },
                { "Kanapka z Serem i Szynką", new List<string> { "Chleb", "Ser żółty", "Szynka", "Masło", "Sałata" } },
                { "Kurczak w Płatkach", new List<string> { "Kurczak", "Płatki kukurydziane", "Jajka", "Olej", "Mąka" } },
                { "Zupa Gulaszowa", new List<string> { "Mięso wieprzowe", "Ziemniaki", "Papryka", "Bulion", "Cebula" } },
                { "Spaghetti z Klopsikami", new List<string> { "Makaron", "Mięso mielone", "Sos pomidorowy", "Cebula", "Olej" } },
                { "Jajka Sadzone z Ziemniakami", new List<string> { "Jajka", "Ziemniaki", "Masło", "Mleko", "Koper" } },
                { "Sałatka z Brokułem", new List<string> { "Brokuł", "Jajka", "Kukurydza", "Majonez", "Czosnek" } },
                { "Krem z Pieczarek", new List<string> { "Pieczarki", "Bulion", "Śmietana", "Cebula", "Masło" } },
                { "Ciasto Marchewkowe", new List<string> { "Marchew", "Mąka", "Jajka", "Olej", "Cukier" } },
                { "Zapiekanka z Ryżem", new List<string> { "Ryż", "Jabłko", "Cynamon", "Śmietana", "Cukier" } },
                { "Klopsiki w Sosie", new List<string> { "Mięso mielone", "Sos pomidorowy", "Bułka tarta", "Jajka", "Olej" } },
                { "Wafle z Masą", new List<string> { "Wafle", "Masło", "Mleko", "Cukier", "Kakao" } },
                { "Koktajl Truskawkowy", new List<string> { "Truskawki", "Mleko", "Jogurt naturalny", "Cukier" } },
                { "Zupa Jarzynowa", new List<string> { "Marchew", "Pietruszka", "Seler", "Ziemniaki", "Bulion" } },
                { "Ryż na Mleku", new List<string> { "Ryż", "Mleko", "Cukier", "Cynamon", "Masło" } },
                { "Kanapki z Humusem", new List<string> { "Chleb", "Ciecierzyca", "Czosnek", "Oliwa z oliwek", "Pomidory" } },
                { "Zupa Pomidorowa Krem", new List<string> { "Pomidory", "Bulion", "Śmietana", "Czosnek", "Cebula" } },
                { "Roladki z Kurczaka", new List<string> { "Kurczak", "Ser żółty", "Szynka", "Olej", "Sól" } },
                { "Zupa Grochowa", new List<string> { "Groch", "Ziemniaki", "Kiełbasa", "Cebula", "Bulion" } },
                { "Pstrąg z Piekarnika", new List<string> { "Ryba", "Masło", "Cytryna", "Koper", "Sól" } },
                { "Sałatka Gyros", new List<string> { "Kurczak", "Kapusta pekińska", "Kukurydza", "Majonez", "Ketchup" } },
                { "Fasolka Szparagowa z Bułką", new List<string> { "Fasolka szparagowa", "Masło", "Bułka tarta", "Sól" } },
                { "Kompot Jabłkowy", new List<string> { "Jabłko", "Cukier", "Woda", "Cynamon" } },
                { "Ryż smażony", new List<string> { "Ryż", "Jajka", "Groszek", "Marchew", "Sos sojowy" } },
                { "Pieczona Karkówka z Ziemniakami", new List<string> { "Karkówka", "Ziemniaki", "Cebula", "Olej", "Czosnek" } },
                { "Jajka Faszerowane", new List<string> { "Jajka", "Majonez", "Szczypiorek", "Pieczarki", "Sól" } },
                { "Gulasz z Indyka", new List<string> { "Indyk", "Papryka", "Cebula", "Bulion", "Śmietana" } },
                { "Tarta ze Szpinakiem", new List<string> { "Mąka", "Masło", "Szpinak", "Śmietana", "Jajka" } },
                { "Mus Czekoladowy", new List<string> { "Czekolada", "Jajka", "Śmietana", "Cukier", "Masło" } },
                { "Chleb Czosnkowy", new List<string> { "Bagietka", "Masło", "Czosnek", "Natka pietruszki", "Sól" } },
                { "Kurczak w Sosie Serowym", new List<string> { "Kurczak", "Ser żółty", "Śmietana", "Makaron", "Czosnek" } },
                { "Surówka z Kapusty", new List<string> { "Kapusta", "Marchew", "Jabłko", "Majonez", "Olej" } },
                { "Sałatka z Szynką", new List<string> { "Szynka", "Ser żółty", "Jajka", "Kukurydza", "Majonez" } },
                { "Klopsiki Rybne", new List<string> { "Filet rybny", "Bułka tarta", "Jajka", "Cebula", "Olej" } },
                { "Pączki Domowe", new List<string> { "Mąka", "Drożdże", "Mleko", "Jajka", "Cukier" } }
            };

            var cat = await _context.Categories.FirstOrDefaultAsync() ?? new Category { Name = "Ogólne" };
            if (cat.Id == 0)
            {
                _context.Categories.Add(cat);
                await _context.SaveChangesAsync();
            }

            var allIngredients = recipeData.Values.SelectMany(x => x).Distinct().ToList();
            var ingredientDict = new Dictionary<string, int>();

            foreach (var ingName in allIngredients)
            {
                var ing = await _context.Ingredients.FirstOrDefaultAsync(i => i.Name.ToLower() == ingName.ToLower());
                if (ing == null)
                {
                    ing = new Ingredient { Name = ingName, CategoryId = cat.Id };
                    _context.Ingredients.Add(ing);
                    await _context.SaveChangesAsync();
                }
                ingredientDict[ingName] = ing.Id;
            }

            foreach (var recipe in recipeData)
            {
                var existingRecipe = await _context.Recipes.FirstOrDefaultAsync(r => r.Title == recipe.Key);
                if (existingRecipe == null)
                {
                    var newRecipe = new Recipe
                    {
                        Title = recipe.Key,
                        Instructions = "Wymieszaj podane składniki i przygotuj według uznania."
                    };

                    _context.Recipes.Add(newRecipe);
                    await _context.SaveChangesAsync();

                    foreach (var ingName in recipe.Value)
                    {
                        _context.RecipeIngredients.Add(new RecipeIngredient
                        {
                            RecipeId = newRecipe.Id,
                            IngredientId = ingredientDict[ingName]
                        });
                    }
                }
            }
            await _context.SaveChangesAsync();

            return Ok(new { message = "Baza została potężnie zasilona 120 prawdziwymi przepisami!" });
        }
    }
}