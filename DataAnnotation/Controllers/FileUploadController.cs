using DataAnnotation.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Net;
using Microsoft.Net.Http.Headers;
using System.Security.Claims;
using System.Threading.Tasks;
using DataAnnotation.Attributes;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Configuration;
using DataAnnotation.Data;
using System.Linq;
using DataAnnotation.Models;
using System;
using System.Net.Http;

namespace DataAnnotation.Controllers
{
	[Authorize]
	[ApiController]
	[Route("[controller]/[action]")]
	//[GenerateAntiforgeryTokenCookie]
	public class FileUploadController : Controller
	{
		private readonly ILogger<FileUploadController> _logger;
		private readonly string _targetFilePath;
		private readonly long _fileSizeLimit;
		private readonly string[] _permittedExtensions;
		private readonly DataAnnotationDBContext _context;

		private static readonly HttpClient _httpClient;
		private static readonly FormOptions _defaultFormOptions;

		static FileUploadController()
		{
			_httpClient = new HttpClient();
			_defaultFormOptions = new FormOptions();
		}
		public FileUploadController(ILogger<FileUploadController> logger, DataAnnotationDBContext context, IConfiguration config)
		{
			_logger = logger;
			_targetFilePath = config.GetValue<string>("TargetFilePath");
			_fileSizeLimit = config.GetValue<long>("FileSizeLimit");
			_permittedExtensions = config.GetSection("PermittedExtensions").GetChildren().ToArray().Select(v => v.Value).ToArray();
			_context = context;
		}

		[HttpPost]
		[DisableRequestSizeLimit]
		[DisableFormValueModelBinding]
		//[ValidateAntiForgeryToken]
		public async Task<IActionResult> Physical()
		{
			if (!MultipartRequestHelper.IsMultipartContentType(Request.ContentType))
			{
				ModelState.AddModelError("File", $"The request couldn't be processed (Error 1).");  // Log error
				return BadRequest(ModelState);
			}

			var boundary = MultipartRequestHelper.GetBoundary(
				MediaTypeHeaderValue.Parse(Request.ContentType),
				_defaultFormOptions.MultipartBoundaryLengthLimit);
			var reader = new MultipartReader(boundary, HttpContext.Request.Body);
			var section = await reader.ReadNextSectionAsync();

			while (section != null)
			{
				var hasContentDispositionHeader =
					ContentDispositionHeaderValue.TryParse(
						section.ContentDisposition, out var contentDisposition);

				if (hasContentDispositionHeader)
				{
					// This check assumes that there's a file
					// present without form data. If form data
					// is present, this method immediately fails
					// and returns the model error.
					if (!MultipartRequestHelper
						.HasFileContentDisposition(contentDisposition))
					{
						ModelState.AddModelError("File",
							$"The request couldn't be processed (Error 2).");
						// Log error

						return BadRequest(ModelState);
					}
					else
					{
						// Don't trust the file name sent by the client. To display
						// the file name, HTML-encode the value.
						var trustedFileNameForDisplay = WebUtility.HtmlEncode(
								contentDisposition.FileName.Value);
						var trustedFileNameForFileStorage = Path.GetRandomFileName();

						// **WARNING!**
						// In the following example, the file is saved without
						// scanning the file's contents. In most production
						// scenarios, an anti-virus/anti-malware scanner API
						// is used on the file before making the file available
						// for download or for use by other systems. 
						// For more information, see the topic that accompanies 
						// this sample.

						var streamedFileContent = await FileHelpers.ProcessStreamedFile(
							section, contentDisposition, ModelState,
							_permittedExtensions, _fileSizeLimit);

						if (!ModelState.IsValid)
						{
							return BadRequest(ModelState);
						}

						var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId, para saber quem deu upload
						var newPath = Path.Combine(_targetFilePath, userId);
						System.IO.Directory.CreateDirectory(newPath);
						
						using (_context)
						{
							var std = new FileNames()
							{
								UserId = userId,
								FileNameStorage = trustedFileNameForFileStorage,
								FileNameDisplay = trustedFileNameForDisplay
							};
							_context.FileNames.Add(std);
							_context.SaveChanges();
						}

						using (var targetStream = System.IO.File.Create(
							Path.Combine(newPath, trustedFileNameForFileStorage)))
						{
							await targetStream.WriteAsync(streamedFileContent);

							_logger.LogInformation(
								"Uploaded file '{TrustedFileNameForDisplay}' saved to " +
								"'{TargetFilePath}' as {TrustedFileNameForFileStorage}",
								trustedFileNameForDisplay, _targetFilePath,
								trustedFileNameForFileStorage);
						}
					}
				}

				// Drain any remaining section body that hasn't been consumed and
				// read the headers for the next section.
				section = await reader.ReadNextSectionAsync();
			}

			return Created(nameof(FileUploadController), null);
		}


		//troll post, passar parametro pelo header yikes
		[HttpPost]
		//[ValidateAntiForgeryToken]
		public async Task<IActionResult> Remote([FromHeader]string url)
		{
			Uri uri = new Uri(url);
			Stream fileStream = await _httpClient.GetStreamAsync(uri);

			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // will give the user's userId, para saber quem deu upload
			var newPath = Path.Combine(_targetFilePath, userId);
			System.IO.Directory.CreateDirectory(newPath);

			var urlArray = url.Split("\\");
			var trustedFileNameForDisplay = urlArray[urlArray.Length-1];		//last part of url is name 
			var trustedFileNameForFileStorage = Path.GetRandomFileName();

			using (_context)
			{
				var std = new FileNames()
				{
					UserId = userId,
					FileNameStorage = trustedFileNameForFileStorage,
					FileNameDisplay = trustedFileNameForDisplay
				};
				_context.FileNames.Add(std);
				_context.SaveChanges();
			}

			using (var targetStream = System.IO.File.Create(
				Path.Combine(newPath, trustedFileNameForFileStorage)))
			{
				await fileStream.CopyToAsync(targetStream);

				_logger.LogInformation(
					"Uploaded file '{TrustedFileNameForDisplay}' saved to " +
					"'{TargetFilePath}' as {TrustedFileNameForFileStorage}",
					trustedFileNameForDisplay, _targetFilePath,
					trustedFileNameForFileStorage);
			}
			var response = new CreatedResponse(trustedFileNameForDisplay, -1);	//TO DO file size
			return Created(nameof(FileUploadController), response);
		}
	}

	public class CreatedResponse
	{
		public CreatedResponse(string name, long size)
		{
			Name = name;
			Size = size;
		}
		string Name { get; set; }
		long Size { get; set; }
	}
}
