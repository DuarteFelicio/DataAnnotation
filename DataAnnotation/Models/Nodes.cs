using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class Nodes
    {
        public Nodes()
        {
            InverseParent = new HashSet<Nodes>();
        }

        public int NodesId { get; set; }
        public int RowTreesId { get; set; }
        public int? ParentId { get; set; }
        public int RowIndex { get; set; }
        public string Value { get; set; }

        public virtual Nodes Parent { get; set; }
        public virtual RowTrees RowTrees { get; set; }
        public virtual ICollection<Nodes> InverseParent { get; set; }
    }
}
