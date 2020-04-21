using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class DtNomesAlternativos
    {
        public int DivisoesTerritoriaisId { get; set; }
        public int NomesId { get; set; }

        public virtual DivisoesTerritoriais DivisoesTerritoriais { get; set; }
        public virtual Nomes Nomes { get; set; }
    }
}
