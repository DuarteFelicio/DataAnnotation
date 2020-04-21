using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class CsvValues
    {
        public int CsvValuesId { get; set; }
        public int CsvColumnsId { get; set; }
        public string OriginalValue { get; set; }
        public bool IsNull { get; set; }
        public bool IsText { get; set; }
        public bool IsNumeric { get; set; }
        public decimal NumericValue { get; set; }
        public string IntegerOrDecimal { get; set; }

        public virtual CsvColumns CsvColumns { get; set; }
    }
}
