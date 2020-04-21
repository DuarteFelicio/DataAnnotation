using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class UnidadesDivisoes
    {
        public UnidadesDivisoes()
        {
            UnidadesDivisoesHierarquiasParent = new HashSet<UnidadesDivisoesHierarquias>();
            UnidadesDivisoesHierarquiasUnidadesDivisoes = new HashSet<UnidadesDivisoesHierarquias>();
        }

        public int UnidadesDivisoesId { get; set; }
        public int UnidadesTerritoriaisId { get; set; }
        public int DivisoesTerritoriaisId { get; set; }
        public int? NomesId { get; set; }

        public virtual DivisoesTerritoriais DivisoesTerritoriais { get; set; }
        public virtual Nomes Nomes { get; set; }
        public virtual UnidadesTerritoriais UnidadesTerritoriais { get; set; }
        public virtual ICollection<UnidadesDivisoesHierarquias> UnidadesDivisoesHierarquiasParent { get; set; }
        public virtual ICollection<UnidadesDivisoesHierarquias> UnidadesDivisoesHierarquiasUnidadesDivisoes { get; set; }
    }
}
