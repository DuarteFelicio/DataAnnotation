using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class Nomes
    {
        public Nomes()
        {
            DivisoesTerritoriais = new HashSet<DivisoesTerritoriais>();
            DtNomesAlternativos = new HashSet<DtNomesAlternativos>();
            HierarquiasTerritoriais = new HashSet<HierarquiasTerritoriais>();
            HtNomesAlternativos = new HashSet<HtNomesAlternativos>();
            UnidadesTerritoriais = new HashSet<UnidadesTerritoriais>();
            UtNomesAlternativos = new HashSet<UtNomesAlternativos>();
        }

        public int NomesId { get; set; }
        public string Nome { get; set; }
        public string Idioma { get; set; }

        public virtual UnidadesDivisoes UnidadesDivisoes { get; set; }
        public virtual ICollection<DivisoesTerritoriais> DivisoesTerritoriais { get; set; }
        public virtual ICollection<DtNomesAlternativos> DtNomesAlternativos { get; set; }
        public virtual ICollection<HierarquiasTerritoriais> HierarquiasTerritoriais { get; set; }
        public virtual ICollection<HtNomesAlternativos> HtNomesAlternativos { get; set; }
        public virtual ICollection<UnidadesTerritoriais> UnidadesTerritoriais { get; set; }
        public virtual ICollection<UtNomesAlternativos> UtNomesAlternativos { get; set; }
    }
}
