using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class FileNames
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string FileNameStorage { get; set; }
        public string FileNameDisplay { get; set; }
    }
}
