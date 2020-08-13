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
using GenericParsing;
using System.Data.Common;
using Microsoft.VisualBasic.CompilerServices;
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
				_context.CsvFile.Add(file);		//isto da bug se o ficheiro tiver sido removido pelo file system
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
			List<AnalysisFile> analysisFiles = GetAnalysisFiles(userId, fileId);
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
			List<AnalysisFile> analysisFiles = GetAnalysisFiles(userId, fileId);
			string filePath = Path.Combine(folderPath, analysisFiles[analysisFiles.Count - 1].Name);    //return last analysis

			var json = System.IO.File.ReadAllText(filePath);
			return Ok(json);
		}

		[HttpGet]
		public IActionResult ReturnAnalysisVersion([FromQuery]int fileId, string fileName)	//returns analysis version given by index
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string folderPath = Path.Combine(_targetFilePath, userId, file.FileNameStorage, "analysis");
			string filePath = Path.Combine(folderPath, fileName);    //return analysis given by index

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
			string filePath = Path.Combine(folderPath, "analysis_v1");
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
		public IActionResult ListAnalysis([FromQuery]int fileId)	//return list of analysis versions
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId

			List <AnalysisFile> analysisFiles = GetAnalysisFiles(userId, fileId);
			
			if (analysisFiles.Count == 0 || analysisFiles == null)
			{
				return NotFound(); //é mesmo este?
			}
			return Ok(analysisFiles.OrderByDescending((a)=>a.LastEdit).ToArray());	//é preciso ser em array?
		}

		[HttpPost]
		public IActionResult SaveAnalysis([FromQuery]int fileId, [FromBody] JsonElement body)	//saves a edited file
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string json = System.Text.Json.JsonSerializer.Serialize(body);

			string folderPath = Path.Combine(_targetFilePath, userId, file.FileNameStorage, "analysis");
			int version = Int32.Parse(GetAnalysisFiles(userId, fileId).Last().Name.Split("_v")[1]);
			string filePath = Path.Combine(folderPath, "analysis_v" + ++version);
			System.IO.File.WriteAllText(filePath, json);
			return Created(nameof(WorkspaceController), null);
		}

		[HttpDelete]
		public IActionResult DeleteAnalysisVersion([FromQuery]int fileId, [FromQuery]string analysisFile)		//deletes a version of analysis
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string filePath = Path.Combine(_targetFilePath, Path.Combine(userId, file.FileNameStorage, "analysis", analysisFile));

			try
			{
				System.IO.File.Delete(filePath);	//DANGER: se o ficheiro a ser apagado não existe não dá exceção
			}
			catch (Exception e)
			{
				return StatusCode(500, e);
			}

			return Ok();
		}

		[HttpGet]
		public IActionResult GetFirstValues([FromQuery]int fileId, [FromQuery]int colId)		//gets first values of a specified column
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string filePath = Path.Combine(_targetFilePath, Path.Combine(userId, file.FileNameStorage, file.FileNameStorage));

			DataTable data = new DataTable();
			using (GenericParserAdapter parser = new GenericParserAdapter())
			{
				parser.SetDataSource(filePath);
				parser.ColumnDelimiter = ';';
				parser.FirstRowHasHeader = true;
				data = parser.GetDataTable();
			}
			if(colId > data.Columns.Count - 1)
			{
				return StatusCode(500, "index of column out of bounds");
			}
			int rowcount = data.Rows.Count;
			if (rowcount > 10)
			{
				rowcount = 10;
			}
			List<string> values = new List<string>(rowcount);
			foreach(DataRow row in data.Rows)
			{
				values.Add((string)row[colId]);
				if(--rowcount == 0)
				{
					break;
				}
			}
			return Ok(values.ToArray());
		}

		[HttpGet]
		public IActionResult MetricToDimension([FromQuery]int fileId, [FromQuery]string colName, [FromQuery]int colId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return NotFound();

			string filePath = Path.Combine(_targetFilePath, Path.Combine(userId, file.FileNameStorage, file.FileNameStorage));

			DataTable data = new DataTable();
			using (GenericParserAdapter parser = new GenericParserAdapter())
			{
				parser.SetDataSource(filePath);
				parser.ColumnDelimiter = ';';
				parser.FirstRowHasHeader = true;
				data = parser.GetDataTable();
			}
			if (colId > data.Columns.Count - 1)
			{
				return StatusCode(500, "index of column out of bounds");
			}
			CsvColumn csvColumn = new CsvColumn(file, colName, colId, _context);
			csvColumn.AnalyseDimension(data.Rows);

			return Ok(new MD_Dimensao(csvColumn));
		}

		public List<AnalysisFile> GetAnalysisFiles(string userId, int fileId)
		{
			CsvFile file = _context.CsvFile.Where(f => f.UserId == userId && f.CsvFileId == fileId).FirstOrDefault();
			if (file.CsvFileId == 0) return null;

			string folderPath = Path.Combine(_targetFilePath, userId, file.FileNameStorage, "analysis");
			var dirInfo = new DirectoryInfo(folderPath);
			List<AnalysisFile> analysisFiles = new List<AnalysisFile>();
			foreach (FileInfo fi in dirInfo.EnumerateFiles())
			{
				analysisFiles.Add(new AnalysisFile(fi.Name, fi.LastWriteTime));
			}
			return analysisFiles.OrderBy((a)=>a.LastEdit).ToList();
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
