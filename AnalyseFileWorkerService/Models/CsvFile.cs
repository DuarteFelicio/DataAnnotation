using System;
using System.Collections.Generic;

namespace AnalyseFileWorkerService.Models
{
    public partial class CsvFile
    {
        public int CsvFilesId { get; set; }
        public string UserId { get; set; }
        public int? RowsCount { get; set; }
        public int? ColumnsCount { get; set; }
        public DateTime UploadTime { get; set; }
        public long Size { get; set; }
        public string Origin { get; set; }
        public string FileNameStorage { get; set; }
        public string FileNameDisplay { get; set; }
        public TimeSpan? AnalysisDuration { get; set; }
        public DateTime? AnalysisCompletionTime { get; set; }
    }
}
