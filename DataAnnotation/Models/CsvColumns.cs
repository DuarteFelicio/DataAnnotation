using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class CsvColumns
    {
        public CsvColumns()
        {
            CsvValues = new HashSet<CsvValues>();
            RowTrees = new HashSet<RowTrees>();
        }

        public int CsvColumnsId { get; set; }
        public int CsvFilesId { get; set; }
        public string ColumnName { get; set; }
        public int ColumnIndex { get; set; }
        public int NullsCount { get; set; }
        public bool AllDifferent { get; set; }
        public string MetricOrDimension { get; set; }
        public string ValuesJson { get; set; }

        public virtual CsvFiles CsvFiles { get; set; }
        public virtual ICollection<CsvValues> CsvValues { get; set; }
        public virtual ICollection<RowTrees> RowTrees { get; set; }
    }
}
