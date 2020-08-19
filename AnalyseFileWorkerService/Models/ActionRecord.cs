using System;
using System.Collections.Generic;

namespace AnalyseFileWorkerService.Models
{
    public partial class ActionRecord
    {
        public int ActionRecordId { get; set; }
        public int CsvFileId { get; set; }
        public string Action { get; set; }
        public string Version { get; set; }
        public DateTime ActionTime { get; set; }

        public virtual CsvFile CsvFile { get; set; }
    }
}
