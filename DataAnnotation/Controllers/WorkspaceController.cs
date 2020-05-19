using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Security.Claims;
using System.IO;
using Microsoft.Extensions.Configuration;
using DataAnnotation.Models;
using DataAnnotation.Utilities;
using System.Data;
using DataAnnotation.Models.Analysis;
using System;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace DataAnnotation.Controllers
{
	[Authorize]
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

		[HttpDelete]
		public IActionResult RemoveFile([FromQuery]int fileId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFilesId == fileId).FirstOrDefault();
			if (file.CsvFilesId == 0) return NotFound();

			string filePath = Path.Combine(_targetFilePath, Path.Combine(userId, file.FileNameStorage));

			try
			{
				_context.CsvFile.Remove(file);
				_context.SaveChanges();
				System.IO.File.Delete(filePath);
				if(file.AnalysisCompletionTime != null)
				{
					filePath += "_analysis";
					System.IO.File.Delete(filePath);
				}
			}
			catch (DbUpdateException e)
			{
				return StatusCode(500, e);
			}
			catch (Exception e)
			{
				_context.CsvFile.Add(file);
				_context.SaveChanges();
				return StatusCode(500, e);
			}
			finally
			{
				_context.Dispose();
			}
			return Ok();
		}

		//so para teste
		[HttpGet]
		public IActionResult AnalyseFile([FromQuery]int fileId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFilesId == fileId).FirstOrDefault();
			if (file.CsvFilesId == 0) return NotFound();

			string folderPath = Path.Combine(_targetFilePath, userId);
			string filePath = Path.Combine(folderPath, file.FileNameStorage);

			AnalyseCsvFile analyseCsvFile = new AnalyseCsvFile(_context);
			Metadata metadata = analyseCsvFile.InitAnalysis(filePath, file);

			var json = JsonSerializer.Serialize(metadata);
			filePath += "_analysis";
			System.IO.File.WriteAllText(filePath, json);

			return Ok(file);
		}
	}
}
