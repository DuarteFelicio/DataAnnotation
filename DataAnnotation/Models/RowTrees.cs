using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class RowTrees
    {
        public RowTrees()
        {
            Nodes = new HashSet<Nodes>();
        }

        public int RowTreesId { get; set; }
        public int CsvColumnsId { get; set; }

        public virtual CsvColumns CsvColumns { get; set; }
        public virtual ICollection<Nodes> Nodes { get; set; }
    }
}
