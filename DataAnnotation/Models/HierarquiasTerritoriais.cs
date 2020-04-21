using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class HierarquiasTerritoriais
    {
        public HierarquiasTerritoriais()
        {
            HtNomesAlternativos = new HashSet<HtNomesAlternativos>();
            UnidadesDivisoesHierarquias = new HashSet<UnidadesDivisoesHierarquias>();
        }

        public int HierarquiasTerritoriaisId { get; set; }
        public int NomesId { get; set; }
        public string Descricao { get; set; }

        public virtual Nomes Nomes { get; set; }
        public virtual ICollection<HtNomesAlternativos> HtNomesAlternativos { get; set; }
        public virtual ICollection<UnidadesDivisoesHierarquias> UnidadesDivisoesHierarquias { get; set; }
    }
}
