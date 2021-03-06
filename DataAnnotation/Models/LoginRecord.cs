﻿using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class LoginRecord
    {
        public int LoginRecordId { get; set; }
        public string UserId { get; set; }
        public DateTime LoginTime { get; set; }

        public virtual AspNetUsers User { get; set; }
    }
}
