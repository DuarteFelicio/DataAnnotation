using System;
using System.Collections.Generic;

namespace AnalyseFileWorkerService.Models
{
    public partial class UnidadesTerritoriais
    {
        public UnidadesTerritoriais()
        {
            DivisoesTerritoriais = new HashSet<DivisoesTerritoriais>();
            UnidadesDivisoes = new HashSet<UnidadesDivisoes>();
            UtNomesAlternativos = new HashSet<UtNomesAlternativos>();
        }

        public int UnidadesTerritoriaisId { get; set; }
        public int NomesId { get; set; }

        public virtual Nomes Nomes { get; set; }
        public virtual ICollection<DivisoesTerritoriais> DivisoesTerritoriais { get; set; }
        public virtual ICollection<UnidadesDivisoes> UnidadesDivisoes { get; set; }
        public virtual ICollection<UtNomesAlternativos> UtNomesAlternativos { get; set; }
    }
}
