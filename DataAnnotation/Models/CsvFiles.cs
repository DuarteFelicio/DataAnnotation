using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class CsvFiles
    {
        public CsvFiles()
        {
            CsvColumns = new HashSet<CsvColumns>();
        }

        public int CsvFilesId { get; set; }
        public string UserId { get; set; }
        public int? RowsCount { get; set; }
        public int? ColumnsCount { get; set; }
        public long Size { get; set; }
        public string Origin { get; set; }
        public string FileNameStorage { get; set; }
        public string FileNameDisplay { get; set; }

        public virtual ICollection<CsvColumns> CsvColumns { get; set; }
    }
}
