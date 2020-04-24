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
using DataAnnotation.Utilities;
using System.Data;
using DataAnnotation.Models.Analysis;

namespace DataAnnotation.Controllers
{
	//[Authorize]
	[ApiController]
	[Route("[controller]/[action]")]
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
		public IActionResult GetUserFiles()
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			return Ok(_context.CsvFile.Where(f => f.UserId == userId).ToList());
		}


		//so para teste
		[HttpGet]
		public IActionResult AnalyseFile(int fileId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			userId = "b842a218-4cb2-44b1-9ee3-d92f5903049a";
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFilesId == fileId).FirstOrDefault();
			if (file.CsvFilesId == 0) return NotFound();

			string filepath = Path.Combine(_targetFilePath,Path.Combine(userId, file.FileNameStorage));

			AnalyseCsvFile analyseCsvFile = new AnalyseCsvFile(_context);
			Metadata metadata = analyseCsvFile.InitAnalysis(filepath,file);

			return Ok(metadata);
		}
	}
}
