using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;

namespace SpizarniaAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ScannerController : ControllerBase
	{
		private static ConcurrentDictionary<string, string> _scannedCodes = new();

		[HttpPost("{sessionId}")]
		public IActionResult PostBarcode(string sessionId, [FromBody] ScanDto dto)
		{
			_scannedCodes[sessionId] = dto.Barcode;
			return Ok(new { success = true });
		}

		[HttpGet("{sessionId}")]
		public IActionResult GetBarcode(string sessionId)
		{
			if (_scannedCodes.TryRemove(sessionId, out var barcode))
			{
				return Ok(new { barcode = barcode });
			}
			return NotFound();
		}
	}

	public class ScanDto
	{
		public string Barcode { get; set; } = string.Empty;
	}
}