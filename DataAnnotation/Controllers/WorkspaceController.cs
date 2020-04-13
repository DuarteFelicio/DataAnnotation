using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;

namespace DataAnnotation.Controllers
{
	[Authorize]
	[ApiController]
	[Route("[controller]")]
	public class WorkspaceController : Controller
	{
		private readonly ILogger<WorkspaceController> _logger;

		public WorkspaceController(ILogger<WorkspaceController> logger)
		{
			_logger = logger;
		}

		[HttpGet]
		public string[] GetUserFiles()
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId, para saber quem deu upload

			string[] userFiles = { "file1.csv", "file2.csv" , "file3.csv"};
			return userFiles;
		}
	}
}
