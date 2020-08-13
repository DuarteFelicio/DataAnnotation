using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class ActionRecord
    {
        public int ActionRecordId { get; set; }
        public int CsvFileId { get; set; }
        public string Action { get; set; }
        public string Version { get; set; }
        public DateTime LoginTime { get; set; }

        public virtual CsvFile CsvFile { get; set; }
    }
}
