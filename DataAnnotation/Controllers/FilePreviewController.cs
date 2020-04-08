using DataAnnotation.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace WebApplicationDemo.Controllers
{
	[Authorize]
	[ApiController]
	[Route("[controller]")]
	public class FilePreviewController : Controller
	{
		private readonly ILogger<FilePreviewController> _logger;

		public FilePreviewController(ILogger<FilePreviewController> logger)
		{
			_logger = logger;
		}

		[HttpPost]
		[DisableRequestSizeLimit]
		public async Task<FilePreview> Post(IEnumerable<IFormFile> files)
		{

			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId, para saber quem deu upload

			FilePreview prev = new FilePreview();
			prev.FirstLines = new List<string>();

			using (var reader = new StreamReader(files.First().OpenReadStream()))
			{
				prev.FirstLines.Add(reader.ReadLine());
				prev.FirstLines.Add(reader.ReadLine());
				prev.FirstLines.Add(reader.ReadLine());
			}
			return prev;
		}
	}
}
