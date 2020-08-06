/*
 * Classe de autoria de Nuno Ribeiro reutilizada.
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAnnotation.Models.Analysis
{
	public class DomainInformation
	{
		public List<DivisaoTerritorial> Divisoes { get; set; }
		public List<DivisaoTerritorial> Unidades { get; set; }
	}
}
