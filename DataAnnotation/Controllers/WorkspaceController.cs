using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using System.IO;
using DataAnnotation.Data;
using Microsoft.Extensions.Configuration;
using DataAnnotation.Models;

namespace DataAnnotation.Controllers
{
	[Authorize]
	[ApiController]
	[Route("[controller]")]
	public class WorkspaceController : Controller
	{
		private readonly DataAnnotationDBContext _context;
		private readonly ILogger<WorkspaceController> _logger;
		private readonly string _targetFilePath;

		public WorkspaceController(ILogger<WorkspaceController> logger, DataAnnotationDBContext context, IConfiguration config)
		{
			_context = context;
			_logger = logger;
			_targetFilePath = config.GetValue<string>("TargetFilePath");
		}

		[HttpGet]
		public async Task<string[]> GetUserFiles()
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId

			return _context.FileNames.Where(f => f.UserId == userId).ToList().Select(f => f.FileNameDisplay).ToArray();
		}
	}
}
