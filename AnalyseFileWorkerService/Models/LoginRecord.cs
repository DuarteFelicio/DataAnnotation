using System;
using System.Collections.Generic;

namespace AnalyseFileWorkerService.Models
{
    public partial class LoginRecord
    {
        public int LoginRecordId { get; set; }
        public string UserId { get; set; }
        public DateTime LoginTime { get; set; }
    }
}
