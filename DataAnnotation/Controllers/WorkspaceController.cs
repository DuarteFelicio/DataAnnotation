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
using System.Collections.Generic;

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
		public IActionResult GetUserFiles()	//list all user csv files
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			return Ok(_context.CsvFile.Where(f => f.UserId == userId).ToList());
		}   

		[HttpDelete]
		public IActionResult RemoveFile([FromQuery]int fileId)	//remove a csv file and all its analysis if aplicable
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string fileFolderPath = Path.Combine(_targetFilePath, Path.Combine(userId, file.FileNameStorage));

			try
			{
				_context.CsvFile.Remove(file);
				_context.SaveChanges();
				System.IO.Directory.Delete(fileFolderPath, true);	//deletes sub folders and files within
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
		public IActionResult AnalyseFile([FromQuery]int fileId)	//start a file analysis
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string folderPath = Path.Combine(_targetFilePath, userId);
			string fileFolderPath = Path.Combine(folderPath, file.FileNameStorage);
			string filePath = Path.Combine(fileFolderPath, file.FileNameStorage);

			file.IsAnalysing = true;
			_context.CsvFile.Update(file);
			_context.SaveChanges();

			Sender(fileId, filePath);

			return Ok(file);
		}

		[HttpGet]
		public IActionResult DownloadAnalysis([FromQuery]int fileId)	//send analysis file to download
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string folderPath = Path.Combine(_targetFilePath, userId, file.FileNameStorage, "analysis");
			List<AnalysisFile> analysisFiles = GetAnalysisFiles(fileId);
			string filePath = Path.Combine(folderPath, analysisFiles[analysisFiles.Count-1].Name);	//return last analysis
			
			FileStream fileStream = System.IO.File.OpenRead(filePath);
			return File(fileStream, "application/octet-stream");
		}

		[HttpGet]
		public IActionResult ReturnAnalysis([FromQuery]int fileId)	//returns last analysis of csv file
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string folderPath = Path.Combine(_targetFilePath, userId, file.FileNameStorage, "analysis");
			List<AnalysisFile> analysisFiles = GetAnalysisFiles(fileId);
			string filePath = Path.Combine(folderPath, analysisFiles[analysisFiles.Count - 1].Name);    //return last analysis

			var json = System.IO.File.ReadAllText(filePath);
			return Ok(json);
		}

		[HttpGet]
		public IActionResult ReturnAnalysis2([FromQuery]int fileId, int index)	//returns analysis version given by index
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string folderPath = Path.Combine(_targetFilePath, userId, file.FileNameStorage, "analysis");
			List<AnalysisFile> analysisFiles = GetAnalysisFiles(fileId);
			string filePath = Path.Combine(folderPath, analysisFiles[index].Name);    //return analysis given by index

			var json = System.IO.File.ReadAllText(filePath);
			return Ok(json);
		}

		[HttpGet]
		public IActionResult IsAnalysisComplete([FromQuery]int fileId)	//checks analysis completion
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string folderPath = Path.Combine(_targetFilePath, userId, file.FileNameStorage, "analysis");
			string filePath = Path.Combine(folderPath, file.FileNameStorage);
			filePath += "_analysis_v1";
			if (System.IO.File.Exists(filePath))
			{
				file.IsAnalysing = false;
				_context.CsvFile.Update(file);
				_context.SaveChanges();
				return Ok(file);
			}
			return NoContent();
		}

		[HttpGet]
		public IActionResult GetAnalysis(int fileId)	//return list of analysis versions
		{
			List<AnalysisFile> analysisFiles = GetAnalysisFiles(fileId);
			
			if (analysisFiles.Count == 0 || analysisFiles == null)
			{
				return NotFound(); //é mesmo este?
			}
			return Ok(analysisFiles);	//é preciso ser em array?
		}

		[HttpGet]
		public IActionResult SaveAnalysis(string json)
		{
			throw new NotImplementedException();
		}

		public List<AnalysisFile> GetAnalysisFiles(int fileId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return null;

			string folderPath = Path.Combine(_targetFilePath, userId, file.FileNameStorage, "analysis");
			var dirInfo = new DirectoryInfo(folderPath);
			List<AnalysisFile> analysisFiles = new List<AnalysisFile>();
			foreach (FileInfo fi in dirInfo.EnumerateFiles())
			{
				analysisFiles.Add(new AnalysisFile(fi.Name, fi.LastWriteTime));
			}
			return analysisFiles;
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

		public class AnalysisFile
		{
			public AnalysisFile(string name, DateTime lastEdit)
			{
				Name = name;
				LastEdit = lastEdit;
			}

			public string Name { get; set; }
			public DateTime LastEdit { get; set; }
		}
	}
}
