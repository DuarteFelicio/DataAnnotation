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
using System;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using RabbitMQ.Client;
using System.Text;
using RabbitMQ.Client.Events;
using System.Threading;

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

		[HttpDelete]
		public IActionResult RemoveFile([FromQuery]int fileId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

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

		[HttpGet]
		public IActionResult AnalyseFile([FromQuery]int fileId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string folderPath = Path.Combine(_targetFilePath, userId);
			string filePath = Path.Combine(folderPath, file.FileNameStorage);

			file.IsAnalysing = true;
			_context.CsvFile.Update(file);
			_context.SaveChanges();

			Sender(fileId, filePath);

			return Ok(file);
		}

		[HttpGet]
		public IActionResult DownloadAnalysis([FromQuery]int fileId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string folderPath = Path.Combine(_targetFilePath, userId);
			string filePath = Path.Combine(folderPath, file.FileNameStorage);
			filePath += "_analysis";
			FileStream fileStream = System.IO.File.OpenRead(filePath);
			return File(fileStream, "application/octet-stream");
		}

		[HttpGet]
		public IActionResult ReturnAnalysis([FromQuery]int fileId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string folderPath = Path.Combine(_targetFilePath, userId);
			string filePath = Path.Combine(folderPath, file.FileNameStorage);
			filePath += "_analysis";
			var json = System.IO.File.ReadAllText(filePath);
			return Ok(json);
		}

		[HttpGet]
		public IActionResult IsAnalysisComplete([FromQuery]int fileId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string folderPath = Path.Combine(_targetFilePath, userId);
			string filePath = Path.Combine(folderPath, file.FileNameStorage);
			filePath += "_analysis";
			if(System.IO.File.Exists(filePath))
			{
				file.IsAnalysing = false;
				_context.CsvFile.Update(file);
				_context.SaveChanges();
				return Ok(file);
			}
			return NoContent();
		}

		public void Sender(int fileId, string filePath)
		{
			var factory = new ConnectionFactory() { HostName = "localhost" };	//as longs as it is running in the same machine
			using (var connection = factory.CreateConnection())
			using (var channel = connection.CreateModel())
			{
				channel.QueueDeclare(queue: "orders",
									 durable: false,
									 exclusive: false,
									 autoDelete: false,
									 arguments: null);

				string message = fileId + "|" + filePath;
				var body = Encoding.UTF8.GetBytes(message);

				channel.BasicPublish(exchange: "",
									 routingKey: "orders",
									 basicProperties: null,
									 body: body);

				_logger.LogInformation("[x] Sent {0} ", message);
			}
		}
	}
}
