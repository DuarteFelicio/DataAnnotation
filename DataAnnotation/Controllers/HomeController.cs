using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using DataAnnotation.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using Newtonsoft.Json.Linq;
using System.Diagnostics.CodeAnalysis;

namespace DataAnnotation.Controllers
{
	[Authorize]
	[ApiController]
	[Route("[controller]/[action]")]
	public class HomeController : Controller
	{
		private readonly DataAnnotationDBContext _context;
		private readonly ILogger<HomeController> _logger;

		public HomeController(ILogger<HomeController> logger, DataAnnotationDBContext context, IConfiguration config)
		{
			_context = context;
			_logger = logger;
		}

		[HttpGet]
		public IActionResult GetUserDetails()   //returns some statistics about the user
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId
			JObject ret = new JObject();
			AspNetUsers currentUser = _context.AspNetUsers.Find(userId);
			if(currentUser == null) return NoContent();

			ret.Add("userName", currentUser.UserName);
			List<CsvFile> userFiles = _context.CsvFile.Where(f => f.UserId == userId).ToList();
			ret.Add("currentUploadedFiles", userFiles.Count());
			ret.Add("currentAnalysedFiles", userFiles.FindAll(f => f.AnalysisCompletionTime != null).Count);
			ret.Add("localUploaded", userFiles.FindAll(f => f.Origin == "local").Count);
			ret.Add("urlUploaded", userFiles.FindAll(f => f.Origin != "local").Count);
			List<LoginRecord> loginRecords = _context.LoginRecord.Where(l => l.UserId == userId).ToList();
			ret.Add("lastLogin", loginRecords.Count == 1 ? loginRecords.First().LoginTime : loginRecords[loginRecords.Count - 2].LoginTime);

			IEnumerator<UserActionRecord> list = _context.ActionRecord.Join(_context.CsvFile,
				a => a.CsvFileId,
				c => c.CsvFileId,
				(a, c) => new UserActionRecord(a.Action, a.CsvFileId, a.Version, a.ActionTime, c.UserId, c.FileNameDisplay))
				.AsEnumerable()
				.Where(u => u.UserId == userId).Reverse().Distinct(new FileVersionComparer())
				.Take(7).GetEnumerator();       //needed
			list.MoveNext();
			UserActionRecord[] actionsArray = new UserActionRecord[7];
			for(int i = 0; i<actionsArray.Length; ++i, list.MoveNext())
			{
				actionsArray[i] = list.Current;
			}
			JArray jArray = new JArray();
			for (int i = 0; i < actionsArray.Length; ++i)
			{
				if(actionsArray[i] == null)
				{
					break;
				}
				jArray.Add(JToken.FromObject(actionsArray[i]));
			}
			ret.Add("lastActions", jArray);
			return Ok(ret);
		}

		public class UserActionRecord
		{
			public UserActionRecord(string action, int csvFileId, string version, DateTime actionTime, string userId, string fileName)
			{
				Action = action;
				CsvFileId = csvFileId;
				Version = version;
				ActionTime = actionTime;
				UserId = userId;
				FileName = fileName;
			}

			public string Action { get; set; }
			public int CsvFileId { get; set; }
			public string Version { get; set; }
			public DateTime ActionTime { get; set; }
			public string UserId { get; set; }
			public string FileName { get; set; }
		}

		public class FileVersionComparer : IEqualityComparer<UserActionRecord>
		{
			public bool Equals([AllowNull] UserActionRecord x, [AllowNull] UserActionRecord y)
			{
				return (x.CsvFileId == y.CsvFileId && x.Version == y.Version);
			}

			public int GetHashCode([DisallowNull] UserActionRecord obj)
			{
				return (obj.CsvFileId + Int32.Parse(obj.Version.Split("_v")[1])).GetHashCode();
			}
		}
	}
}