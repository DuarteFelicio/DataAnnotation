using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAnnotation.Models
{
    public class ActionRecord
    {
        public int ActionRecordId { get; set; }
        public int CsvFileId { get; set; }
        public string Action { get; set; }
        public string Version { get; set; }
        public DateTime ActionTime { get; set; }

        public virtual CsvFile CsvFile { get; set; }
    }
}
