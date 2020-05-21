using System;
using System.Collections.Generic;

namespace AnalyseFileWorkerService.Models
{
    public partial class HtNomesAlternativos
    {
        public int HierarquiasTerritoriaisId { get; set; }
        public int NomesId { get; set; }

        public virtual HierarquiasTerritoriais HierarquiasTerritoriais { get; set; }
        public virtual Nomes Nomes { get; set; }
    }
}
