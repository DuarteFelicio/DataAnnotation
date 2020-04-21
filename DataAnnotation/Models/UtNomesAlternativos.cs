using System;
using System.Collections.Generic;

namespace DataAnnotation.Models
{
    public partial class UtNomesAlternativos
    {
        public int UnidadesTerritoriaisId { get; set; }
        public int NomesId { get; set; }

        public virtual Nomes Nomes { get; set; }
        public virtual UnidadesTerritoriais UnidadesTerritoriais { get; set; }
    }
}
