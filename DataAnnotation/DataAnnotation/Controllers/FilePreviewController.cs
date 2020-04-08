using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebApplicationDemo.Controllers
{
    [Route("api/[controller]")]
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
            FilePreview prev = new FilePreview();
            prev.FirstLines = new List<string>();
			if(!files.Any())
			{
				prev.NumCol = 69;
				return prev;
			}
            using (var reader = new StreamReader(files.First().OpenReadStream()))
            {
                prev.FirstLines.Add(reader.ReadLine());
                prev.FirstLines.Add(reader.ReadLine());
                prev.FirstLines.Add(reader.ReadLine());
            }
            return prev;
        }

        [HttpGet]
        public FilePreview Get()
        {
			FilePreview prev = new FilePreview();
			prev.FirstLines = new List<string>();
			prev.NumCol = 10;
			return prev;
        }
    }
}
