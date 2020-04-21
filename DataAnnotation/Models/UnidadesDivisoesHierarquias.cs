using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class UnidadesDivisoesHierarquias
    {
        public int UnidadesDivisoesHierarquiasId { get; set; }
        public int HierarquiasTerritoriaisId { get; set; }
        public int UnidadesDivisoesId { get; set; }
        public int? ParentId { get; set; }

        public virtual HierarquiasTerritoriais HierarquiasTerritoriais { get; set; }
        public virtual UnidadesDivisoes Parent { get; set; }
        public virtual UnidadesDivisoes UnidadesDivisoes { get; set; }
    }
}
