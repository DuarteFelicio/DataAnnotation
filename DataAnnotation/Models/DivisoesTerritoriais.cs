using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class DivisoesTerritoriais
    {
        public DivisoesTerritoriais()
        {
            DtNomesAlternativos = new HashSet<DtNomesAlternativos>();
            UnidadesDivisoes = new HashSet<UnidadesDivisoes>();
        }

        public int DivisoesTerritoriaisId { get; set; }
        public int NomesId { get; set; }
        public int? UnidadesTerritoriaisId { get; set; }
        public string Descricao { get; set; }

        public virtual Nomes Nomes { get; set; }
        public virtual UnidadesTerritoriais UnidadesTerritoriais { get; set; }
        public virtual ICollection<DtNomesAlternativos> DtNomesAlternativos { get; set; }
        public virtual ICollection<UnidadesDivisoes> UnidadesDivisoes { get; set; }
    }
}
