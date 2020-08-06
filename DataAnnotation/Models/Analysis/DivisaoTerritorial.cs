/*
 * Classe de autoria de Nuno Ribeiro reutilizada.
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAnnotation.Models.Analysis
{
	public class DivisaoTerritorial
	{
		public int? DivisoesTerritoriaisId { get; set; }
		public string Nome { get; set; }
		public int? UnidadesTerritoriaisId { get; set; }
		public int? UnidadesDivisoesId { get; set; }
		public int IsUnidadeDivisao { get; set; }
		public List<int> Rows { get; set; }

		public int Count { get; set; }
	}

	public class DivisaoTerritorialComparer : IComparer<DivisaoTerritorial>
	{
		public int Compare(DivisaoTerritorial x, DivisaoTerritorial y)
		{
			return x.Count.CompareTo(y.Count);
		}
	}
}

